from pydantic import BaseModel
from typing import Dict, Any


class Intent(BaseModel):
    intent: str
    confidence: float
    entities: Dict[str, Any] = {}