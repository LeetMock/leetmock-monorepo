# leetmock-monorepo

(updating... Allen)
This repository contains two main components: llm-server and leetmock.

## Getting Started

Follow these steps to set up and run the project:

### Setting up leetmock

1. Navigate to the leetmock directory:

   ```
   cd leetmock
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the Convex backend:

   - Open a terminal and run:
     ```
     npx convex dev
     ```
   - Follow the prompts to open a new project.
   - A `.env.local` file will be generated automatically.
   - import the question list to convex table by running the following command

   ```
   npx convex import --table questions convex/data/questions.jsonl
   ```

4. Verify the `.env.local` file:
   The generated `.env.local` file should have the following format:

   ```
   # Deployment used by `npx convex dev`
   CONVEX_DEPLOYMENT=XXX
   # team: allengao6, project: leetmock
   NEXT_PUBLIC_CONVEX_URL=XXX
   ```

   Make sure these values are correctly populated.
   **See specific .env.local schema in the section below.**

5. Start the Next.js frontend:
   - Open another terminal and run:
     ```
     npm run dev
     ```

Now, leetmock should be up and running with both the Convex backend and Next.js frontend.

### Setting up llm-server

1. Install Poetry:

   - For macOS/Linux:
     ```
     curl -sSL https://install.python-poetry.org | python3 -
     ```
   - For Windows:
     ```
     (Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | py -
     ```
     For more detailed instructions, visit the [Poetry documentation](https://python-poetry.org/docs/#installation).

2. Navigate to the llm-server directory:

   ```
   cd llm-server
   ```

3. Install dependencies:

   ```
   poetry install
   ```

4. Activate the virtual environment:

   ```
   poetry shell
   ```

5. Set up environment variables:
   Make sure .env file is created in the leetmock-monorepo directory. 
   See the section below for more details.

6. Start the server:

   ```
   uvicorn app.server:app --reload --port=8080
   ```

7. Install ngrok: **not required if using voice-pipeline**

   - For macOS (using Homebrew):
     ```
     brew install ngrok
     ```
   - For Windows (using Chocolatey):
     ```
     choco install ngrok
     ```
   - For other systems or manual installation, visit the [ngrok download page](https://ngrok.com/download).

8. Expose the local server using ngrok: **not required if using voice-pipeline**
   In a new terminal window, run:

   ```
   ngrok http 8080
   ```

   This will create a public URL forwarding to your local endpoint.

9. Configure Retell Agent: **not required if using voice-pipeline**
   - Copy the websocket URL provided by ngrok (it should look like `wss://xxxx-xx-xx-xxx-xx.ngrok.io`).
   - Follow the instructions in the llm-server directory to add this websocket endpoint to the Retell agent console.

Now, the llm-server should be up and running, exposed to the internet via ngrok, and properly configured with Retell.


### Setting up voice-pipeline

1. Install Poetry:

   Similar process as above for llm-server.

2. Navigate to the llm-server directory:

   ```
   cd voice-pipeline
   ```

3. Install dependencies:

   ```
   poetry install
   ```

4. Activate the virtual environment:

   ```
   poetry shell
   ```

5. Set up environment variables:
   See the section below for more details.

6. Install gcloud CLI and initialize it:
   https://cloud.google.com/sdk/docs/instal
   
   ```
   gcloud init
   ```

   Create local authentication credentials for your user account:
   ```
   gcloud auth application-default login
   ```

   See details: https://cloud.google.com/speech-to-text/docs/transcribe-client-libraries
   
   If the account already enables the speech-to-text API, then these commands should be enough to set up the authentication.

7. Start the server:

   ```
   uvicorn --port 5050 voice_pipeline.main:app --reload --log-level info
   ```

   If errors encountered due to google cloud authentication, see the error message and follow the instructions to set up the authentication.

## .env Schema

```
# Shared
OPENAI_API_KEY=FILL_ME_IN
CONVEX_DEPLOYMENT=FILL_ME_IN
CONVEX_URL=FILL_ME_IN

# Voice Pipeline
LLM_SERVER_WS_URL="ws://localhost:8080"
GOOGLE_CLOUD_PROJECT=FILL_ME_IN    # required for local voice pipeline

# LLM Server
RETELL_API_KEY=FILL_ME_IN      # not required if using voice-pipeline
RETELL_AGENT_ID=FILL_ME_IN     # not required if using voice-pipeline
LANGGRAPH_API_URL=FIIL_ME_IN
LANGSMITH_API_KEY=FIIL_ME_IN
LANGCHAIN_TRACING_V2="true"

VOICE_PIPELINE_SERVER_URL="localhost:5050"
```

## .env.local Schema

```
# Deployment used by `npx convex dev`
CONVEX_DEPLOYMENT=FILL_ME_IN

NEXT_PUBLIC_CONVEX_URL=FILL_ME_IN
NEXT_PUBLIC_VOICE_PIPELINE_SOCKETIO=localhost:5050

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=FILL_ME_IN
CLERK_SECRET_KEY=FILL_ME_IN
```

# Deployment

## For future 
In future, we are going to deploy our services using k8s 

https://kubernetes.io/docs/tutorials/kubernetes-basics/

https://stackoverflow.com/questions/41492878/command-x86-64-linux-gnu-gcc-failed-with-exit-status-1

For the first stage, before we encounter the bottleneck, we are going with the easy route: PM2.

## Deploy Next JS App

First Time Deployment, following these two guides [guide 1](https://shahriar-ratul.medium.com/deploying-a-next-js-application-on-ubuntu-using-nginx-nodejs-pm2-5912b463832c) [guide 2](https://utsavdesai26.medium.com/the-ultimate-guide-to-deploying-a-next-js-application-with-nginx-937854538d68)

Essentially, first time deployment

```shell
cd client
npx convex deploy --cmd 'npm run build'
pm2 start npm --name leetmock -- start
# steps to set up Nginx, check out the guide
# ...
```

Or second time deployment

```shell
pm2 restart leetmock
sudo systemctl restart nginx
```

## Monitor
```shell
pm2 monit leetmock
```


## Deploy Voice Pipeline

```shell
cd voice-pipeline
poetry shell
pm2 start ../deployment/voice_pipeline.sh
```

## Deploy llm server

```shell
cd llm-server
poetry shell
pm2 start ../deployment/llm_server.sh
```