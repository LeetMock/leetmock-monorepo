# Use an official Node.js runtime as the base image
FROM node:18

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip default-jdk

# Install OpenAPI Generator CLI
RUN npm install @openapitools/openapi-generator-cli -g

# Install just
RUN curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to /usr/local/bin

# Set the working directory in the container
WORKDIR /app

# Run the justfile command when the container launches
CMD ["just", "gen-convex-client"]