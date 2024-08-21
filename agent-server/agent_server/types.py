from datetime import datetime
from pydantic import BaseModel, Field


class EditorState(BaseModel):
    language: str = Field(default="python")
    content: str = Field(default="")
    last_updated: int = Field(default=int(datetime.now().timestamp()))
