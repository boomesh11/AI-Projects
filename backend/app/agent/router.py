import logging
from app.schemas.plan import ExecutionPlan, ToolResult
from app.agent.tools import BaseTool, EmployeeTool, ProjectTool, InventoryTool
from app.debug_logger import log_debug_stage

logger = logging.getLogger("app.agent.router")

class ToolRouter:
    """Routes an ExecutionPlan to the appropriate concrete Tool."""
    
    def __init__(self):
        self._registry: dict[str, BaseTool] = {
            "employee": EmployeeTool(),
            "project": ProjectTool(),
            "inventory": InventoryTool(),
        }

    def execute(self, plan: ExecutionPlan) -> ToolResult:
        log_debug_stage(
            stage_name="11. ToolRouter input",
            raw_input=f"tool={plan.tool}",
            parsed_intent=plan.intent,
            entities=plan.entities,
            execution_plan=plan.model_dump(),
        )
        logger.info(f"ToolRouter routing plan: tool='{plan.tool}' intent='{plan.intent}'")
        
        tool = self._registry.get(plan.tool)
        if not tool:
            message = f"No tool registered for '{plan.tool}'"
            logger.warning(message)
            return ToolResult(success=False, message=message)
            
        try:
            return tool.execute(plan)
        except Exception as e:
            logger.error(f"Error executing tool '{plan.tool}': {e}", exc_info=True)
            return ToolResult(
                success=False,
                message=f"Tool execution failed: {str(e)}"
            )
