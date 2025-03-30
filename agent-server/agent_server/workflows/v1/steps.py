import time
from collections import OrderedDict
from typing import cast

from agent_server.workflows.llms import get_model
from agent_server.workflows.v1.constants import *
from agent_server.workflows.v1.prompts import *
from agent_server.workflows.v1.types import *
from langchain_core.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
)
from livechain import step
from livechain.graph.ops import (
    channel_stream,
    get_config,
    get_state,
    mutate_state,
    trigger_workflow,
)

from libs.convex.convex_types import CodeSessionState, SessionMetadata


@step()
async def init_state():
    config = get_config(AgentConfig)
    state = get_state(AgentState)

    # If the state is already initialized, skip the step
    if state.initialized:
        return

    default_step_map = get_step_map(state.interview_flow)
    stages = [(name, steps) for name, steps in default_step_map.items()]

    # Add transition confirmation steps if enabled
    if config.transition_confirmation_enabled:
        for i in range(len(stages) - 1):
            curr_stage, next_stage = stages[i][0], stages[i + 1][0]
            stages[i][1].append(
                create_transition_confirmation_step(curr_stage, next_stage)
            )

    await mutate_state(
        initialized=True,
        current_stage_idx=0,
        messages=[HumanMessage(content=JOIN_CALL_MESSAGE)],
        events=EVENT_DESCRIPTORS,
        steps=OrderedDict(stages),
        completed_steps=[],
    )


@step()
async def before_workflow_stage():
    state = get_state(AgentState)
    await mutate_state(
        tool_call_detected=False,
        round_until_next_confirmation=max(0, state.round_until_next_confirmation - 1),
    )


@step()
async def select_stage():
    state = get_state(AgentState)
    config = get_config(AgentConfig)

    if state.current_stage_idx >= len(config.stages):
        return None

    return config.stages[state.current_stage_idx]


@step()
async def decide_next_stage():
    state = get_state(AgentState)
    config = get_config(AgentConfig)

    if state.current_stage_idx >= len(config.stages):
        return

    stages = config.stages
    current_stage = stages[state.current_stage_idx]

    # Check if all steps in the current stage are completed
    stage_steps = set([step.name for step in state.steps[current_stage]])
    completed_stage_steps = len(stage_steps - set(state.completed_steps)) == 0

    # If not all steps are completed, stay in the current stage
    if not completed_stage_steps:
        return

    # Move to the next stage
    next_stage = (
        stages[state.current_stage_idx + 1]
        if state.current_stage_idx + 1 < len(stages)
        else StageType.END
    )

    # Format the stage transition messages
    messages = (
        format_stage_transition_messages(next_stage)
        if current_stage != next_stage
        else []
    )

    await mutate_state(
        current_stage_idx=state.current_stage_idx + 1,
        messages=messages,
    )


@step()
async def trigger_on_tool_call():
    state = get_state(AgentState)

    if not state.tool_call_detected:
        return

    await trigger_workflow()


## INTRO STAGE ##
@step()
async def run_intro_workflow():
    state, config = get_state(AgentState), get_config(AgentConfig)

    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessagePromptTemplate.from_template(
                INTRO_BACKGROUND_PROMPT, template_format="jinja2"
            ),
            MessagesPlaceholder(variable_name="messages"),
        ]
    )

    llm = get_model(config.smart_model, config.temperature)

    if (
        config.transition_confirmation_enabled
        and state.round_until_next_confirmation == 0
    ):
        llm = llm.bind_tools([ConfirmStageCompletion])

    chain = prompt | llm.bind(stop=["SILENT", "<thinking>"])

    content = ""
    tool_call_detected = False
    function_name = ""
    async with channel_stream("assistant") as send:
        async for chunk in chain.astream(
            {
                "messages": state.messages,
                "steps": state.steps[StageType.INTRO],
            }
        ):
            if "tool_calls" in chunk.additional_kwargs:
                tool_call_detected = True
                tool_calls = chunk.additional_kwargs["tool_calls"]
                function_name = tool_calls[0]["function"]["name"]
                break
            else:
                content += cast(str, chunk.content)
                await send(chunk.content)

    if tool_call_detected:
        patch = get_stage_confirmation_tool_call_state_patch(
            StageType.INTRO, function_name, state
        )
        return await mutate_state(patch)

    # If the assistant doesn't say anything, we should return a SILENT message
    if len(content.strip()) != 0:
        return await mutate_state(
            messages=[AIMessage(content="SILENT", id=str(time.time()))]
        )


## CODING STAGE ##
@step()
async def run_coding_workflow():
    state = get_state(AgentState)

    time_diff = int(
        time.time() - CodeSessionState(**state.session_state).editor.last_updated / 1000
    )

    if time_diff < 2:
        await run_interrupter()
    else:
        await run_coding_assistant()


@step()
async def run_interrupter():
    await mutate_state(
        messages=[HumanMessage(content=TYPING_AWARE_INTERRUPTER_MESSAGE)]
    )


