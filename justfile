run-ngrok:
    @echo "Running ngrok"
    ngrok http 8080

run-llm-server:
    @echo "Running LLM server"
    cd llm-server
    poetry run uvicorn llm_server.server:app --reload --port 8080 --log-level info

run-voice-pipeline:
    @echo "Running voice pipeline"
    cd voice-pipeline
    poetry run uvicorn voice_pipeline.main:app --reload --port 5050 --log-level info

run-client:
    @echo "Running client"
    cd client
    npm run dev

install-all:
    @echo "Installing all dependencies"
    cd llm-server
    poetry install --no-root
    cd ..
    cd voice-pipeline
    poetry install --no-root
    cd ..
    cd agent-graph
    poetry install --no-root
    cd ..
    cd libs
    poetry install --no-root
    cd ..
    poetry install --no-root