import pytest
from app.ai.validator import validate_and_parse
from app.agent.brain import CatalystBrain
from app.schemas.intent import Intent

def test_corruption_regression():
    """Regression test proving that '/think' corruption is intercepted and cleaned.
    
    Simulates the case where the AI provider outputs a corrupted entity value
    containing '/think' or '<think', which previously leaked into ProjectCreate.
    """
    # 1. Simulate corrupted raw model response containing 'Create project /think'
    corrupted_raw_response = '''{
        "intent": "create_project",
        "confidence": 1.0,
        "entities": {
            "project_name": "Create project /think"
        }
    }'''

    # 2. Verify that validate_and_parse successfully cleans/removes the corrupted entity
    validated_data = validate_and_parse(corrupted_raw_response)
    
    assert validated_data["intent"] == "create_project"
    # The corrupted 'Create project /think' entity should be removed by our fix
    assert "project_name" not in validated_data["entities"]

    # 3. Verify CatalystBrain cleanly falls back to regex/memory entity extraction
    brain = CatalystBrain()
    intent = Intent(
        intent=validated_data["intent"],
        confidence=validated_data["confidence"],
        entities=validated_data["entities"]
    )
    
    evaluation = brain.evaluate(intent, "Create project Apollo", memory_context=None)
    
    # Prove that the final entity successfully becomes 'Apollo' instead of 'Create project /think'
    assert evaluation["entities"]["project_name"] == "Apollo"
