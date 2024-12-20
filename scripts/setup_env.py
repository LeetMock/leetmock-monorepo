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
    print("Existing secrets:")
    subprocess.run(command, shell=True, check=True)

    print("\nFound environment variables:")
    pprint(env_vars, indent=2)

    confirm = input("\nDo you want to set these secrets in Fly.io? (y/N): ")
    if confirm.lower() != "y":
        print("Aborted.")
        return

    print("\nSetting secrets...")
    for key, value in env_vars.items():
        command = f"fly secrets set {key}={value}"

        try:
            subprocess.run(command, shell=True, check=True)
            print(f"✓ Successfully set {key}")
        except subprocess.CalledProcessError as e:
            print(f"✗ Error setting {key}: {e}")


def main():
    parser = argparse.ArgumentParser(description="Set Fly.io secrets from .env file")
    parser.add_argument(
        "--env-file",
        default="./agent-server/.env.prod",
        help="Path to .env file (default: agent-server/.env.prod)",
    )

    args = parser.parse_args()

    # Ensure the env file exists
    env_file_path = Path(args.env_file)
    if not env_file_path.exists():
        print(f"Error: Environment file {args.env_file} not found")
        return 1

    # Read environment variables
    env_vars = read_env_file(env_file_path)

    # Set variables as Fly secrets
    set_fly_secrets(env_vars)

    return 0


if __name__ == "__main__":
    exit(main())
