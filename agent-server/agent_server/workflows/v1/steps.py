from collections import OrderedDict

from agent_server.workflows.v1.constants import *
from agent_server.workflows.v1.types import *
from livechain import step
from livechain.graph.ops import get_config, get_state, mutate_state, trigger_workflow


@step()
async def init_state():
    config = get_config(AgentConfig)
    state = get_state(AgentState)

    default_step_map = get_step_map(state.interview_flow)
    stages = [(name, steps) for name, steps in default_step_map.items()]

    # Add transition confirmation steps if enabled
    if config.transition_confirmation_enabled:
        for i in range(len(stages) - 1):
            curr_stage, next_stage = stages[i][0], stages[i + 1][0]
            stages[i][1].append(
                create_transition_confirmation_step(curr_stage, next_stage)
            )

    return dict(
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
