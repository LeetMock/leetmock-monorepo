from agent_server.workflows.v1.constants import *
from agent_server.workflows.v1.steps import *
from agent_server.workflows.v1.types import (
    ContentChangedEvent,
    GroundTruthTestCaseExecutedEvent,
    ReminderEvent,
    TestCaseChangedEvent,
    TestCaseExecutedEvent,
    UserMessageEvent,
)
from livechain import root, subscribe
from livechain.graph.ops import mutate_state, trigger_workflow


@subscribe(UserMessageEvent)
async def on_user_message(event: UserMessageEvent):
    await mutate_state(messages=event.messages)
    await trigger_workflow()


@subscribe(ReminderEvent)
async def on_reminder(event: ReminderEvent):
    await mutate_state(messages=[event.message])
    await trigger_workflow()


@subscribe(TestCaseChangedEvent)
async def on_testcase_changed(event: TestCaseChangedEvent):
    formatted_messages = format_testcase_changed_notification_messages(event.data)
    await mutate_state(messages=formatted_messages)


@subscribe(TestCaseExecutedEvent)
async def on_testcase_executed(event: TestCaseExecutedEvent):
    formatted_messages = format_user_testcase_executed_notification_messages(event.data)
    await mutate_state(messages=formatted_messages)


@subscribe(ContentChangedEvent)
async def on_content_changed(event: ContentChangedEvent):
    formatted_messages = format_content_changed_notification_messages(event.data)
    await mutate_state(messages=formatted_messages)


@subscribe(GroundTruthTestCaseExecutedEvent)
async def on_ground_truth_testcase_executed(event: GroundTruthTestCaseExecutedEvent):
    await mutate_state(test_context=event.test_context)


@root()
async def entrypoint():
    await init_state()

    await before_workflow_stage()
    stage = await select_stage()

    if stage is None:
        return

    # TODO: Implement the stage logic
    # ...

    await decide_next_stage()
    await trigger_on_tool_call()
