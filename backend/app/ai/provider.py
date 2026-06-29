"""AI Provider factory and entry point for Catalyst Studio.

Architecture
------------
User → IntentEngine → **provider.analyze()** → Validator → Intent → Planner

This module is the **only** place in the codebase that may:
  - Import concrete provider classes (OllamaClient, …)
  - Communicate with any AI model

All other modules must interact with AI exclusively through the
``analyze()`` function exported from here.

Context injection
-----------------
When a session_id is present, the caller passes a context dict obtained
from ``MemoryService.current_context()``.  This dict is formatted into
the ``{context_block}`` placeholder inside ``system_v2.txt`` so the
model can resolve pronouns and ambiguous references.

Adding a new provider (OpenAI, NVIDIA, Claude, …) requires:
  1. Creating a new class that implements ``BaseProvider``.
  2. Adding a new branch in ``_get_provider()`` below.
  3. Setting ``PROVIDER_TYPE=<name>`` in the ``.env`` file.
  No other Python files need to be modified.
"""

import time
import logging
from pathlib import Path
from app.core import config
from app.ai.base_provider import BaseProvider
from app.ai.ollama_client import OllamaClient
from app.ai.validator import validate_and_parse
from app.ai.metrics import metrics_tracker
from app.debug_logger import log_debug_stage

logger = logging.getLogger("app.ai.provider")

# ---------------------------------------------------------------------------
# Provider registry — add new providers here
# ---------------------------------------------------------------------------
_PROVIDER_REGISTRY: dict[str, type[BaseProvider]] = {
    "ollama": OllamaClient,
    # "openai": OpenAIClient,   ← future: add without touching any other file
    # "nvidia": NvidiaClient,
    # "claude": ClaudeClient,
}

# Lazy singleton — initialised on first call to analyze()
_provider_instance: BaseProvider | None = None


def _get_provider() -> BaseProvider:
    """Return (and lazily initialise) the configured AI provider.

    Reads ``PROVIDER_TYPE`` from config (sourced from ``.env``).
    Raises ``ValueError`` with a clear message if the type is unknown.
    """
    global _provider_instance
    if _provider_instance is not None:
        return _provider_instance

    provider_type = config.PROVIDER_TYPE.lower()
    provider_class = _PROVIDER_REGISTRY.get(provider_type)

    if provider_class is None:
        known = ", ".join(f"'{k}'" for k in _PROVIDER_REGISTRY)
        raise ValueError(
            f"Unsupported provider type: '{config.PROVIDER_TYPE}'. "
            f"Valid options are: {known}. "
            f"Update PROVIDER_TYPE in your .env file."
        )

    logger.info(
        f"Initialising AI provider — type='{provider_type}' "
        f"class='{provider_class.__name__}'"
    )
    _provider_instance = provider_class()
    return _provider_instance


def _load_prompt_file(filename: str) -> str:
    """Read a prompt template from the filesystem.

    Prompt files live in ``app/ai/prompts/`` and are referenced by name
    via ``.env`` (``PROMPT_SYSTEM_FILE``, ``PROMPT_USER_FILE``).
    No prompt text may be hardcoded inside Python source files.
    """
    prompt_dir = Path(__file__).parent / "prompts"
    prompt_path = prompt_dir / filename
    try:
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read().strip()
    except Exception as e:
        logger.error(
            f"Failed to load prompt file '{filename}' from '{prompt_path}': {e}"
        )
        raise IOError(
            f"Prompt configuration file '{filename}' could not be loaded: {e}"
        ) from e


