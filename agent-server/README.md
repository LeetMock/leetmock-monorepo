# How to run

1. Install dependencies
2. python3 agent_server/worker.py dev
3. https://agents-playground.livekit.io/ 


```bash
# Build locally
cd leetmock-monorepo
podman build -t agent-server .

# Run
podman run -it -p 8081:8081 agent-server
```

# Deploy to fly.io
```bash
fly deploy -c fly.toml
```
