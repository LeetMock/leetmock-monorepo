set positional-arguments

# Setup Fly.io secrets from .env.prod file
setup:
    python3 scripts/setup_env.py

# Generate the convex client openapi client types
gen-convex-client:
    npm config set registry https://registry.npmjs.org
    rm -f convex-client.yaml
    rm -rf convex-client
    cd client && npm run generate-schema && cd ..
    openapi-generator-cli generate \
    -i convex-client.yaml \
    -g python \
    -o convex-client \
    --package-name convex_client

# Run the gen-convex-client command in a docker container, wrapping the deploy key in double quotes
# just gen-convex-client-docker "<deploy_key>"
@gen-convex-client-docker deploy_key:
    docker build -t convex-client-generator .
    docker run --rm -v ${PWD}:/app -e CONVEX_DEPLOY_KEY=$1 convex-client-generator

# if using podman
# just gen-convex-client-podman "<deploy_key>", wrapping the deploy key in double quotes
@gen-convex-client-podman deploy_key:
    podman build -t convex-client-generator .
    podman run --rm -v ${PWD}:/app -e CONVEX_DEPLOY_KEY=$1 convex-client-generator

# Import processed questions into Convex
import-questions:
    cd client && npx convex import --table questions '../question-utils/output/selected_questions.jsonl' && cd ..

run-convex-local:
    cd client && npx convex dev --admin-key 0135d8598650f8f5cb0f30c34ec2e2bb62793bc28717c8eb6fb577996d50be5f4281b59181095065c5d0f86a2c31ddbe9b597ec62b47ded69782cd --url "http://127.0.0.1:3210"
    npx convex import --table questions '../question-utils/output/selected_questions.jsonl' --admin-key 0135d8598650f8f5cb0f30c34ec2e2bb62793bc28717c8eb6fb577996d50be5f4281b59181095065c5d0f86a2c31ddbe9b597ec62b47ded69782cd --url "http://127.0.0.1:3210"
    npx convex import --table inviteCodes '../question-utils/output/inviteCodes.jsonl' --admin-key 0135d8598650f8f5cb0f30c34ec2e2bb62793bc28717c8eb6fb577996d50be5f4281b59181095065c5d0f86a2c31ddbe9b597ec62b47ded69782cd --url "http://127.0.0.1:3210"
    cd ..
# Forward stripe event to local convex webhook handler
# download stripe cli and run `stripe login` to login to stripe account
# set dotenv-path := "./client/.env.local"
# convex-deployment := env_var('CONVEX_DEPLOYMENT')
# forward-stripe-event:
#     echo "Forwarding stripe event to https://{{trim_start_match(convex-deployment, "dev:")}}.convex.site/stripe-webhook"
#     stripe listen --forward-to https://{{trim_start_match(convex-deployment, "dev:")}}.convex.site/stripe-webhook


