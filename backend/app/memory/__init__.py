"""app/memory — Session Memory package for Catalyst Studio.

Public surface
--------------
  MemoryService   — business logic class
  session_memory  — application-wide singleton (InMemoryStore-backed)

Swap storage backend
--------------------
  1. Implement a new class that extends BaseMemoryStore.
  2. Set MEMORY_BACKEND=<name> in .env.
  3. Add the new class to _STORE_REGISTRY below.
  No other files need to change.
"""

import logging
from app.core import config
from app.memory.base_store import BaseMemoryStore
from app.memory.in_memory_store import InMemoryStore
from app.memory.memory_service import MemoryService

logger = logging.getLogger("app.memory")

# ---------------------------------------------------------------------------
# Storage backend registry — add new backends here
# ---------------------------------------------------------------------------
_STORE_REGISTRY: dict[str, type[BaseMemoryStore]] = {
    "memory": InMemoryStore,
    # "redis": RedisStore,   ← future: add without touching any other file
}


def _build_store() -> BaseMemoryStore:
    """Construct the configured storage backend from the registry."""
    backend = getattr(config, "MEMORY_BACKEND", "memory").lower()
    store_class = _STORE_REGISTRY.get(backend)
    if store_class is None:
        known = ", ".join(f"'{k}'" for k in _STORE_REGISTRY)
        raise ValueError(
            f"Unsupported MEMORY_BACKEND: '{backend}'. "
            f"Valid options: {known}. Check your .env file."
        )
    ttl = float(getattr(config, "SESSION_TTL_SECONDS", 3600))
    logger.info(
        f"Memory backend: '{backend}' ({store_class.__name__}) — TTL={ttl}s"
    )
    return store_class(ttl_seconds=ttl)


# Application-wide singleton — import this everywhere.
session_memory = MemoryService(store=_build_store())

__all__ = ["MemoryService", "session_memory", "BaseMemoryStore"]
