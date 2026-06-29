import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.memory import session_memory

client = TestClient(app)

def test_conversational_clarification_flow():
    session_id = "test_conv_flow_1"
    
    # Ensure memory is clear
    session_memory.clear(session_id)
    
    # Turn 1: User says "Create project"
    # This should return ClarificationResponse for project_name
    res1 = client.get(f"/plan?text=Create%20project&session_id={session_id}")
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["status"] == "needs_clarification"
    assert "project name" in data1["question"].lower()
    assert data1["missing_fields"] == ["project_name"]
    
    # Check that session memory stored the pending action
    ctx = session_memory.current_context(session_id)
    assert ctx["pending_intent"] == "create_project"
    assert ctx["missing_fields"] == ["project_name"]
    
    # Turn 2: User says "Apollo"
    # The /plan endpoint should bypass NLP, merge 'Apollo' into 'project_name', and execute.
    res2 = client.get(f"/plan?text=Apollo&session_id={session_id}")
    assert res2.status_code == 200
    data2 = res2.json()
    
    # Should now be a full ExecutionPlan with tool_result
    assert data2.get("intent") == "create_project"
    assert data2.get("ui_action") == "show_tool_result"
    assert data2.get("tool") == "project"
    assert data2["entities"]["project_name"] == "Apollo"
    
    # Tool result should indicate success
    tool_result = data2.get("tool_result")
    assert tool_result is not None
    assert tool_result["success"] is True
    assert tool_result["refresh"] == ["projects"]
    assert tool_result["data"]["name"] == "Apollo"
    
    # Check that session memory cleared the pending action
    ctx = session_memory.current_context(session_id)
    assert ctx["pending_intent"] is None
    assert ctx["missing_fields"] == []
