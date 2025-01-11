#!/bin/bash

# Read the .env file and unset matching environment variables
while IFS='=' read -r key value || [[ -n "$key" ]]; do
    # Skip comments and empty lines
    [[ $key =~ ^#.*$ ]] || [[ -z $key ]] && continue

    # Extract the environment variable name
    env_name=$(echo "$key" | tr -d ' ')

    # Unset the environment variable if it exists
    if [[ -n "${!env_name}" ]]; then
        unset "$env_name"
        echo "Unset $env_name"
    fi
done < .env