import re
import logging
from app.schemas.intent import Intent
from app.schemas.plan import ClarificationResponse
from app.debug_logger import log_debug_stage

logger = logging.getLogger("app.agent.brain")

# Pronoun / reference patterns that trigger memory lookup
_EMPLOYEE_PRONOUNS = re.compile(
    r"\b(him|her|them|he|she|they|that employee|the employee|same employee)\b",
    re.IGNORECASE,
)
_PROJECT_PRONOUNS = re.compile(
    r"\b(it|that project|the project|same project)\b",
    re.IGNORECASE,
)

class CatalystBrain:
    """The orchestration layer between Memory and Planner.
    
    Responsibilities:
    1. Determine whether enough information exists to execute the request.
    2. Detect missing required entities.
    3. Decide whether clarification is required.
    4. Route the request to the correct Planner (or return clarification).
    5. Prevent invalid execution.
    """
    
    def _resolve_from_memory(self, intent_name: str, text: str, memory_context: dict) -> tuple[dict, bool]:
        entities: dict = {}
        enriched = False

        active_employee = memory_context.get("active_employee")
        active_project = memory_context.get("active_project")
        recent_entities: dict = memory_context.get("recent_entities", {})

        if active_employee and _EMPLOYEE_PRONOUNS.search(text):
            entities["name"] = active_employee
            enriched = True
            logger.info(f"Brain: pronoun resolved → name='{active_employee}'")

        if active_project and _PROJECT_PRONOUNS.search(text):
            entities["project_name"] = active_project
            enriched = True
            logger.info(f"Brain: pronoun resolved → project_name='{active_project}'")

        if not entities.get("department") and recent_entities.get("department"):
            entities["department"] = recent_entities["department"]

        return entities, enriched

    def _extract_entities(self, intent_name: str, text: str) -> dict:
        entities = {}
        if not text:
            return entities

        def format_case(val: str) -> str:
            return val.title() if val.islower() else val

        # Handle 'assign' logic inside extraction if needed, or rely on normal intent extraction
        is_assign = bool(re.search(r"\bassign\b", text, re.IGNORECASE))
        
        if intent_name == "create_project" or is_assign:
            match_priority = re.search(r"(high|medium|low)\s+priority", text, re.IGNORECASE)
            if match_priority:
                entities["priority"] = match_priority.group(1).capitalize()

            name = None
            m = re.search(r"(?:called|named)\s+([A-Za-z0-9_\s]+)", text, re.IGNORECASE)
            if m:
                name_part = re.split(r"\s+for\s+", m.group(1), flags=re.IGNORECASE)[0].strip()
                name = name_part
            else:
                m = re.search(r"\bproject\s+([A-Za-z0-9_\s]+)", text, re.IGNORECASE)
                if m:
                    name_part = re.split(r"\s+for\s+", m.group(1), flags=re.IGNORECASE)[0].strip()
                    if name_part.lower() not in ["called", "named"] and not name_part.lower().startswith("for"):
                        name = name_part
                if not name:
                    m = re.search(r"\b([A-Za-z0-9_]+)\s+project\b", text, re.IGNORECASE)
                    if m:
                        val = m.group(1)
                        if val.lower() not in ["a", "an", "the", "priority", "new", "create", "start", "launch"]:
                            name = val

            if name:
                entities["project_name"] = name

            _STOPWORDS = {
                "a", "an", "the", "to", "for", "in", "on", "at", "by",
                "project", "new", "create", "start", "launch", "high",
                "medium", "low", "priority", "assign", "add", "him",
                "her", "them", "it", "that", "this", "same",
            }

            dept = None
            m = re.search(r"\bfor\s+([A-Za-z0-9_]+)", text, re.IGNORECASE)
            if m:
                candidate = m.group(1).strip()
                if candidate.lower() not in _STOPWORDS:
                    dept = format_case(candidate)
            if not dept:
                m = re.search(r"\b([A-Za-z0-9_]+)\s+project\b", text, re.IGNORECASE)
                if m:
                    val = m.group(1)
                    if val.lower() not in _STOPWORDS and val != name:
                        dept = format_case(val)

            if dept and dept != name:
                entities["department"] = dept

        if intent_name == "create_employee" or is_assign:
            match_name = re.search(r"employee\s+([A-Za-z\s]+?)(?:\s+for|\s+in|$)", text, re.IGNORECASE)
            if match_name:
                entities["name"] = match_name.group(1).strip()
            
            # If "assign him" format is used, it might just be "assign" with a pronoun.
            # Pronoun is already handled in memory phase.

            _EMP_STOPWORDS = {"a", "an", "the", "to", "for", "in", "on", "at"}
            match_dept = re.search(r"(?:for|in)\s+([A-Za-z0-9_]+)", text, re.IGNORECASE)
            if match_dept:
                candidate = match_dept.group(1).strip()
                if candidate.lower() not in _EMP_STOPWORDS:
                    entities["department"] = format_case(candidate)

        return entities

    def evaluate(self, intent: Intent, text: str, memory_context: dict | None) -> dict | ClarificationResponse:
        """Evaluates if the request has all required information.
        
        Returns:
            ClarificationResponse if information is missing.
            A dict of enriched entities if execution can proceed.
        """
        log_debug_stage(
            stage_name="7. CatalystBrain input",
            raw_input=text,
            parsed_intent=intent.intent,
            entities=intent.entities,
        )
        memory_entities = {}
        memory_enriched = False
        
        if memory_context and memory_context.get("has_context"):
            memory_entities, memory_enriched = self._resolve_from_memory(intent.intent, text, memory_context)
            
        regex_entities = self._extract_entities(intent.intent, text)
        merged_entities = {**memory_entities, **regex_entities}
        
        ai_entities = {k: v for k, v in intent.entities.items() if v not in (None, "", [], {})}
        final_entities = {**merged_entities, **ai_entities}
        
        is_assign = bool(re.search(r"\bassign\b", text, re.IGNORECASE))
        
        # Validation rules
        if is_assign:
            # Need both employee and project
            name = final_entities.get("name")
            project_name = final_entities.get("project_name")
            if not name:
                res = ClarificationResponse(question="Which employee should be assigned?", missing_fields=["name"])
                log_debug_stage(stage_name="8. CatalystBrain output", raw_input=text, parsed_intent=intent.intent, entities="ClarificationResponse: " + res.question)
                return res
            if not project_name:
                res = ClarificationResponse(question=f"What project should {name} be assigned to?", missing_fields=["project_name"])
                log_debug_stage(stage_name="8. CatalystBrain output", raw_input=text, parsed_intent=intent.intent, entities="ClarificationResponse: " + res.question)
                return res
            
            # Assign isn't an official intent, but we'll modify the intent for the Planner if needed,
            # wait, planner doesn't know 'assign'. If we return final_entities, Planner will use the existing intent.
            
        elif intent.intent == "create_project":
            if not final_entities.get("project_name"):
                res = ClarificationResponse(question="What is the project name?", missing_fields=["project_name"])
                log_debug_stage(stage_name="8. CatalystBrain output", raw_input=text, parsed_intent=intent.intent, entities="ClarificationResponse: " + res.question)
                return res
                
        elif intent.intent == "create_employee":
            if not final_entities.get("name"):
                res = ClarificationResponse(question="What is the employee name?", missing_fields=["name"])
                log_debug_stage(stage_name="8. CatalystBrain output", raw_input=text, parsed_intent=intent.intent, entities="ClarificationResponse: " + res.question)
                return res

        log_debug_stage(
            stage_name="8. CatalystBrain output",
            raw_input=text,
            parsed_intent=intent.intent,
            entities=final_entities,
        )

        return {
            "entities": final_entities,
            "memory_enriched": memory_enriched
        }
