import logging
from typing import Union
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.agent.intent import IntentEngine
from app.agent.brain import CatalystBrain
from app.agent.planner import Planner
from app.schemas.intent import Intent
from app.schemas.plan import ExecutionPlan, ClarificationResponse
from app.api import employees, projects
from app.api import session as session_router
from app.ai.exceptions import AIException
from app.ai.metrics import metrics_tracker
from app.memory import session_memory
from app.debug_logger import log_debug_stage

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger("app.main")

app = FastAPI(
    title="Catalyst Studio API",
    version="0.6.0",
    description=(
        "AI-powered ERP automation engine — "
        "Modular, Configurable, Fault-tolerant, Stateful"
    ),
)

# CORS Middleware config
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Exception handlers
# ---------------------------------------------------------------------------

@app.exception_handler(AIException)
def ai_exception_handler(request: Request, exc: AIException):
    logger.error(f"AI Layer validation error: {exc.__class__.__name__}: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "detail": str(exc),
            "error_type": exc.__class__.__name__
        }
    )


@app.exception_handler(ConnectionError)
def connection_error_handler(request: Request, exc: ConnectionError):
    logger.error(f"AI Provider service unavailable: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "detail": "AI generation service is currently unavailable. Please ensure Ollama is running.",
            "error_type": "ConnectionError"
        }
    )


@app.exception_handler(TimeoutError)
def timeout_error_handler(request: Request, exc: TimeoutError):
    logger.error(f"AI Provider request timed out: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_504_GATEWAY_TIMEOUT,
        content={
            "detail": "AI generation request timed out. Please try again.",
            "error_type": "TimeoutError"
        }
    )


@app.exception_handler(ValueError)
def value_error_handler(request: Request, exc: ValueError):
    """Catches misconfigured PROVIDER_TYPE or malformed provider responses."""
    logger.error(f"Configuration or provider value error: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": str(exc),
            "error_type": "ValueError"
        }
    )


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(employees.router, prefix="/employees", tags=["Employees"])
app.include_router(projects.router, prefix="/projects", tags=["Projects"])
app.include_router(session_router.router, prefix="/session", tags=["Session Memory"])

from app.agent.router import ToolRouter

# Instantiate decoupled modules
engine = IntentEngine()
brain = CatalystBrain()
planner = Planner()
tool_router = ToolRouter()


# ---------------------------------------------------------------------------
# Core AI endpoints
# ---------------------------------------------------------------------------

@app.get("/")
def root() -> dict:
    return {
        "message": "Catalyst Studio Running",
        "version": "0.6.0",
        "memory_backend": "in-memory (session-scoped)",
    }


@app.get("/intent", response_model=Intent)
def detect(text: str, session_id: str = "default") -> Intent:
    """Detect the user's intent from natural language text.

    The session_id is used to read prior context before calling the AI
    provider and to persist the result after classification.

    Args:
        text:       Natural language user input.
        session_id: Session identifier. Defaults to 'default'.
    """
    logger.info(
        f"GET /intent — session='{session_id}' text='{text}'"
    )
    return engine.detect(text, session_id=session_id)


@app.get("/plan", response_model=Union[ExecutionPlan, ClarificationResponse])
def plan(text: str, session_id: str = "default", request: Request = None):
    """Generate an execution plan from natural language text.

    Flow:
        session_id → MemoryService.current_context()
        → IntentEngine.detect(text, session_id)   [reads + writes memory]
        → CatalystBrain.evaluate(intent, text, pre_context) [validates entities]
        → Planner.plan(intent, entities, memory_enriched)  [generates plan]
        → ExecutionPlan OR ClarificationResponse

    Args:
        text:       Natural language user input.
        session_id: Session identifier. Defaults to 'default'.
    """
    log_debug_stage(
        stage_name="1. Raw frontend request",
        raw_input=f"URL: {request.url if request else '/plan'} | Params: text='{text}', session_id='{session_id}'",
    )
    log_debug_stage(
        stage_name="2. /plan endpoint",
        raw_input=text,
    )
    logger.info(
        f"GET /plan — session='{session_id}' text='{text}'"
    )

    # Read memory context BEFORE intent detection so the Brain/Planner receives
    # the pre-command state (what the user previously established).
    pre_context = session_memory.current_context(session_id)

    pending_intent = pre_context.get("pending_intent")
    
    if pending_intent:
        missing_fields = pre_context.get("missing_fields", [])
        if missing_fields:
            field = missing_fields[0]
            val = text.strip()
            
            # Manually merge the text into memory for this field
            logger.info(f"Conversational loop: merging '{val}' into field '{field}' for intent '{pending_intent}'")
            session_memory.remember(session_id, pending_intent, {field: val}, text)
            
            # Clear pending action to allow normal execution unless Brain blocks it again
            session_memory.set_pending_action(session_id, None, None)
            
            # Construct intent directly without NLP
            intent = Intent(intent=pending_intent, confidence=1.0, entities={field: val})
        else:
            intent = engine.detect(text, session_id=session_id)
    else:
        intent = engine.detect(text, session_id=session_id)

    # Brain validation and entity enrichment
    evaluation = brain.evaluate(intent, text, memory_context=pre_context)
    
    logger.info("-" * 36)
    logger.info("Brain output:")
    if isinstance(evaluation, ClarificationResponse):
        logger.info(evaluation.model_dump())
    else:
        logger.info(evaluation)
    logger.info("-" * 36)
    
    if isinstance(evaluation, ClarificationResponse):
        logger.info(f"GET /plan — needs clarification: '{evaluation.question}'")
        
        # Save pending action before returning
        session_memory.set_pending_action(session_id, intent.intent, evaluation.missing_fields)
        
        print("FINAL EXECUTION PLAN")
        print(evaluation.model_dump())
        return evaluation

    logger.info("-" * 36)
    logger.info("Planner input:")
    logger.info(f"intent={intent.intent}, enriched_entities={evaluation['entities']}, memory_enriched={evaluation['memory_enriched']}")
    logger.info("-" * 36)

    # If execution can proceed, forward enriched entities to planner
    execution_plan = planner.plan(
        intent,
        enriched_entities=evaluation["entities"],
        memory_enriched=evaluation["memory_enriched"]
    )

    # Stamp the session_id onto the response so the frontend can confirm
    execution_plan.session_id = session_id
    
    logger.info("-" * 36)
    logger.info("Executing Tool via ToolRouter...")
    tool_result = tool_router.execute(execution_plan)
    execution_plan.tool_result = tool_result
    
    # Change ui_action to indicate a tool result is present
    execution_plan.ui_action = "show_tool_result"
    
    logger.info("Tool Result:")
    logger.info(tool_result.model_dump())
    logger.info("-" * 36)

    logger.info(
        f"GET /plan — completed: intent='{execution_plan.intent}' "
        f"memory_enriched={execution_plan.memory_enriched} "
        f"entities={execution_plan.entities}"
    )
    
    print("FINAL EXECUTION PLAN")
    print(execution_plan.model_dump())
    
    return execution_plan


@app.get("/ai/metrics")
def get_ai_metrics() -> dict:
    """Retrieve runtime performance and validation failure metrics."""
    return metrics_tracker.get_metrics()