def _format_context_block(context: dict | None) -> str:
    """Render a session context dict as a human-readable string for the prompt.

    When context is None or empty, returns a sentinel string that tells the
    model there is no prior context to consider.
    """
    if not context or not context.get("has_context"):
        return "No prior context."

    lines: list[str] = []
    if context.get("active_employee"):
        lines.append(f"Active employee: {context['active_employee']}")
    if context.get("active_project"):
        lines.append(f"Active project: {context['active_project']}")
    if context.get("current_workspace"):
        lines.append(f"Current workspace: {context['current_workspace']}")
    if context.get("recent_intents"):
        lines.append(f"Recent intents: {', '.join(context['recent_intents'])}")
    if context.get("last_command"):
        lines.append(f"Last command: \"{context['last_command']}\"")
    if context.get("recent_entities"):
        entity_pairs = ", ".join(
            f"{k}={v}" for k, v in context["recent_entities"].items()
        )
        lines.append(f"Known entities: {entity_pairs}")

    return "\n".join(lines) if lines else "No prior context."


def analyze(text: str, context: dict | None = None) -> dict:
    """Analyze user input and return a validated intent dictionary.

    This is the **single public entry point** for the entire AI layer.

    Flow:
        text → prompt formatting → provider.generate() →
        validate_and_parse() → validated dict

    Metrics are updated for every outcome (success, provider failure,
    validation failure).

    Args:
        text: Raw natural language input from the user.

    Returns:
        Validated dict with keys: ``intent``, ``confidence``, ``entities``.

    Raises:
        IOError: If a required prompt file cannot be read.
        ConnectionError: If the AI provider endpoint is unreachable.
        TimeoutError: If the AI provider does not respond in time.
        ValueError: If PROVIDER_TYPE is unsupported or response is malformed.
        AIException subclass: If validation of the AI response fails.
    """
    logger.info(f"Incoming analyze request — text='{text}' has_context={bool(context and context.get('has_context'))}")

    log_debug_stage(
        stage_name="4. provider.analyze()",
        raw_input=text,
    )

    start_time = time.perf_counter()

    # 1. Load prompt templates dynamically from filesystem
    try:
        system_prompt_template = _load_prompt_file(config.PROMPT_SYSTEM_FILE)
        user_prompt_template = _load_prompt_file(config.PROMPT_USER_FILE)
    except IOError as e:
        metrics_tracker.record_ollama_failure()
        raise

    # 2. Inject context block + user text into prompt templates
    context_block = _format_context_block(context)
    system_prompt = system_prompt_template.replace("{context_block}", context_block)
    user_prompt = user_prompt_template.replace("{text}", text)

    # 3. Obtain the configured provider and call the model
    try:
        provider = _get_provider()
        logger.info(
            f"Querying provider '{type(provider).__name__}' — "
            f"model='{config.OLLAMA_MODEL}' (where applicable)"
        )
        raw_response = provider.generate(user_prompt, system=system_prompt)
        
        log_debug_stage(
            stage_name="5. Raw Ollama response",
            raw_input=raw_response,
        )
        
        logger.info("-" * 36)
        logger.info("Incoming user text:")
        logger.info(text)
        logger.info("Provider selected:")
        logger.info(type(provider).__name__)
        logger.info("Model name:")
        logger.info(config.OLLAMA_MODEL)
        logger.info("Prompt sent to Ollama:")
        logger.info(user_prompt)
        logger.info("Raw Ollama response:")
        logger.info(raw_response)
        logger.info("-" * 36)
        
    except (ConnectionError, TimeoutError, ValueError) as e:
        metrics_tracker.record_ollama_failure()
        logger.error(f"Provider call failed: {type(e).__name__}: {e}")
        raise

    # 4. Validate the raw response — never allow unvalidated data to reach Planner
    try:
        validated_data = validate_and_parse(raw_response)
        
        logger.info("-" * 36)
        logger.info("Parsed JSON & Validated Intent:")
        logger.info(validated_data)
        logger.info("-" * 36)
        
        elapsed = time.perf_counter() - start_time
        metrics_tracker.record_success(elapsed)
        logger.info(
            f"Analysis succeeded — intent='{validated_data['intent']}' "
            f"confidence={validated_data['confidence']} "
            f"latency={elapsed:.4f}s"
        )
        return validated_data
    except Exception as e:
        metrics_tracker.record_validation_failure()
        logger.warning(
            f"Validation failed — raw_response='{raw_response}' "
            f"error={type(e).__name__}: {e}"
        )
        raise
