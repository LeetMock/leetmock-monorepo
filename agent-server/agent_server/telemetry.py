from logging import basicConfig

import logfire


def init_telemetry():
    logfire.configure()
    logfire.instrument_aiohttp_client()
    logfire.instrument_httpx()
    logfire.instrument_openai()
    logfire.instrument_system_metrics()
    logfire.install_auto_tracing(
        modules=["agent_streams", "agent_triggers", "contexts", "events"],
        min_duration=0.01,
    )

    basicConfig(handlers=[logfire.LogfireLoggingHandler()])
