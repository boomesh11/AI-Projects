import re
import json

def extract_entities(text: str) -> dict:
    entities = {}
    
    # Priority
    match_priority = re.search(r"(high|medium|low)\s+priority", text, re.IGNORECASE)
    if match_priority:
        entities["priority"] = match_priority.group(1).capitalize()
        
    # Name
    name = None
    # 1. "called X" or "named X"
    m = re.search(r"(?:called|named)\s+([A-Za-z0-9_\s]+)", text, re.IGNORECASE)
    if m:
        name_part = re.split(r"\s+for\s+", m.group(1), flags=re.IGNORECASE)[0].strip()
        name = name_part
    else:
        # 2. "Project X"
        m = re.search(r"\bproject\s+([A-Za-z0-9_\s]+)", text, re.IGNORECASE)
        if m:
            name_part = re.split(r"\s+for\s+", m.group(1), flags=re.IGNORECASE)[0].strip()
            if name_part.lower() not in ["called", "named"] and not name_part.lower().startswith("for"):
                name = name_part
        if not name:
            # 3. "[Name] project"
            m = re.search(r"\b([A-Za-z0-9_]+)\s+project\b", text, re.IGNORECASE)
            if m:
                val = m.group(1)
                if val.lower() not in ["a", "an", "the", "priority", "new", "create", "start", "launch"]:
                    name = val

    if name:
        entities["project_name"] = name

    # Department
    dept = None
    # 1. "for X"
    m = re.search(r"\bfor\s+([A-Za-z0-9_]+)", text, re.IGNORECASE)
    if m:
        dept = m.group(1).capitalize()
    else:
        # 2. "[Dept] project"
        m = re.search(r"\b([A-Za-z0-9_]+)\s+project\b", text, re.IGNORECASE)
        if m:
            val = m.group(1)
            if val.lower() not in ["a", "an", "the", "priority", "new", "create", "start", "launch"] and val != name:
                dept = val.capitalize()
                
    if dept and dept != name:
        entities["department"] = dept

    return entities

tests = [
    "Create a project called Apollo",
    "Create Project Apollo",
    "Create a high priority project called Apollo",
    "Launch Apollo project",
    "Create an Engineering project called Apollo",
    "Create a low priority HR project called Hiring Portal",
    "Please create a project named Titan for Marketing",
    "Start a new project called Zeus",
    "Create Project Athena for Sales",
    "Launch the Hermes project for Logistics",
    "Create a medium priority project called Mars",
    "I need an IT project called Jupiter",
    "Create a high priority Finance project named Venus",
    "Launch Saturn project for Operations",
    "Create a project for Legal called Pluto"
]

results = []
for t in tests:
    res = extract_entities(t)
    results.append({"input": t, "extracted": res})

print(json.dumps(results, indent=2))
