"""Session API Router — REST endpoints for session memory inspection.

Endpoints
---------
GET  /session/                     → list all active session IDs
GET  /session/{session_id}         → full session state
GET  /session/{session_id}/history → command history only
GET  /session/{session_id}/context → compact context dict (same as AI sees)
DELETE /session/{session_id}       → clear a session

These are read/management endpoints only.  Writing to memory is done
exclusively through the /plan and /intent endpoints during the normal
command flow (via IntentEngine.remember).
"""

import logging
from fastapi import APIRouter, HTTPException, status

from app.memory import session_memory
from app.schemas.memory import (
    SessionContextResponse,
    SessionHistoryResponse,
    SessionClearedResponse,
)

router = APIRouter()
logger = logging.getLogger("app.api.session")


@router.get("/", response_model=list[str])
def list_sessions() -> list[str]:
    """Return all active session IDs currently held in memory."""
    ids = session_memory.all_session_ids()
    logger.info(f"list_sessions → {len(ids)} session(s)")
    return ids


@router.get("/{session_id}", response_model=SessionContextResponse)
def get_session(session_id: str) -> SessionContextResponse:
    """Return the full SessionContext for *session_id*.

    Raises 404 if the session does not exist or has expired.
    """
    ctx = session_memory.recall(session_id)
    if ctx is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found or has expired.",
        )
    logger.info(
        f"get_session '{session_id}' → "
        f"commands={len(ctx.command_history)} "
        f"intents={len(ctx.recent_intents)}"
    )
    return SessionContextResponse(
        session_id=ctx.session_id,
        recent_intents=ctx.recent_intents,
        extracted_entities=ctx.extracted_entities,
        active_employee=ctx.active_employee,
        active_project=ctx.active_project,
        current_workspace=ctx.current_workspace,
        command_history=ctx.command_history,
        last_updated=ctx.last_updated,
    )


@router.get("/{session_id}/history", response_model=SessionHistoryResponse)
def get_session_history(session_id: str) -> SessionHistoryResponse:
    """Return the command history for *session_id* (lightweight view).

    Raises 404 if the session does not exist or has expired.
    """
    ctx = session_memory.recall(session_id)
    if ctx is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found or has expired.",
        )
    return SessionHistoryResponse(
        session_id=ctx.session_id,
        command_count=len(ctx.command_history),
        command_history=ctx.command_history,
        recent_intents=ctx.recent_intents,
    )


@router.get("/{session_id}/context")
def get_session_context(session_id: str) -> dict:
    """Return the compact context dict that the AI provider and Planner see.

    Always returns a dict (never 404) so the frontend can poll this
    endpoint even before the first command is sent.
    """
    context = session_memory.current_context(session_id)
    logger.debug(f"get_session_context '{session_id}' → has_context={context.get('has_context')}")
    return context


@router.delete("/{session_id}", response_model=SessionClearedResponse)
def clear_session(session_id: str) -> SessionClearedResponse:
    """Permanently delete the session for *session_id*.

    Returns a confirmation payload regardless of whether the session
    existed.  The frontend can call this to hard-reset context.
    """
    cleared = session_memory.clear(session_id)
    message = (
        f"Session '{session_id}' cleared successfully."
        if cleared
        else f"Session '{session_id}' did not exist; nothing to clear."
    )
    logger.info(f"clear_session '{session_id}' → cleared={cleared}")
    return SessionClearedResponse(
        session_id=session_id,
        cleared=cleared,
        message=message,
    )
