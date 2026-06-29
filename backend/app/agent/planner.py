"""Planner — converts a detected Intent into a structured ExecutionPlan.

Memory enrichment is now handled by the Catalyst Brain layer, which checks
validation rules and passes fully enriched entities to the Planner.
"""

import logging
from app.schemas.intent import Intent
from app.schemas.plan import ExecutionPlan
from app.debug_logger import log_debug_stage

logger = logging.getLogger("app.agent.planner")

class Planner:
    """Converts a detected Intent into a structured ExecutionPlan.

    The Planner is a pure mapping layer — it does not execute business logic,
    call external services, or interact with databases.
    """

    _PLAN_REGISTRY: dict[str, dict] = {
        "create_employee": {
            "tool": "employee",
            "ui_action": "open_employee_form",
            "steps": [
                "extract_employee_details",
                "validate_input",
                "create_employee_record",
                "refresh_employee_table",
            ],
        },
        "create_project": {
            "tool": "project",
            "ui_action": "open_project_form",
            "steps": [
                "extract_project_details",
                "validate_input",
                "create_project_record",
                "refresh_project_table",
            ],
        },
        "inventory_query": {
            "tool": "inventory",
            "ui_action": "open_inventory_dashboard",
            "steps": [
                "extract_query_parameters",
                "validate_input",
                "fetch_inventory_data",
                "render_inventory_results",
            ],
        },
    }

    _UNKNOWN_PLAN: dict = {
        "tool": "none",
        "ui_action": "show_fallback_message",
        "steps": [
            "log_unknown_intent",
            "prompt_user_clarification",
        ],
    }

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def plan(
        self,
        intent: Intent,
        enriched_entities: dict,
        memory_enriched: bool = False,
    ) -> ExecutionPlan:
        """Generate an execution plan for the given intent.

        Args:
            intent:            The detected Intent from IntentEngine.
            enriched_entities: Final entities resolved by the Catalyst Brain.
            memory_enriched:   True if session memory provided any of the entities.

        Returns:
            ExecutionPlan with fully resolved entities.
        """
        log_debug_stage(
            stage_name="9. Planner input",
            raw_input=f"intent={intent.intent}, memory_enriched={memory_enriched}",
            parsed_intent=intent.intent,
            entities=enriched_entities,
        )
        logger.info(
            f"Planner: generating plan — intent='{intent.intent}' "
        )

        plan_data = self._PLAN_REGISTRY.get(intent.intent, self._UNKNOWN_PLAN)

        ep = ExecutionPlan(
            intent=intent.intent,
            tool=plan_data["tool"],
            ui_action=plan_data["ui_action"],
            steps=plan_data["steps"],
            entities=enriched_entities,
            memory_enriched=memory_enriched,
        )
        log_debug_stage(
            stage_name="10. Planner ExecutionPlan",
            raw_input=f"intent={intent.intent}",
            parsed_intent=intent.intent,
            entities=enriched_entities,
            execution_plan=ep.model_dump(),
        )
        return ep