@step()
async def run_coding_assistant():
    state, config = get_state(AgentState), get_config(AgentConfig)

    messages = state.messages
    last_human_message_idx = -1

    # Find the last human message idx
    for idx in reversed(range(len(messages))):
        if messages[idx].type == "human":
            last_human_message_idx = idx
            break

    # Split the messages into history and upcoming messages
    # This action is necessary because we do not want to put coding context suffix at the very end of the prompt
    # because model will attend to the code context more often and less care about the last human message
    history_messages = messages[:last_human_message_idx]
    upcoming_messages = messages[last_human_message_idx:]

    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessagePromptTemplate.from_template(
                CODING_PROMPT, template_format="jinja2"
            ),
            MessagesPlaceholder(variable_name="history_messages"),
            HumanMessagePromptTemplate.from_template(
                CODING_CONTEXT_SUFFIX_PROMPT, template_format="jinja2"
            ),
            MessagesPlaceholder(variable_name="upcoming_messages"),
        ]
    )

    llm = get_model(
        model_name=config.smart_model,
        temperature=config.temperature,
    )

    if (
        config.transition_confirmation_enabled
        and state.round_until_next_confirmation == 0
    ):
        llm = llm.bind_tools([ConfirmStageCompletion])

    chain = prompt | llm.bind(stop=["SILENT", "<thinking>"])

    content = ""
    session_state = CodeSessionState(**state.session_state)
    session_metadata = SessionMetadata(**state.session_metadata)
    coding_steps = set(map(lambda step: step.name, state.steps[StageType.CODING]))

    tool_call_detected = False
    function_name = ""
    async with channel_stream("assistant") as send:
        async for chunk in chain.astream(
            {
                "events": state.events,
                "steps": state.steps[StageType.CODING],
                "completed_steps": set(state.completed_steps).intersection(
                    coding_steps
                ),
                "content": session_state.editor.content,
                "language": session_state.editor.language,
                "question": session_metadata.question_content,
                "test_context": state.test_context,
                "history_messages": history_messages,
                "upcoming_messages": upcoming_messages,
            }
        ):
            if "tool_calls" in chunk.additional_kwargs:
                tool_call_detected = True
                function_name = chunk.additional_kwargs["tool_calls"][0]["function"][
                    "name"
                ]
                break
            else:
                content += cast(str, chunk.content)
                await send(chunk.content)

    if tool_call_detected:
        patch = get_stage_confirmation_tool_call_state_patch(
            StageType.CODING, function_name, state
        )
        return await mutate_state(patch)

    # If the assistant doesn't say anything, we should return a SILENT message
    if len(content.strip()) == 0:
        return await mutate_state(
            messages=[AIMessage(content="SILENT", id=str(time.time()))]
        )

    return await mutate_state(test_context=None)


## EVAL STAGE ##
@step()
async def run_eval_workflow():
    await update_num_messages_so_far()
    await run_eval_assistant()
    await check_end_of_session()


@step()
async def update_num_messages_so_far():
    state = get_state(AgentState)
    num_messages_before_eval = min(
        state.num_messages_before_eval,
        len(state.messages),
    )

    return await mutate_state(num_messages_before_eval=num_messages_before_eval)


@step()
async def run_eval_assistant():
    state, config = get_state(AgentState), get_config(AgentConfig)

    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessagePromptTemplate.from_template(
                EVAL_FEEDBACK_PROMPT, template_format="jinja2"
            ),
            MessagesPlaceholder(variable_name="messages"),
        ]
    )

    llm = get_model(
        model_name=config.fast_model,
        temperature=config.temperature,
    )
    chain = prompt | llm.bind(stop=["SILENT", "<thinking>"])

    content = ""
    async with channel_stream("assistant") as send:
        async for chunk in chain.astream(
            {
                "messages": state.messages,
                "steps": state.steps[StageType.EVAL],
            }
        ):
            content += cast(str, chunk.content)
            await send(chunk.content)

    # If the assistant doesn't say anything, we should return a SILENT message
    if len(content.strip()) == 0:
        return await mutate_state(
            messages=[AIMessage(content="SILENT", id=str(time.time()))]
        )


@step()
async def check_end_of_session():
    state, config = get_state(AgentState), get_config(AgentConfig)

    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessagePromptTemplate.from_template(
                EVAL_FEEDBACK_PROMPT, template_format="jinja2"
            ),
            MessagesPlaceholder(variable_name="messages"),
            MessagesPlaceholder(variable_name="thought"),
        ]
    )

    llm = get_model(
        model_name=config.smart_model,
        temperature=0.1,
    )

    chain = prompt | llm.with_structured_output(ConfirmEndOfInterview)

    messages = [
        HumanMessage(
            content="(Below are the most recent conversations; earlier conversations are omitted.)"
        ),
        *state.messages[state.num_messages_before_eval - 3 :],
    ]

    result = await chain.ainvoke(
        {
            "messages": messages,
            "steps": state.steps[StageType.EVAL],
            "thought": format_end_of_session_thought_messages(),
        }
    )
    result = cast(ConfirmEndOfInterview, result)

    if result.should_end:
        patch = get_stage_confirmation_tool_call_state_patch(
            StageType.EVAL, "confirm_end_of_interview", state
        )
        return await mutate_state(patch)
