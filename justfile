set positional-arguments

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
    cd client && npx convex import --table questions '../question-utils/output/processed_questions.jsonl' && cd ..

# Forward stripe event to local convex webhook handler
# download stripe cli and run `stripe login` to login to stripe account
# set dotenv-path := "./client/.env.local"
# convex-deployment := env_var('CONVEX_DEPLOYMENT')
# forward-stripe-event:
#     echo "Forwarding stripe event to https://{{trim_start_match(convex-deployment, "dev:")}}.convex.site/stripe-webhook"
#     stripe listen --forward-to https://{{trim_start_match(convex-deployment, "dev:")}}.convex.site/stripe-webhook
