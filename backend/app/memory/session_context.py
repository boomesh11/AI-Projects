"""SessionContext — the data model for a single user session.

This is the contract between MemoryService, the Planner, and the AI provider.
It is a pure Pydantic model with no I/O or business logic.
"""

import time
from typing import Any
from pydantic import BaseModel, Field


# Maximum number of items kept in bounded lists.
# Kept as module-level constants so nothing is hardcoded deeper in the call stack.
MAX_INTENTS = 10
MAX_COMMANDS = 20


class SessionContext(BaseModel):
    """Represents the full mutable state of one user session.

    Fields
    ------
    session_id:
        Unique identifier for this session (provided by caller).
    recent_intents:
        Ring buffer of the last MAX_INTENTS intent names, most-recent last.
    extracted_entities:
        Merged entity map accumulated across all commands in this session.
        Later values overwrite earlier ones for the same key.
    active_employee:
        Name of the most recently referenced employee.  Used by the Planner
        to resolve pronouns such as "him", "her", "them".
    active_project:
        Name of the most recently referenced project.
    current_workspace:
        Logical workspace that the user is currently operating in
        (e.g. "employees", "projects", "inventory").
    command_history:
        Ring buffer of raw user text, most-recent last, capped at MAX_COMMANDS.
    last_updated:
        Unix timestamp (float) of the last write.  Used for TTL eviction.
    """

    session_id: str
    recent_intents: list[str] = Field(default_factory=list)
    extracted_entities: dict[str, Any] = Field(default_factory=dict)
    active_employee: str | None = None
    active_project: str | None = None
    current_workspace: str | None = None
    command_history: list[str] = Field(default_factory=list)
    last_updated: float = Field(default_factory=time.time)
    pending_intent: str | None = None
    missing_fields: list[str] = Field(default_factory=list)

    # ------------------------------------------------------------------
    # Mutation helpers — all return self for fluent chaining
    # ------------------------------------------------------------------

    def set_pending_action(self, intent_name: str | None, missing_fields: list[str] | None = None) -> "SessionContext":
        """Store or clear the pending intent and missing fields."""
        self.pending_intent = intent_name
        self.missing_fields = missing_fields or []
        return self

    def push_intent(self, intent_name: str) -> "SessionContext":
        """Append intent to the ring buffer, evicting oldest if over cap."""
        self.recent_intents.append(intent_name)
        if len(self.recent_intents) > MAX_INTENTS:
            self.recent_intents = self.recent_intents[-MAX_INTENTS:]
        return self

    def push_command(self, raw_text: str) -> "SessionContext":
        """Append raw command text, evicting oldest if over cap."""
        self.command_history.append(raw_text)
        if len(self.command_history) > MAX_COMMANDS:
            self.command_history = self.command_history[-MAX_COMMANDS:]
        return self

    def merge_entities(self, entities: dict[str, Any]) -> "SessionContext":
        """Merge new entities into the accumulated entity map.

        New values overwrite old ones for the same key.
        Empty-string values are ignored to avoid clobbering good data.
        """
        for k, v in entities.items():
            if v not in (None, "", [], {}):
                self.extracted_entities[k] = v
        return self

    def update_active_references(self, intent_name: str, entities: dict[str, Any]) -> "SessionContext":
        """Update active_employee / active_project / current_workspace
        based on the current intent and extracted entities.
        """
        # Employee reference
        if intent_name == "create_employee":
            self.current_workspace = "employees"
            if entities.get("name"):
                self.active_employee = entities["name"]

        # Project reference
        elif intent_name == "create_project":
            self.current_workspace = "projects"
            if entities.get("project_name"):
                self.active_project = entities["project_name"]

        elif intent_name == "inventory_query":
            self.current_workspace = "inventory"

        return self

    def touch(self) -> "SessionContext":
        """Refresh the last_updated timestamp."""
        self.last_updated = time.time()
        return self
