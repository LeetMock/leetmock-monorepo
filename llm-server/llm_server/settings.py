import os

from typing import Optional, Dict, Any
from pydantic import BaseModel
from dotenv import load_dotenv


load_dotenv(override=True)


class Settings(BaseModel):
    """Settings for the application."""

    # Retell Configurations
    RETELL_API_KEY: str
    RETELL_AGENT_ID: str

    # Convex Configurations
    CONVEX_URL: str
    CONVEX_DEPLOYMENT: str

    # Langchain Configurations
    LANGSMITH_API_KEY: str
    LANGCHAIN_TRACING_V2: bool
    LANGGRAPH_API_URL: str
    
    # Voice Pipeline Configurations
    VOICE_PIPELINE_SERVER_URL: str


__settings_instance: Optional[Settings] = None


def get_settings() -> Settings:
    """Get the settings instance."""
    global __settings_instance

    if __settings_instance is None:

        envvars = _ensure_envvars()
        __settings_instance = Settings(**envvars)
        print(__settings_instance)

    return __settings_instance


def _ensure_envvars():
    """Ensure that all required environment variables are set."""

    envvars: Dict[str, Any] = {}
    missing_envvars = []
    required_envvars = []

    for field in Settings.__fields__.keys():
        required_envvars.append(field.upper())

    for envvar in required_envvars:
        if os.getenv(envvar) is None:
            missing_envvars.append(envvar)
        else:
            envvars[envvar] = os.environ[envvar]

    if len(missing_envvars) > 0:
        raise ValueError(f"Missing required environment variables: {missing_envvars}")

    return envvars
