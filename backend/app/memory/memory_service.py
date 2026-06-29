"""MemoryService — stateful session memory business logic.

This is the only component that understands *what* to store and *how*
to summarise it for consumption by the AI provider and the Planner.

It depends on ``BaseMemoryStore`` exclusively — never on a concrete
storage class.  The store is injected at construction time, making
MemoryService fully testable in isolation.

Architecture position
---------------------
  IntentEngine → MemoryService.remember()  (write after each command)
  IntentEngine → MemoryService.recall()    (read before AI call)
  Planner      → MemoryService.recall()    (read for entity enrichment)
"""

import logging
from typing import Any
from app.memory.base_store import BaseMemoryStore
from app.memory.session_context import SessionContext

logger = logging.getLogger("app.memory.memory_service")

# Intents that write to active_employee
_EMPLOYEE_INTENTS = {"create_employee"}

# Intents that write to active_project
_PROJECT_INTENTS = {"create_project"}


class MemoryService:
    """Stateful session memory — the single source of truth for session state.

    Parameters
    ----------
    store:
        Any implementation of BaseMemoryStore (InMemoryStore, RedisStore, …).
    """

    def __init__(self, store: BaseMemoryStore) -> None:
        self._store = store

    # ------------------------------------------------------------------
    # Core API (required by architecture spec)
    # ------------------------------------------------------------------

    def remember(
        self,
        session_id: str,
        intent_name: str,
        entities: dict[str, Any],
        raw_text: str,
    ) -> SessionContext:
        """Record one completed command into session memory.

        Creates a new session if *session_id* does not exist yet.

        Args:
            session_id:  Session identifier.
            intent_name: Validated intent string (e.g. "create_employee").
            entities:    Entities extracted from this command.
            raw_text:    The original user input text.

        Returns:
            The updated SessionContext after writing.
        """
        ctx = self._store.get(session_id)
        if ctx is None:
            ctx = SessionContext(session_id=session_id)
            logger.info(f"New session created — id='{session_id}'")

        (
            ctx
            .push_intent(intent_name)
            .push_command(raw_text)
            .merge_entities(entities)
            .update_active_references(intent_name, entities)
            .touch()
        )

        self._store.set(session_id, ctx)
        logger.info(
            f"Memory updated — session='{session_id}' "
            f"intent='{intent_name}' "
            f"active_employee='{ctx.active_employee}' "
            f"active_project='{ctx.active_project}'"
        )
        return ctx

    def recall(self, session_id: str) -> SessionContext | None:
        """Return the current SessionContext, or None for an unknown session.

        This is a read-only operation — it does not touch last_updated.
        """
        ctx = self._store.get(session_id)
        if ctx is None:
            logger.debug(f"recall('{session_id}') → no session found")
        return ctx

    def clear(self, session_id: str) -> bool:
        """Permanently delete a session.

        Returns:
            True if the session existed and was cleared, False otherwise.
        """
        result = self._store.delete(session_id)
        logger.info(
            f"clear('{session_id}') → {'cleared' if result else 'not found'}"
        )
        return result

    def set_pending_action(self, session_id: str, intent_name: str | None, missing_fields: list[str] | None = None) -> SessionContext:
        """Store or clear the pending intent and missing fields in session memory."""
        ctx = self._store.get(session_id)
        if ctx is None:
            ctx = SessionContext(session_id=session_id)
            logger.info(f"New session created via set_pending_action — id='{session_id}'")
        
        ctx.set_pending_action(intent_name, missing_fields).touch()
        self._store.set(session_id, ctx)
        logger.info(f"Pending action updated — session='{session_id}' pending_intent='{intent_name}' missing_fields={missing_fields}")
        return ctx

    def current_context(self, session_id: str) -> dict[str, Any]:
        """Return a compact summary dict suitable for injecting into AI prompts.

        Always returns a dict (never None).  When no session exists, all
        values are None / empty so the prompt renders cleanly.

        Structure
        ---------
        {
          "has_context":       bool,
          "active_employee":   str | None,
          "active_project":    str | None,
          "current_workspace": str | None,
          "recent_intents":    list[str],
          "recent_entities":   dict,
          "command_count":     int,
          "last_command":      str | None,
        }
        """
        ctx = self._store.get(session_id)
        if ctx is None:
            return {
                "has_context": False,
                "active_employee": None,
                "active_project": None,
                "current_workspace": None,
                "recent_intents": [],
                "recent_entities": {},
                "command_count": 0,
                "last_command": None,
                "pending_intent": None,
                "missing_fields": [],
            }

        return {
            "has_context": True,
            "active_employee": ctx.active_employee,
            "active_project": ctx.active_project,
            "current_workspace": ctx.current_workspace,
            "recent_intents": ctx.recent_intents[-5:],   # last 5 only
            "recent_entities": ctx.extracted_entities,
            "command_count": len(ctx.command_history),
            "last_command": ctx.command_history[-1] if ctx.command_history else None,
            "pending_intent": ctx.pending_intent,
            "missing_fields": ctx.missing_fields,
        }

    # ------------------------------------------------------------------
    # Utility
    # ------------------------------------------------------------------

    def all_session_ids(self) -> list[str]:
        """Return all active session IDs from the backing store."""
        return self._store.all_session_ids()

    def prune_expired_sessions(self, ttl_seconds: float | None = None) -> int:
        """Delegate TTL eviction to the backing store."""
        return self._store.prune_expired(ttl_seconds)
