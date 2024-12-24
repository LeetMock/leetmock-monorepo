from typing import Any, Dict

from agent_graph.code_mock_staged_v1.constants import AgentConfig
from agent_graph.code_mock_staged_v1.prompts import STAGE_TRANSITION_CONFIRMATION_PROMPT
from agent_graph.llms import get_model
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate
from langchain_core.runnables import Runnable
from pydantic.v1 import BaseModel, Field


class AnalyzeStageTransitionSignal(BaseModel):
    """Tool to analyze whether the interview should transition to the next stage."""

    thought: str = Field(
        ...,
        description="Step-by-step chain of thought, reasoning about the two conditions",
    )

    should_transition: bool = Field(
        ..., description="Whether the interview should transition to the next stage"
    )


def create_stage_transiton_chain(
    agent_config: AgentConfig,
) -> Runnable[Dict[str, Any], AnalyzeStageTransitionSignal]:
    sys_prompt = SystemMessagePromptTemplate.from_template(
        STAGE_TRANSITION_CONFIRMATION_PROMPT, template_format="jinja2"
    )

    chat_prompt = ChatPromptTemplate.from_messages([sys_prompt])
    llm = get_model(agent_config.smart_model).with_structured_output(
        AnalyzeStageTransitionSignal
    )

    return (
        chat_prompt
        | llm
        | PydanticOutputParser(pydantic_object=AnalyzeStageTransitionSignal)
    )
