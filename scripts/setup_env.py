import argparse
import os
import subprocess
from pathlib import Path
from typing import Callable, Dict, Literal, Set

from colorama import Fore, Style, init

# Initialize colorama
init()

SetEnvFunc = Callable[[str, str], None]
ListEnvFunc = Callable[[], None]

EnvType = Literal["flyio", "convex", "vercel"]

SERVER_ENV_PATH = Path("./agent-server/.env.prod")
CLIENT_ENV_PATH = Path("./client/.env.prod")

CONVEX_REQUIRED_KEYS = set(
    [
        "LIVEKIT_API_KEY",
        "LIVEKIT_API_SECRET",
        "LANGSMITH_API_KEY",
        "LANGGRAPH_API_URL",
        "RAPIDAPI_KEY",
        "STRIPE_KEY",
        "CLERK_JWT_ISSUER_DOMAIN",
    ]
)

VERCEL_REQUIRED_KEYS = set(
    [
        "NEXT_PUBLIC_CONVEX_URL",
        "NEXT_PUBLIC_LIVEKIT_URL",
        "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
        "NEXT_PUBLIC_STRIPE_KEY",
        "NEXT_PUBLIC_PRICING_TABLE_ID",
        "NEXT_PUBLIC_MANAGE_SUBSCRIPTION_URL",
        "NEXT_PUBLIC_BUY_MINUTES_URL",
        "CLERK_SECRET_KEY",
        "CONVEX_DEPLOYMENT",
        "CONVEX_DEPLOY_KEY",
    ]
)

FLYIO_REQUIRED_KEYS = set(
    [
        "LIVEKIT_URL",
        "LIVEKIT_API_KEY",
        "LIVEKIT_API_SECRET",
        "DEEPGRAM_API_KEY",
        "OPENAI_API_KEY",
        "LANGSMITH_API_KEY",
        "LANGGRAPH_API_URL",
        "LANGCHAIN_TRACING_V2",
        "ELEVEN_API_KEY",
        "CONVEX_DEPLOYMENT",
        "CONVEX_URL",
        "LOGFIRE_TOKEN",
        "LOGFIRE_ENVIRONMENT",
    ]
)


def print_header(message: str):
    print(f"\n{Fore.CYAN}=== {message} ==={Style.RESET_ALL}")


def print_success(message: str):
    print(f"{Fore.GREEN}✓ {message}{Style.RESET_ALL}")


def print_warning(message: str):
    print(f"{Fore.YELLOW}⚠ {message}{Style.RESET_ALL}")


def print_error(message: str):
    print(f"{Fore.RED}✗ {message}{Style.RESET_ALL}")


def list_flyio_secrets():
    subprocess.run(["fly", "secrets", "list"], shell=True)


def list_convex_env():
    original_dir = os.getcwd()
    os.chdir("./client")
    command = ["npx", "convex", "env", "list", "--prod"]
    subprocess.run("npx convex env list --prod", shell=True)
    os.chdir(original_dir)


def list_vercel_env():
    subprocess.run(["vercel", "env", "list"], shell=True)


def set_flyio_secret(key: str, value: str):
    subprocess.run(
        ["fly", "secrets", "set", f"{key}={value}"],
        shell=True,
    )


def set_convex_env(key: str, value: str):
    original_dir = os.getcwd()
    os.chdir("./client")
    subprocess.run(["npx", "convex", "env", "set", key, value, "--prod"], shell=True)
    os.chdir(original_dir)


def set_vercel_env(key: str, value: str):
    command = ["echo", value, "|", "vercel", "env", "add", key, "production"]
    subprocess.run(command, shell=True)
    command = ["echo", value, "|", "vercel", "env", "add", key, "preview"]
    subprocess.run(command, shell=True)


def read_env_file(env_file: Path) -> Dict[str, str]:
    env_vars: Dict[str, str] = {}
    with open(env_file, "r") as file:
        for line in file:
            # skip comments or empty lines
            if line.startswith("#") or line.strip() == "":
                continue

            key, value = line.split("=", maxsplit=1)
            env_vars[key] = value

    return env_vars


SET_ENV_FUNC_MAP: Dict[EnvType, SetEnvFunc] = {
    "flyio": set_flyio_secret,
    "convex": set_convex_env,
    "vercel": set_vercel_env,
}

ENV_REQUIRED_KEYS_MAP: Dict[EnvType, Set[str]] = {
    "flyio": FLYIO_REQUIRED_KEYS,
    "convex": CONVEX_REQUIRED_KEYS,
    "vercel": VERCEL_REQUIRED_KEYS,
}

ENV_FILE_PATH_MAP: Dict[EnvType, Path] = {
    "flyio": SERVER_ENV_PATH,
    "convex": CLIENT_ENV_PATH,
    "vercel": CLIENT_ENV_PATH,
}

LIST_ENV_FUNC_MAP: Dict[EnvType, ListEnvFunc] = {
    "flyio": list_flyio_secrets,
    "convex": list_convex_env,
    "vercel": list_vercel_env,
}


def set_env(env_type: EnvType):
    set_env_func = SET_ENV_FUNC_MAP[env_type]
    required_keys = ENV_REQUIRED_KEYS_MAP[env_type]
    list_env_func = LIST_ENV_FUNC_MAP[env_type]
    env_vars = read_env_file(ENV_FILE_PATH_MAP[env_type])

    # print existing env vars
    print_header(f"Existing {env_type.upper()} Environment Variables")
    list_env_func()

    # prompt user to confirm
    print_warning("Are you sure you want to set these variables? (y/n)")
    if input().lower() != "y":
        print_error("Aborted")
        return

    print_header(f"Setting {env_type.upper()} Environment Variables")

    success_count = 0
    skip_count = 0
    error_count = 0

    for key, value in env_vars.items():
        if key not in required_keys:
            print_warning(f"Skipping {key} (not required for {env_type})")
            skip_count += 1
            continue

        try:
            set_env_func(key, value)
            print_success(f"Set {key}")
            success_count += 1
        except Exception as e:
            print_error(f"Failed to set {key}: {str(e)}")
            error_count += 1

    print(f"\n{Fore.CYAN}Summary for {env_type.upper()}:{Style.RESET_ALL}")
    print(f"✓ Successfully set: {success_count}")
    if skip_count > 0:
        print(f"⚠ Skipped: {skip_count}")
    if error_count > 0:
        print(f"✗ Errors: {error_count}")
    print()


def main():
    parser = argparse.ArgumentParser(description="Set env secrets to deployment target")
    parser.add_argument(
        "--env-type",
        choices=["flyio", "convex", "vercel", "all"],
        required=True,
        help="Type of deployment target",
    )
    args = parser.parse_args()

    # Check for env files
    if not SERVER_ENV_PATH.exists():
        print_error(f"Server environment file {SERVER_ENV_PATH} not found")
        return 1

    if not CLIENT_ENV_PATH.exists():
        print_error(f"Client environment file {CLIENT_ENV_PATH} not found")
        return 1

    if args.env_type == "all":
        print_header("Starting Full Environment Setup")
        set_env("flyio")
        set_env("convex")
        set_env("vercel")
        print_success("Completed Full Environment Setup")
    else:
        set_env(args.env_type)

    return 0


if __name__ == "__main__":
    exit(main())
