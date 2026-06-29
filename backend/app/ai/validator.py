import json
import re
from app.ai.exceptions import (
    InvalidJSON,
    MissingFields,
    InvalidIntent,
    WrongFieldType,
    EmptyEntities,
)
from app.debug_logger import log_debug_stage

VALID_INTENTS = {"create_employee", "create_project", "inventory_query", "unknown"}

def clean_json_response(text: str) -> str:
    """Strip markdown formatting and think blocks."""
    if not text:
        return text
    # Remove <think>...</think> block
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
    # Extract json from markdown block if present
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, flags=re.DOTALL)
    if match:
        return match.group(1).strip()
    return text.strip()


def validate_and_parse(response_text: str) -> dict:
    """Validate that the response text strictly matches the structured schema.

    Raises:
        InvalidJSON: If input is not valid JSON string or parsed as non-dict.
        MissingFields: If required fields (intent, confidence, entities) are missing.
        WrongFieldType: If fields have incorrect types.
        InvalidIntent: If the intent is not in the set of valid intents.
        EmptyEntities: If intent is a creation intent but entities is empty.
    """
    if not response_text:
        raise InvalidJSON("Received empty response from the AI model")
        
    cleaned_text = clean_json_response(response_text)

    try:
        data = json.loads(cleaned_text)
    except json.JSONDecodeError as e:
        raise InvalidJSON(f"Response is not valid JSON: {str(e)}. Response text: {cleaned_text}") from e

    if not isinstance(data, dict):
        raise InvalidJSON(f"Expected a JSON object (dict), but got: {type(data).__name__}")

    # 1. Check missing fields
    required_fields = ["intent", "confidence", "entities"]
    for field in required_fields:
        if field not in data:
            raise MissingFields(f"Required field '{field}' is missing in the AI response")

    # 2. Check field types
    intent = data.get("intent")
    confidence = data.get("confidence")
    entities = data.get("entities")

    if not isinstance(intent, str):
        raise WrongFieldType(f"Field 'intent' must be a string, but got {type(intent).__name__}")

    if not isinstance(confidence, (int, float)):
        raise WrongFieldType(f"Field 'confidence' must be a float or int, but got {type(confidence).__name__}")

    if not isinstance(entities, dict):
        raise WrongFieldType(f"Field 'entities' must be a dictionary, but got {type(entities).__name__}")

    # Clean any surviving '/think' tokens or corrupted entity values
    for k, v in list(entities.items()):
        if isinstance(v, str) and ("/think" in v or "<think" in v):
            # The entity was corrupted by model thinking tags / raw prompt leak.
            # Remove the corrupted entity so CatalystBrain can cleanly fallback to regex/memory entities.
            del entities[k]

    # 3. Check allowed intents
    if intent not in VALID_INTENTS:
        raise InvalidIntent(f"Intent '{intent}' is invalid. Must be one of: {', '.join(VALID_INTENTS)}")

    # 4. (Removed EmptyEntities check)
    # The CatalystBrain layer now handles missing entities by emitting
    # ClarificationResponses. We no longer fail at the AI validation step.

    log_debug_stage(
        stage_name="6. Validator output",
        raw_input=response_text,
        parsed_intent=data.get("intent"),
        entities=data.get("entities"),
    )

    return data
