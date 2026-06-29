class AIException(Exception):
    """Base exception class for all AI layer issues."""
    pass


class InvalidJSON(AIException):
    """Raised when the AI model response is not valid JSON."""
    pass


class MissingFields(AIException):
    """Raised when the AI model response JSON is missing required fields."""
    pass


class InvalidIntent(AIException):
    """Raised when the detected intent is invalid or unrecognized."""
    pass


class WrongFieldType(AIException):
    """Raised when a field in the AI response JSON has an incorrect type."""
    pass


class EmptyEntities(AIException):
    """Raised when the entities field is empty for an intent that requires entities."""
    pass
