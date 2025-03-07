# How to run

1. Install dependencies
2. python3 agent_server/worker.py dev
3. https://agents-playground.livekit.io/ 

to run the agent server locally, you need to run the following commands:

uv install
just run

```bash
# Build locally for pre-production testing
cd leetmock-monorepo
podman build -t agent-server -f agent-server/Dockerfile .

# Run locally for pre-production testing
podman run --env-file agent-server/.env -it -p 8081:8081 agent-server
```

# Deploy to fly.io
```bash
fly deploy -c fly.toml
```


# Set environment variables
```bash
fly secrets set -a agent-server-winter-snow-3785 KEY=VALUE
```