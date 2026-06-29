"""InMemoryStore — thread-safe, TTL-aware in-process session storage.

This is the default backend for development and single-process deployments.

Swap to Redis
-------------
1. Create ``app/memory/redis_store.py`` implementing ``BaseMemoryStore``.
2. Add ``MEMORY_BACKEND=redis`` to ``.env``.
3. Register the new class in ``app/memory/__init__.py``.
No other files need to change.
"""

import time
import threading
import logging
from app.memory.base_store import BaseMemoryStore
from app.memory.session_context import SessionContext

logger = logging.getLogger("app.memory.in_memory_store")


class InMemoryStore(BaseMemoryStore):
    """Pure in-process dict-backed session store.

    All public methods acquire a reentrant lock so the store is safe
    to use from concurrent FastAPI request handlers.

    Parameters
    ----------
    ttl_seconds:
        Sessions not accessed within this window are eligible for
        eviction on the next call to ``prune_expired()``.
    """

    def __init__(self, ttl_seconds: float = 3600.0):
        self._store: dict[str, SessionContext] = {}
        self._lock = threading.RLock()
        self._ttl = ttl_seconds
        logger.info(
            f"InMemoryStore initialised — ttl={self._ttl}s"
        )

    # ------------------------------------------------------------------
    # BaseMemoryStore interface
    # ------------------------------------------------------------------

    def get(self, session_id: str) -> SessionContext | None:
        """Return SessionContext for *session_id*, or None if missing/expired."""
        with self._lock:
            ctx = self._store.get(session_id)
            if ctx is None:
                return None
            # Lazy TTL check on read
            if self._is_expired(ctx):
                logger.debug(
                    f"Session '{session_id}' expired on read — evicting"
                )
                del self._store[session_id]
                return None
            return ctx

    def set(self, session_id: str, context: SessionContext) -> None:
        """Persist *context* under *session_id*."""
        with self._lock:
            context.touch()
            self._store[session_id] = context
            logger.debug(
                f"Session '{session_id}' written — "
                f"intents={len(context.recent_intents)} "
                f"commands={len(context.command_history)}"
            )

    def delete(self, session_id: str) -> bool:
        """Remove a session.  Returns True if it existed."""
        with self._lock:
            if session_id in self._store:
                del self._store[session_id]
                logger.info(f"Session '{session_id}' deleted")
                return True
            return False

    def all_session_ids(self) -> list[str]:
        """Return all currently held session IDs (including expired ones)."""
        with self._lock:
            return list(self._store.keys())

    def prune_expired(self, ttl_seconds: float | None = None) -> int:
        """Evict all sessions older than *ttl_seconds* (defaults to store TTL).

        Returns the count of evicted sessions.
        """
        threshold = ttl_seconds if ttl_seconds is not None else self._ttl
        evicted = 0
        with self._lock:
            expired = [
                sid for sid, ctx in self._store.items()
                if (time.time() - ctx.last_updated) > threshold
            ]
            for sid in expired:
                del self._store[sid]
                evicted += 1
        if evicted:
            logger.info(f"Pruned {evicted} expired session(s)")
        return evicted

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _is_expired(self, ctx: SessionContext) -> bool:
        return (time.time() - ctx.last_updated) > self._ttl

    @property
    def active_session_count(self) -> int:
        """Number of non-expired sessions currently held."""
        with self._lock:
            return sum(
                1 for ctx in self._store.values()
                if not self._is_expired(ctx)
            )
