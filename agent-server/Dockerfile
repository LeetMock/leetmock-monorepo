# This is an example Dockerfile that builds a minimal container for running LK Agents
# syntax=docker/dockerfile:1
ARG PYTHON_VERSION=3.12
FROM python:${PYTHON_VERSION}-slim

# Prevents Python from writing pyc files.
ENV PYTHONDONTWRITEBYTECODE=1

# Keeps Python from buffering stdout and stderr to avoid situations where
# the application crashes without emitting any logs due to buffering.
ENV PYTHONUNBUFFERED=1

# Create a non-privileged user that the app will run under.
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/home/appuser" \
    --shell "/sbin/nologin" \
    --uid "${UID}" \
    appuser

# Create a directory for logs and set proper permissions
RUN mkdir -p /home/appuser/logs && chown -R appuser:appuser /home/appuser

# Install system dependencies and Rust
RUN apt-get update && \
    apt-get install -y \
    gcc \
    python3-dev \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

# Add Cargo to PATH
ENV PATH="/root/.cargo/bin:${PATH}"

USER root
WORKDIR /root

# Install Poetry
RUN pip install poetry

# Configure Poetry
RUN poetry config virtualenvs.create false

# Copy only requirements to cache them in docker layer
COPY pyproject.toml poetry.lock* ./

# Install project dependencies
RUN poetry install --no-interaction --no-ansi

USER appuser
WORKDIR /home/appuser

# Copy project
COPY --chown=appuser:appuser . .

# Copy convex-client directory
COPY --chown=appuser:appuser ../convex-client ../convex-client

# Expose port 8081 for TCP
EXPOSE 8081

# Run the application
ENTRYPOINT ["python", "-m", "agent_server.minimal_assistant"]
CMD ["start"]