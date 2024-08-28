# How to run

1. Install dependencies
2. python3 agent_server/minimal_assistant.py dev
3. https://agents-playground.livekit.io/ 


```bash
# Build locally
podman build -t agent-server .

# Run
podman run -it -p 8081:8081 agent-server
```

# Deploy to fly.io
```bash
fly deploy -c fly.toml
```
