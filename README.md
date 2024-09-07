# leetmock-monorepo

## Structure

The project repo contain 4 main components:

### client

This is the web client for the project. It is a Next.js app that uses
tailwind css and chadcn ui for the styling. It uses the [Convex](https://convex.dev) backend for its database and services.

### agent-server

Agent server contains code for livekit worker and interface for invoking
langgraph agent. We use [Livekit](https://livekit.com/) as the video and audio
transport layer.

### agent-graph

This is a langgraph agent that is used to for performing mock interviews.

### convex-client

This is the generated convex openapi client code form the convex backend, which
is mainly used by the agent-server for calling convex functions.

---

## Setup

### Prerequisites

- [Convex CLI](https://docs.convex.dev/cli)
- [Livekit CLI](https://docs.livekit.com/cli)
- [Node.js](https://nodejs.org/en/download)
- [npm](https://www.npmjs.com/get-npm)
- [poetry](https://python-poetry.org/docs/#installing-with-the-official-installer)
- [just](https://github.com/casey/just#packages)

### Environment Variable Setup

[TODO]

---

## Install Dependencies & Run Project

#### client

```bash
cd client
npm install
npm run dev

# in a separate terminal, run the following to sync convex backend
cd client
npx convex dev
```

**Note**: The first time and everytime convex backend is updated, you need to manually run

```bash
# npm install -g @openapitools/openapi-generator-cli
# npm install -g convex
# sudo apt install default-jre default-jdk
just gen-convex-client
```

in the root directory to generate the updated client openapi python types for agent-server to use.

#### agent-server

```bash
cd agent-server

# if this is the first time installing dependencies, run the following
poetry install

# if dependencies are already installed, run the following to activate the venv and run the server
poetry lock --no-update

poetry shell
python ./agent_server/worker.py dev
```

#### agent-graph

Make sure the agent mapping inside `langgraph.json` matches repo structure.

To test the local agent graph, run the following:

```bash
pip install langgraph

export LANGGRAPH_API_KEY=<your_key>

langgraph up
```

---

## Deployment

### client

1. Go to [Vercel Dashboard](https://vercel.com/brian-yins-projects/leetmock-monorepo) and deploy the project.

2. Resolve any deployment errors and the project should be deployed successfully.

### agent-server

Per each commit, the following github actions will run:

- deploy-to-fly: Deploy the agent server to fly.io


Run worker image locally:

```bash
cd agent-server
```

Comment out the `.env` in `.dockerignore` and rebuild the image locally:

```bash
docker build -t test .
docker run test
```

### agent-graph

1. Go to [Langgraph Cloud](https://smith.langchain.com/o/a1dd4f2f-afd6-4f46-9cc3-4573dea18ebd/host) and choose the current
   deployment `leetmock-agent`.

2. Click on the `+ New Version` button on the top right to create a new version.

3. Update the necessary environment variables.
