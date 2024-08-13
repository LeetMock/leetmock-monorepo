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
   Create a `.env` file in the llm-server directory with the following content:

   ```
   OPENAI_API_KEY="your openai key"
   RETELL_API_KEY="from retell console"
   CONVEX_DEPLOYMENT="created by running npx convex dev"
   CONVEX_URL="created by running npx convex dev"
   RETELL_AGENT_ID="get from retell console"
   ```

   Replace the placeholder values with your actual API keys and IDs.

6. Start the server:

   ```
   uvicorn app.server:app --reload --port=8080
   ```

7. Install ngrok:

   - For macOS (using Homebrew):
     ```
     brew install ngrok
     ```
   - For Windows (using Chocolatey):
     ```
     choco install ngrok
     ```
   - For other systems or manual installation, visit the [ngrok download page](https://ngrok.com/download).

8. Expose the local server using ngrok:
   In a new terminal window, run:

   ```
   ngrok http 8080
   ```

   This will create a public URL forwarding to your local endpoint.

9. Configure Retell Agent:
   - Copy the websocket URL provided by ngrok (it should look like `wss://xxxx-xx-xx-xxx-xx.ngrok.io`).
   - Follow the instructions in the llm-server directory to add this websocket endpoint to the Retell agent console.

Now, the llm-server should be up and running, exposed to the internet via ngrok, and properly configured with Retell.
