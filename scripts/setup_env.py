import argparse
import os
import subprocess
from pathlib import Path
from pprint import pprint


def read_env_file(env_file_path):
    """Read environment variables from .env file, skipping comments and empty lines."""
    env_vars = {}
    with open(env_file_path, "r") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#"):
                key, value = line.split("=", 1)
                env_vars[key.strip()] = value.strip()
    return env_vars


def set_fly_secrets(env_vars):
    """Set environment variables as Fly.io secrets."""
    # list existing env
    command = "fly secrets list"
    print("\nExisting Fly.io secrets:")
    subprocess.run(command, shell=True, check=True)

    print("\nFound environment variables for Fly.io:")
    pprint(env_vars, indent=2)

    confirm = input("\nDo you want to set these secrets in Fly.io? (y/N): ")
    if confirm.lower() != "y":
        print("Aborted Fly.io setup.")
        return

    print("\nSetting Fly.io secrets...")
    for key, value in env_vars.items():
        command = f"fly secrets set {key}={value}"

        try:
            subprocess.run(command, shell=True, check=True)
            print(f"✓ Successfully set {key}")
        except subprocess.CalledProcessError as e:
            print(f"✗ Error setting {key}: {e}")


def set_convex_env(env_vars):
    """Set environment variables in Convex."""
    # list existing env
    command = "npx convex env ls"
    print("\nExisting Convex environment variables:")
    subprocess.run(command, shell=True, check=True)

    print("\nFound environment variables for Convex:")
    pprint(env_vars, indent=2)

    confirm = input("\nDo you want to set these variables in Convex? (y/N): ")
    if confirm.lower() != "y":
        print("Aborted Convex setup.")
        return

    print("\nSetting Convex environment variables...")
    for key, value in env_vars.items():
        if not key.startswith("NEXT_PUBLIC_"):  # Skip public env vars
            command = f'npx convex env set {key} "{value}"'
            try:
                subprocess.run(command, shell=True, check=True)
                print(f"✓ Successfully set {key}")
            except subprocess.CalledProcessError as e:
                print(f"✗ Error setting {key}: {e}")


def main():
    parser = argparse.ArgumentParser(
        description="Set Fly.io secrets and Convex env vars from .env files"
    )
    parser.add_argument(
        "--server-env",
        default="./agent-server/.env.prod",
        help="Path to server .env file (default: ./agent-server/.env.prod)",
    )
    parser.add_argument(
        "--client-env",
        default="./client/.env.prod",
        help="Path to client .env file (default: ./client/.env.prod)",
    )

    args = parser.parse_args()

    # Ensure the env files exist
    server_env_path = Path(args.server_env)
    client_env_path = Path(args.client_env)

    if not server_env_path.exists():
        print(f"Error: Server environment file {args.server_env} not found")
        return 1

    if not client_env_path.exists():
        print(f"Error: Client environment file {args.client_env} not found")
        return 1

    # Read environment variables
    server_env_vars = read_env_file(server_env_path)
    client_env_vars = read_env_file(client_env_path)

    # Set variables as Fly secrets (server env vars)
    set_fly_secrets(server_env_vars)

    # Set variables in Convex (client env vars)
    set_convex_env(client_env_vars)

    return 0


if __name__ == "__main__":
    exit(main())
