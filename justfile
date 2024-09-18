set positional-arguments

# Generate the convex client openapi client types
gen-convex-client:
    rm -f convex-client.yaml
    cd client && npm run generate-schema && cd ..
    rm -rf convex-client
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