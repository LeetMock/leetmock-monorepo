import asyncio
import logging
import uuid
from collections.abc import AsyncIterable
from typing import Any, AsyncGenerator

from dotenv import find_dotenv, load_dotenv
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    JobProcess,
    RoomInputOptions,
    RoomOutputOptions,
    WorkerOptions,
    cli,
    metrics,
)
from livekit.agents.llm import FunctionTool
from livekit.agents.llm.chat_context import ChatContext, ChatMessage
from livekit.agents.llm.llm import ChatChunk
from livekit.agents.voice import MetricsCollectedEvent
from livekit.agents.voice.agent import ModelSettings
from livekit.plugins import cartesia, deepgram, openai, silero, turn_detector
from livekit.plugins.openai.utils import to_chat_ctx

from examples.basic_workflow import AgentConfig, CreateReminderEvent, RemindUserEvent, UserChatEvent, create_executor
from examples.utils import convert_oai_message_to_langchain_message
from livechain.graph import WorkflowExecutor
from livechain.graph.types import EventSignal






def __init__():
    load_dotenv(find_dotenv())
    logging.basicConfig(level=logging.INFO)
    metrics.init()


