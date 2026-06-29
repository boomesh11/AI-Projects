from abc import ABC, abstractmethod


class BaseProvider(ABC):
    """Abstract interface that every AI provider must implement.

    The rest of Catalyst Studio depends only on this contract.
    No business logic may import a concrete provider class directly.
    Only ``provider.py`` (the factory layer) is allowed to instantiate
    concrete providers.

    Supported future implementations:
        - OllamaClient  (Qwen3, Gemma, …)
        - NvidiaProvider
        - OpenAIProvider
        - ClaudeProvider
    """

    @abstractmethod
    def generate(self, prompt: str, system: str | None = None) -> str:
        """Send a prompt to the underlying model and return the raw text response.

        Args:
            prompt: The user-facing prompt text.
            system: Optional system-role instruction for the model.

        Returns:
            The raw string response from the model (not yet validated).

        Raises:
            ConnectionError: If the provider endpoint is unreachable.
            TimeoutError: If the provider does not respond within the deadline.
            ValueError: If the provider returns a non-parseable payload.
        """
        ...
