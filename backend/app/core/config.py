import os
from pathlib import Path


def load_env(env_path: Path):
    """Parse a .env file and set OS environmental variables."""
    if env_path.exists():
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    os.environ[key] = val


# Locate backend root and load .env configuration
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_env(BASE_DIR / ".env")

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen3:8b")
PROVIDER_TYPE = os.getenv("PROVIDER_TYPE", "ollama")
PROMPT_SYSTEM_FILE = os.getenv("PROMPT_SYSTEM_FILE", "system_v2.txt")
PROMPT_USER_FILE = os.getenv("PROMPT_USER_FILE", "intent_v1.txt")

# Session memory
SESSION_TTL_SECONDS = float(os.getenv("SESSION_TTL_SECONDS", "3600"))
MEMORY_BACKEND = os.getenv("MEMORY_BACKEND", "memory")
