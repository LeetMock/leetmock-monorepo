# Generate the convex client openapi client types
gen:
    rm -f convex-client.yaml
    cd client && npm run generate-schema && cd ..
    rm -rf convex-client
    openapi-generator-cli generate \
    -i convex-client.yaml \
    -g python \
    -o convex-client \
    --package-name convex_client

