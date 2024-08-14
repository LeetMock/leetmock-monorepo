import json
import os
import asyncio
import logging

from typing import Annotated
from concurrent.futures import TimeoutError as ConnectionTimeoutError

from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Depends
from logging import getLogger

from retell import Retell
from convex import ConvexClient
from langgraph_sdk import get_client
from langgraph_sdk.schema import Assistant

from llm_server.llm import LlmClient
from llm_server.types import ConfigResponse, ResponseRequiredRequest
from llm_server.settings import get_settings

settings = get_settings()

logging.basicConfig(level=logging.INFO)

logger = getLogger(__name__)


app = FastAPI()

retell = Retell(api_key=settings.RETELL_API_KEY)
convex_client = ConvexClient(deployment_url=settings.CONVEX_URL)
lg_client = get_client(url=settings.LANGGRAPH_API_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust the allowed origins as needed
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],
)


async def get_assistant() -> Assistant:
    assistants = await lg_client.assistants.search(graph_id="code-mock-v1")
    assert len(assistants) > 0, "No assistant found"

    return assistants[0]


AssistantDep = Annotated[Assistant, Depends(get_assistant)]


# Handle webhook from Retell server. This is used to receive events from Retell server.
# Including call_started, call_ended, call_analyzed
@app.post("/webhook")
async def handle_webhook(request: Request):
    try:
        post_data = await request.json()
        valid_signature = retell.verify(
            json.dumps(post_data, separators=(",", ":")),
            api_key=settings.RETELL_API_KEY,
            signature=str(request.headers.get("X-Retell-Signature")),
        )
        if not valid_signature:
            logger.info(
                "Received Unauthorized",
                post_data["event"],
                post_data["data"]["session_id"],
            )
            return JSONResponse(status_code=401, content={"message": "Unauthorized"})
        if post_data["event"] == "call_started":
            logger.info("Call started event", post_data["data"]["session_id"])
        elif post_data["event"] == "call_ended":
            logger.info("Call ended event", post_data["data"]["session_id"])
        elif post_data["event"] == "call_analyzed":
            logger.info("Call analyzed event", post_data["data"]["session_id"])
        else:
            logger.info("Unknown event", post_data["event"])
        return JSONResponse(status_code=200, content={"received": True})
    except Exception as err:
        logger.info(f"Error in webhook: {err}")
        return JSONResponse(
            status_code=500, content={"message": "Internal Server Error"}
        )


# Only used for web call frontend to register call so that frontend don't need api key.
# If you are using Retell through phone call, you don't need this API. Because
# this.twilioClient.ListenTwilioVoiceWebhook() will include register-call in its function.
@app.post("/register-call")
async def handle_register_call(request: Request):
    try:
        call_response = retell.call.create_web_call(agent_id=settings.RETELL_AGENT_ID)

        logger.info(f"Call response: {call_response}")
        return JSONResponse(
            status_code=200,
            content={
                "access_token": call_response.access_token,
                "session_id": call_response.call_id,
            },
        )
    except Exception as err:
        logger.info(f"Error in register call: {err}")
        return JSONResponse(
            status_code=500, content={"message": "Internal Server Error"}
        )


