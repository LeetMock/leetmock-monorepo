from logging import getLogger

from langgraph_sdk.client import LangGraphClient
from langgraph_sdk.schema import Assistant, Thread
from langchain_core.messages import HumanMessage

from llm_server.types import (
    ResponseRequiredRequest,
    ResponseResponse,
)
from llm_server.utils.messages import convert_transcript_to_messages

logger = getLogger(__name__)


class LlmClient:

    def __init__(
        self,
        client: LangGraphClient,
        assistant: Assistant,
        thread: Thread,
        question: str,
    ):
        self.client = client
        self.assistant = assistant
        self.thread = thread
        self.question = question

    async def draft_begin_message(self):
        run = await self.client.runs.create(
            self.thread["thread_id"],
            assistant_id=self.assistant["assistant_id"],
            input={
                "messages": [
                    HumanMessage(content="(User just joined the call, you would say:)")
                ],
            },
        )

        await self.client.runs.join(self.thread["thread_id"], run["run_id"])
        state = await self.client.threads.get_state(self.thread["thread_id"])
        begin_message = state["values"]["response"]["content"]  # type: ignore

        response = ResponseResponse(
            response_id=0,
            content=begin_message,
            content_complete=True,
            end_call=False,
        )

        return response

    async def draft_response(
        self, request: ResponseRequiredRequest, session_data: dict
    ):
        interaction_type = request.interaction_type
        messages = convert_transcript_to_messages(request.transcript)

        # update the graph with the latest transcript messages
        await self.client.threads.update_state(
            thread_id=self.thread["thread_id"],
            values={
                "messages": messages,
            },
        )

        editor_content = session_data["code_block"]
        content_last_updated = session_data["last_code_update_timestamp"]

        if interaction_type == "reminder_required":
            logger.info("Reminder required, sending reminder message")

        total_content = ""
        async for chunk in self.client.runs.stream(
            thread_id=self.thread["thread_id"],
            assistant_id=self.assistant["assistant_id"],
            input={
                "coding_question": self.question,
                "editor_content": editor_content,
                "content_last_updated": content_last_updated,
                "interaction_type": interaction_type,
            },
            multitask_strategy="interrupt",
            stream_mode=["events"],
        ):
            if not chunk.data or chunk.event == "metadata":
                continue

            if (
                "chatbot" not in chunk.data["tags"]
                or chunk.data["event"] != "on_chat_model_stream"
            ):
                continue

            content = chunk.data.get("data", {}).get("chunk", {}).get("content", "")
            total_content += content

            response = ResponseResponse(
                response_id=request.response_id,
                content=content,
                content_complete=False,
                end_call=False,
            )
            yield response

        logger.info(f"Agent Response: {total_content}")

        if len(total_content) == 0:
            response = ResponseResponse(
                response_id=request.response_id,
                content="SILENT",
                content_complete=False,
                end_call=False,
            )
            logger.info("No response from agent")

        # Send final response with "content_complete" set to True to signal completion
        response = ResponseResponse(
            response_id=request.response_id,
            content="",
            content_complete=True,
            end_call=False,
        )
        yield response
