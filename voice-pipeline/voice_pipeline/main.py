from fastapi import FastAPI
from dotenv import load_dotenv, find_dotenv

from voice_pipeline.socket_server import socket_app

load_dotenv(find_dotenv())

app = FastAPI()
app.mount("/", socket_app)

import logging

# Set logging level to WARNING to suppress debug messages
logging.getLogger("openai").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)
logging.getLogger("httpx").setLevel(logging.WARNING)
