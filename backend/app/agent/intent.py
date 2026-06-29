"""IntentEngine — natural language to Intent with full session memory integration.

Pipeline position (after this milestone)
-----------------------------------------
  User text + session_id
    → recall session context  (MemoryService.current_context)
    → provider.analyze(text, context)  (Qwen3 receives prior context)
    → validate_and_parse
    → MemoryService.remember  (persist intent + entities)
    → Intent returned to Planner
"""

import logging
from app.schemas.intent import Intent
from app.ai import provider
from app.memory import session_memory
from app.debug_logger import log_debug_stage

logger = logging.getLogger("app.agent.intent")


class IntentEngine:
    """Detect intent from natural language, with session memory support.

    Parameters
    ----------
    session_id:
        When provided, the engine reads prior context before calling the
        AI provider and writes the result back to memory after.
        When omitted, the engine operates statelessly (backwards-compatible).
    """

    def detect(self, text: str, session_id: str | None = None) -> Intent:
        """Analyze *text* and return a validated Intent.

        Steps
        -----
        1. Recall session context (empty if no session_id).
        2. Forward text + context to the AI provider (Qwen3).
        3. Persist the result into session memory.
        4. Return the structured Intent.

        Args:
            text:       Raw user input.
            session_id: Session identifier.  None → stateless mode.

        Returns:
            A validated Intent with intent name, confidence, and entities.
        """
        log_debug_stage(
            stage_name="3. IntentEngine.detect()",
            raw_input=text,
        )
        # 1. Read prior session context for injection into the AI prompt
        context_dict: dict | None = None
        if session_id:
            context_dict = session_memory.current_context(session_id)
            has_ctx = context_dict.get("has_context", False)
            logger.info(
                f"IntentEngine: session='{session_id}' "
                f"has_prior_context={has_ctx}"
            )

        # 2. Call the AI provider — context is injected into {context_block}
        res = provider.analyze(text, context=context_dict)

        # 3. Persist the outcome into session memory
        if session_id:
            session_memory.remember(
                session_id=session_id,
                intent_name=res["intent"],
                entities=res.get("entities", {}),
                raw_text=text,
            )
            logger.info(
                f"IntentEngine: memory updated — session='{session_id}' "
                f"intent='{res['intent']}'"
            )

        # 4. Return the structured Intent
        return Intent(
            intent=res["intent"],
            confidence=res["confidence"],
            entities=res.get("entities", {}),
        )