import os
from logging import basicConfig

import logfire


def init_telemetry():
    logfire.configure(
        send_to_logfire="if-token-present",
        environment=os.getenv("LOGFIRE_ENVIRONMENT", "unknown"),
        service_name="leetmock-agent-worker",
    )
    logfire.instrument_openai()
    # logfire.instrument_system_metrics()
    basicConfig(handlers=[logfire.LogfireLoggingHandler()])
