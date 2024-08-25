from datetime import datetime
from pydantic import BaseModel, Field


class EditorState(BaseModel):
    language: str = Field(..., description="The language of the editor")
    content: str = Field(..., description="The content of the editor")
    last_updated: int = Field(..., description="The last updated timestamp")


class TerminalState(BaseModel):
    output: str = Field(..., description="The output of the terminal")
    is_error: bool = Field(..., description="Whether the terminal is in error")
    execution_time: int | None = Field(
        None, description="The execution time of the terminal"
    )


class SessionMetadata(BaseModel):
    session_id: str = Field(..., description="The ID of the session")
    assistant_id: str = Field(..., description="The ID of the assistant")
    question_title: str = Field(..., description="The title of the question")
    question_content: str = Field(..., description="The content of the question")
    agent_thread_id: str = Field(..., description="The ID of the agent thread")
    session_status: str = Field(..., description="The status of the session")


class EditorSnapshot(BaseModel):
    editor: EditorState = Field(..., description="The editor state")
    terminal: TerminalState = Field(..., description="The terminal state")
