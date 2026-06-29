"""API-facing Pydantic schemas for session memory endpoints.

Kept separate from the internal SessionContext model so that the
public API contract can evolve independently from the storage model.
"""

from typing import Any
from pydantic import BaseModel


class SessionContextResponse(BaseModel):
    """Full session state returned by GET /session/{session_id}."""

    session_id: str
    recent_intents: list[str]
    extracted_entities: dict[str, Any]
    active_employee: str | None
    active_project: str | None
    current_workspace: str | None
    command_history: list[str]
    last_updated: float


class SessionHistoryResponse(BaseModel):
    """Abbreviated history returned by GET /session/{session_id}/history."""

    session_id: str
    command_count: int
    command_history: list[str]
    recent_intents: list[str]


class SessionClearedResponse(BaseModel):
    """Confirmation payload for DELETE /session/{session_id}."""

    session_id: str
    cleared: bool
    message: str