@app.websocket("/voice-pipeline-llm-websocket/{session_id}")
async def voice_pipeline_websocket_handler(
    websocket: WebSocket,
    session_id: str,
    assistant: AssistantDep,
):
    try:
        await websocket.accept()

        user_session = convex_client.query(
            "sessions:getBySessionId", {"session_id": session_id}
        )

        question = convex_client.query(
            "questions:getByQuestionId", {"question_id": user_session["question_id"]}
        )

        thread = await lg_client.threads.create()
        llm_client = LlmClient(
            client=lg_client,
            thread=thread,
            assistant=assistant,
            question=question["question"],
        )

        # Send first message to signal ready of server
        response_id = 0
        first_event = await llm_client.draft_begin_message()
        await websocket.send_json(first_event.__dict__)

        async def handle_message(request_json):
            nonlocal response_id

            # There are 5 types of interaction_type: call_details, pingpong, update_only, response_required, and reminder_required.
            # Not all of them need to be handled, only response_required and reminder_required.
            if request_json["interaction_type"] == "call_details":
                logger.info(json.dumps(request_json, indent=2))
                return
            if request_json["interaction_type"] == "ping_pong":
                await websocket.send_json(
                    {
                        "response_type": "ping_pong",
                        "timestamp": request_json["timestamp"],
                    }
                )
                return
            if request_json["interaction_type"] == "update_only":
                return
            if (
                request_json["interaction_type"] == "response_required"
                or request_json["interaction_type"] == "reminder_required"
            ):
                response_id = request_json["response_id"]
                request = ResponseRequiredRequest(
                    interaction_type=request_json["interaction_type"],
                    response_id=response_id,
                    transcript=request_json["transcript"],
                )
                logger.info(
                    f"""Received interaction_type={request_json['interaction_type']}, response_id={response_id}, last_transcript={request_json['transcript'][-1]['content']}"""
                )

                user_session = convex_client.query(
                    "sessions:getBySessionId", {"session_id": session_id}
                )

                async for event in llm_client.draft_response(request, user_session):
                    if request.response_id < response_id:
                        break  # new response needed, abandon this one

                    await websocket.send_json(event.__dict__)
                    await asyncio.sleep(0)

                logger.info(f"Finished response_id={response_id}")

        async for data in websocket.iter_json():
            asyncio.create_task(handle_message(data))

    except WebSocketDisconnect:
        logger.info(f"LLM WebSocket disconnected for {session_id}")
    except ConnectionTimeoutError as e:
        logger.info("Connection timeout error for {session_id}")
    except Exception as e:
        logger.info(f"Error in LLM WebSocket: {e} for {session_id}")
        await websocket.close(1011, "Server error")
    finally:
        logger.info(f"LLM WebSocket connection closed for {session_id}")


# Start a websocket server to exchange text input and output with Retell server. Retell server
# will send over transcriptions and other information. This server here will be responsible for
# generating responses with LLM and send back to Retell server.
@app.websocket("/llm-websocket/{session_id}")
async def websocket_handler(
    websocket: WebSocket,
    session_id: str,
    assistant: AssistantDep,
):
    try:
        await websocket.accept()

        user_session = convex_client.query(
            "sessions:getBySessionId", {"session_id": session_id}
        )

        question = convex_client.query(
            "questions:getByQuestionId", {"question_id": user_session["question_id"]}
        )

        thread = await lg_client.threads.create()
        llm_client = LlmClient(
            client=lg_client,
            thread=thread,
            assistant=assistant,
            question=question["question"],
        )

        # Send optional config to Retell server
        config = ConfigResponse(
            response_type="config",
            config={
                "auto_reconnect": True,
                "call_details": True,
            },
        )
        await websocket.send_json(config.__dict__)

        # Send first message to signal ready of server
        response_id = 0
        first_event = await llm_client.draft_begin_message()
        await websocket.send_json(first_event.__dict__)

        async def handle_message(request_json):
            nonlocal response_id

            # There are 5 types of interaction_type: call_details, pingpong, update_only, response_required, and reminder_required.
            # Not all of them need to be handled, only response_required and reminder_required.
            if request_json["interaction_type"] == "call_details":
                logger.info(json.dumps(request_json, indent=2))
                return
            if request_json["interaction_type"] == "ping_pong":
                await websocket.send_json(
                    {
                        "response_type": "ping_pong",
                        "timestamp": request_json["timestamp"],
                    }
                )
                return
            if request_json["interaction_type"] == "update_only":
                return
            if (
                request_json["interaction_type"] == "response_required"
                or request_json["interaction_type"] == "reminder_required"
            ):
                response_id = request_json["response_id"]
                request = ResponseRequiredRequest(
                    interaction_type=request_json["interaction_type"],
                    response_id=response_id,
                    transcript=request_json["transcript"],
                )
                logger.info(
                    f"""Received interaction_type={request_json['interaction_type']}, response_id={response_id}, last_transcript={request_json['transcript'][-1]['content']}"""
                )

                user_session = convex_client.query(
                    "sessions:getBySessionId", {"session_id": session_id}
                )

                async for event in llm_client.draft_response(request, user_session):
                    if request.response_id < response_id:
                        break  # new response needed, abandon this one

                    await websocket.send_json(event.__dict__)
                    await asyncio.sleep(0)

                logger.info(f"Finished response_id={response_id}")

        async for data in websocket.iter_json():
            asyncio.create_task(handle_message(data))

    except WebSocketDisconnect:
        logger.info(f"LLM WebSocket disconnected for {session_id}")
    except ConnectionTimeoutError as e:
        logger.info("Connection timeout error for {session_id}")
    except Exception as e:
        logger.info(f"Error in LLM WebSocket: {e} for {session_id}")
        await websocket.close(1011, "Server error")
    finally:
        logger.info(f"LLM WebSocket connection closed for {session_id}")
