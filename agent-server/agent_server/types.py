from datetime import datetime
from pydantic import BaseModel, Field


class EditorState(BaseModel):
    language: str = Field(default="python")
    content: str = Field(default="")
    last_updated: int = Field(default=int(datetime.now().timestamp()))


class SessionMetadata(BaseModel):
    session_id: str = Field(..., description="The ID of the session")
    assistant_id: str = Field(..., description="The ID of the assistant")
    question_title: str = Field(..., description="The title of the question")
    question_content: str = Field(..., description="The content of the question")
    agent_thread_id: str = Field(..., description="The ID of the agent thread")
    session_status: str = Field(..., description="The status of the session")
