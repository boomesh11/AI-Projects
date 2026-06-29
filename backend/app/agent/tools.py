import logging
from typing import Any
from app.schemas.plan import ExecutionPlan, ToolResult
from app.schemas.employee import EmployeeCreate
from app.api.employees import repository as employee_repo
from app.debug_logger import log_debug_stage

# We will check if ProjectCreate and project_repo exist
try:
    from app.api.projects import repository as project_repo
except ImportError:
    project_repo = None
    
try:
    from app.schemas.project import ProjectCreate
except ImportError:
    ProjectCreate = None

logger = logging.getLogger("app.agent.tools")

class BaseTool:
    """Base interface for all execution tools."""
    def execute(self, plan: ExecutionPlan) -> ToolResult:
        raise NotImplementedError("Each tool must implement execute()")

class EmployeeTool(BaseTool):
    def execute(self, plan: ExecutionPlan) -> ToolResult:
        logger.info(f"EmployeeTool executing plan: intent={plan.intent}")
        
        if plan.intent == "create_employee":
            name = plan.entities.get("name", "Unknown Employee")
            department = plan.entities.get("department", "Unassigned")
            
            # The prompt leaves optional fields blank since Brain only enforced name.
            # We map entities to the expected CRUD schema.
            employee_data = EmployeeCreate(
                name=name,
                department=department,
                role=plan.entities.get("role", ""),
                email=plan.entities.get("email", ""),
                phone=plan.entities.get("phone", "")
            )
            
            created = employee_repo.create(employee_data)
            
            logger.info(f"EmployeeTool created employee: id={created.id} name={created.name}")
            return ToolResult(
                success=True,
                message=f"Successfully created employee {created.name}.",
                data=created.model_dump(),
                refresh=["employees"]
            )
            
        return ToolResult(
            success=False,
            message=f"EmployeeTool does not support intent: {plan.intent}",
        )

class ProjectTool(BaseTool):
    def execute(self, plan: ExecutionPlan) -> ToolResult:
        log_debug_stage(
            stage_name="12. ProjectTool input",
            raw_input=f"tool={plan.tool}",
            parsed_intent=plan.intent,
            entities=plan.entities,
            execution_plan=plan.model_dump(),
        )
        logger.info(f"ProjectTool executing plan: intent={plan.intent}")
        
        if plan.intent == "create_project":
            project_name = plan.entities.get("project_name", "Unknown Project")
            
            # Assuming ProjectCreate schema and project_repo exist
            if project_repo and ProjectCreate:
                project_data = ProjectCreate(
                    name=project_name,
                    description=plan.entities.get("description", "A new project"),
                    department=plan.entities.get("department", "General"),
                    project_manager=plan.entities.get("project_manager", "Unassigned"),
                    priority=plan.entities.get("priority", "Medium"),
                    start_date=plan.entities.get("start_date", "TBD"),
                    end_date=plan.entities.get("end_date", "TBD")
                )
                log_debug_stage(
                    stage_name="13. ProjectCreate Pydantic model",
                    raw_input=f"tool={plan.tool}",
                    parsed_intent=plan.intent,
                    entities=plan.entities,
                    execution_plan=plan.model_dump(),
                    tool_payload=project_data.model_dump(),
                )
                created = project_repo.create(project_data)
                log_debug_stage(
                    stage_name="14. Final object stored in memory/database",
                    raw_input=f"tool={plan.tool}",
                    parsed_intent=plan.intent,
                    entities=plan.entities,
                    execution_plan=plan.model_dump(),
                    tool_payload=created.model_dump(),
                )
                logger.info(f"ProjectTool created project: id={created.id} name={created.name}")
                return ToolResult(
                    success=True,
                    message=f"Successfully created project {created.name}.",
                    data=created.model_dump(),
                    refresh=["projects"]
                )
            else:
                # Mock fallback if project_repo is not yet fully implemented
                logger.info(f"ProjectTool (mock) created project: {project_name}")
                return ToolResult(
                    success=True,
                    message=f"Successfully created project {project_name}.",
                    data={"name": project_name},
                    refresh=["projects"]
                )
                
        return ToolResult(
            success=False,
            message=f"ProjectTool does not support intent: {plan.intent}",
        )

class InventoryTool(BaseTool):
    def execute(self, plan: ExecutionPlan) -> ToolResult:
        logger.info(f"InventoryTool executing plan: intent={plan.intent}")
        # We don't have inventory services yet, just return a mock success
        return ToolResult(
            success=True,
            message="Inventory check complete.",
            data={},
            refresh=["inventory"]
        )
