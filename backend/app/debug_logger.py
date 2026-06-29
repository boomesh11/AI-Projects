import logging
from typing import Any

logger = logging.getLogger("app.debug")

def log_debug_stage(
    stage_name: str,
    raw_input: Any = "N/A",
    parsed_intent: Any = "N/A",
    entities: Any = "N/A",
    execution_plan: Any = "N/A",
    tool_payload: Any = "N/A",
):
    msg = f"""
-------------------------
{stage_name}
-------------------------
Raw Input:
{raw_input}

Parsed Intent:
{parsed_intent}

Entities:
{entities}

ExecutionPlan:
{execution_plan}

Tool Payload:
{tool_payload}
"""
    print(msg)
    logger.info(msg)
