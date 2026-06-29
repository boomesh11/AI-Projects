import urllib.request
import urllib.error
import socket
import json
import logging
from app.core import config
from app.ai.base_provider import BaseProvider

logger = logging.getLogger("app.ai.ollama_client")


class OllamaClient(BaseProvider):
    """Concrete AI provider that communicates with a local Ollama server.

    Implements the ``BaseProvider`` interface so it can be swapped out for
    any future provider (OpenAI, NVIDIA, Claude, …) without touching
    business logic.

    Configuration is read exclusively from ``app.core.config`` which in
    turn reads from the ``.env`` file.  Changing ``OLLAMA_HOST`` or
    ``OLLAMA_MODEL`` requires only a ``.env`` edit — no source changes.
    """

    def __init__(self):
        self.host = config.OLLAMA_HOST.rstrip("/")
        self.model = config.OLLAMA_MODEL
        logger.info(
            f"OllamaClient initialised — host='{self.host}' model='{self.model}'"
        )

    def generate(self, prompt: str, system: str | None = None) -> str:
        """Call the Ollama ``/api/generate`` endpoint and return the raw text.

        Args:
            prompt: The user-facing prompt text.
            system: Optional system-role instruction for the model.

        Returns:
            The raw string response from Ollama (not yet validated/parsed).

        Raises:
            TimeoutError: If the Ollama server does not respond within the
                configured timeout window.
            ConnectionError: If the Ollama server is unreachable for any
                other network reason.
            ValueError: If Ollama returns a non-JSON payload.
        """
        url = f"{self.host}/api/generate"
        payload: dict = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {
                "temperature": 0.0
            },
        }

        if system:
            payload["system"] = system

        headers = {"Content-Type": "application/json"}

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST",
        )

        logger.info(
            f"Sending request to Ollama — url='{url}' model='{self.model}'"
        )

        try:
            with urllib.request.urlopen(req, timeout=90) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                raw_text = res_data.get("response", "").strip()
                logger.info(
                    f"Ollama responded successfully — "
                    f"response_length={len(raw_text)} chars"
                )
                return raw_text

        except socket.timeout as e:
            logger.error(
                f"Ollama request timed out after 90s — host='{self.host}': {e}"
            )
            raise TimeoutError(
                f"Ollama server at '{self.host}' did not respond within the "
                f"timeout window. Check that the model '{self.model}' is loaded "
                f"and the server is healthy."
            ) from e

        except urllib.error.URLError as e:
            # Distinguish socket-level timeouts wrapped inside URLError
            if isinstance(e.reason, socket.timeout):
                logger.error(
                    f"Ollama request timed out (URLError wrapper) — "
                    f"host='{self.host}': {e}"
                )
                raise TimeoutError(
                    f"Ollama server at '{self.host}' did not respond within the "
                    f"timeout window."
                ) from e

            logger.error(
                f"Failed to connect to Ollama server at '{self.host}': {e}"
            )
            raise ConnectionError(
                f"Failed to connect to Ollama server at '{self.host}': {e}"
            ) from e

        except json.JSONDecodeError as e:
            logger.error(
                f"Ollama returned an invalid JSON payload: {e}"
            )
            raise ValueError(
                f"Ollama server returned an invalid JSON response: {e}"
            ) from e
