"""BaseMemoryStore — abstract storage contract for session data.

Business logic (MemoryService, Planner, IntentEngine) must only ever
depend on this interface, never on a concrete implementation.

To swap storage backends (e.g. InMemory → Redis) set MEMORY_BACKEND in
.env and wire the new implementation in app/memory/__init__.py.
No other files need to change.
"""

from abc import ABC, abstractmethod
from app.memory.session_context import SessionContext


class BaseMemoryStore(ABC):
    """Abstract contract that every storage backend must implement.

    All methods are synchronous. Async variants can be added later if
    an async Redis client is adopted.
    """

    @abstractmethod
    def get(self, session_id: str) -> SessionContext | None:
        """Return the SessionContext for *session_id*, or None if absent."""
        ...

    @abstractmethod
    def set(self, session_id: str, context: SessionContext) -> None:
        """Persist *context* under *session_id*, overwriting any existing value."""
        ...

    @abstractmethod
    def delete(self, session_id: str) -> bool:
        """Remove the session.  Returns True if it existed, False otherwise."""
        ...

    @abstractmethod
    def all_session_ids(self) -> list[str]:
        """Return a list of all active session IDs currently in the store."""
        ...

    @abstractmethod
    def prune_expired(self, ttl_seconds: float) -> int:
        """Evict sessions whose last_updated is older than *ttl_seconds*.

        Returns the number of sessions evicted.
        """
        ...
