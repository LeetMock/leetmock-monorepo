from voice_pipeline.socket_server import socket_app
from fastapi import FastAPI
import socketio

app = FastAPI()
app.mount("/", socket_app)

import logging

# Set logging level to WARNING to suppress debug messages
logging.getLogger("openai").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)
logging.getLogger("httpx").setLevel(logging.WARNING)