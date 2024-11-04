import asyncio
import time
import uuid
from typing import Any, AsyncIterator, Callable, Coroutine

import numpy as np
from agent_graph.template.graph import create_graph
from dotenv import find_dotenv, load_dotenv
from langgraph.checkpoint.memory import MemorySaver
from langgraph_sdk import get_client
from matplotlib import pyplot as plt
from tenacity import retry, wait_exponential

load_dotenv(find_dotenv())


URL = "https://leetmock-ts-fa225f46565756e7b0567441810f232f.default.us.langgraph.app"

DEFAULT_INPUT = {"messages": ["HI"], "event": "user_message"}
ASSISTANT_ID = "code-mock-staged-v1"
SAMPLE_SIZE = 500

STATELESS_GRAPH = create_graph().compile()
STATEFUL_GRAPH = create_graph().compile(checkpointer=MemorySaver())
CLIENT = get_client(url=URL)


TASK_FINISH_COUNT = {
    "stateless_graph_stream": 0,
    "stateful_graph_stream": 0,
    "cloud_stateful_graph_stream": 0,
    "cloud_stateless_graph_stream": 0,
}


async def create_thread():
    thread = await CLIENT.threads.create()
    return thread


@retry(wait=wait_exponential())
async def benchmark_ttfc(
    stream_func: Callable[[], Coroutine[Any, Any, AsyncIterator[Any]]]
):
    stream = await stream_func()

    start_t = time.time()
    async for _ in stream:
        break

    return time.time() - start_t


async def stateless_graph_stream():
    return STATELESS_GRAPH.astream(
        input=DEFAULT_INPUT,
        stream_mode=["values", "custom"],
    )


async def stateful_graph_stream():
    return STATEFUL_GRAPH.astream(
        input=DEFAULT_INPUT,
        config={"configurable": {"thread_id": str(uuid.uuid4())}},
        stream_mode=["values", "custom"],
    )


async def cloud_stateful_graph_stream():
    thread = await create_thread()
    return CLIENT.runs.stream(
        thread_id=thread["thread_id"],
        assistant_id=ASSISTANT_ID,
        input=DEFAULT_INPUT,
        stream_mode=["values", "custom"],
        interrupt_after=["init_state", "on_event", "on_trigger"],
    )


async def cloud_stateless_graph_stream():
    return CLIENT.runs.stream(
        thread_id=None,
        assistant_id=ASSISTANT_ID,
        input=DEFAULT_INPUT,
        stream_mode=["values", "custom"],
        interrupt_after=["init_state", "on_event", "on_trigger"],
    )


async def benchmark_parallel(
    stream_func: Callable[[], Coroutine[Any, Any, AsyncIterator[Any]]]
):
    all_results = []

    for _ in range(SAMPLE_SIZE):
        tasks = await benchmark_ttfc(stream_func)
        TASK_FINISH_COUNT[stream_func.__name__] += 1
        all_results.append(tasks)

    print(
        f"Finished {TASK_FINISH_COUNT[stream_func.__name__]} tasks for {stream_func.__name__}"
    )
    return all_results


async def print_task_finish_count():
    while True:
        print("Task Finish Count:")
        for task, count in TASK_FINISH_COUNT.items():
            print(f"  {task}: {count}", flush=True)
        await asyncio.sleep(0.1)


async def main():
    stateless_graph_task = benchmark_parallel(stateless_graph_stream)
    stateful_graph_task = benchmark_parallel(stateful_graph_stream)
    cloud_stateful_graph_task = benchmark_parallel(cloud_stateful_graph_stream)
    cloud_stateless_graph_task = benchmark_parallel(cloud_stateless_graph_stream)

    asyncio.create_task(print_task_finish_count())

    r_stateless_graph = await stateless_graph_task
    r_stateful_graph = await stateful_graph_task
    r_cloud_stateful_graph = await cloud_stateful_graph_task
    r_cloud_stateless_graph = await cloud_stateless_graph_task

    print(f"Stateless graph: {np.mean(r_stateless_graph)}")
    print(f"Stateful graph: {np.mean(r_stateful_graph)}")
    print(f"Cloud stateful graph: {np.mean(r_cloud_stateful_graph)}")
    print(f"Cloud stateless graph: {np.mean(r_cloud_stateless_graph)}")

    r_stateless_graph = np.array(r_stateless_graph)
    r_stateful_graph = np.array(r_stateful_graph)
    r_cloud_stateful_graph = np.array(r_cloud_stateful_graph)
    r_cloud_stateless_graph = np.array(r_cloud_stateless_graph)

    # remove outliers > 85-th percentile and < 15-th percentile
    r_stateless_graph = r_stateless_graph[
        (r_stateless_graph > np.percentile(r_stateless_graph, 15))
        & (r_stateless_graph < np.percentile(r_stateless_graph, 85))
    ]
    r_stateful_graph = r_stateful_graph[
        (r_stateful_graph > np.percentile(r_stateful_graph, 15))
        & (r_stateful_graph < np.percentile(r_stateful_graph, 85))
    ]
    r_cloud_stateful_graph = r_cloud_stateful_graph[
        (r_cloud_stateful_graph > np.percentile(r_cloud_stateful_graph, 15))
        & (r_cloud_stateful_graph < np.percentile(r_cloud_stateful_graph, 85))
    ]
    r_cloud_stateless_graph = r_cloud_stateless_graph[
        (r_cloud_stateless_graph > np.percentile(r_cloud_stateless_graph, 15))
        & (r_cloud_stateless_graph < np.percentile(r_cloud_stateless_graph, 85))
    ]

    # Convert time values from seconds to milliseconds
    r_stateless_graph_ms = np.array(r_stateless_graph) * 1000
    r_stateful_graph_ms = np.array(r_stateful_graph) * 1000
    r_cloud_stateful_graph_ms = np.array(r_cloud_stateful_graph) * 1000
    r_cloud_stateless_graph_ms = np.array(r_cloud_stateless_graph) * 1000

    # Create a figure with two subplots
    fig, axs = plt.subplots(1, 2, figsize=(12, 6))

    # First subplot: Non-cloud graphs
    axs[0].scatter(
        np.full_like(r_stateless_graph_ms, 1),
        r_stateless_graph_ms,
        alpha=0.7,
        label="Stateless",
        color="blue",
    )
    stateless_avg_ms = np.mean(r_stateless_graph_ms)
    axs[0].axhline(
        stateless_avg_ms, color="blue", linestyle="--", label="Stateless Avg"
    )
    axs[0].text(
        1, stateless_avg_ms, f"{stateless_avg_ms:.2f} ms", color="blue", va="bottom"
    )

    axs[0].scatter(
        np.full_like(r_stateful_graph_ms, 2),
        r_stateful_graph_ms,
        alpha=0.7,
        label="Stateful",
        color="orange",
    )
    stateful_avg_ms = np.mean(r_stateful_graph_ms)
    axs[0].axhline(
        stateful_avg_ms, color="orange", linestyle="--", label="Stateful Avg"
    )
    axs[0].text(
        2, stateful_avg_ms, f"{stateful_avg_ms:.2f} ms", color="orange", va="bottom"
    )

    axs[0].set_xticks([1, 2])
    axs[0].set_xticklabels(["Stateless", "Stateful"])
    axs[0].set_xlabel("Graph")
    axs[0].set_ylabel("Time to first character (ms)")
    axs[0].set_title("Non-cloud Graphs")
    axs[0].legend()

    # Second subplot: Cloud graphs
    axs[1].scatter(
        np.full_like(r_cloud_stateful_graph_ms, 1),
        r_cloud_stateful_graph_ms,
        alpha=0.7,
        label="Cloud stateful",
        color="green",
    )
    cloud_stateful_avg_ms = np.mean(r_cloud_stateful_graph_ms)
    axs[1].axhline(
        cloud_stateful_avg_ms, color="green", linestyle="--", label="Cloud Stateful Avg"
    )
    axs[1].text(
        1,
        cloud_stateful_avg_ms,
        f"{cloud_stateful_avg_ms:.2f} ms",
        color="green",
        va="bottom",
    )

    axs[1].scatter(
        np.full_like(r_cloud_stateless_graph_ms, 2),
        r_cloud_stateless_graph_ms,
        alpha=0.7,
        label="Cloud stateless",
        color="red",
    )
    cloud_stateless_avg_ms = np.mean(r_cloud_stateless_graph_ms)
    axs[1].axhline(
        cloud_stateless_avg_ms, color="red", linestyle="--", label="Cloud Stateless Avg"
    )
    axs[1].text(
        2,
        cloud_stateless_avg_ms,
        f"{cloud_stateless_avg_ms:.2f} ms",
        color="red",
        va="bottom",
    )

    axs[1].set_xticks([1, 2])
    axs[1].set_xticklabels(["Cloud stateful", "Cloud stateless"])
    axs[1].set_xlabel("Graph")
    axs[1].set_ylabel("Time to first character (ms)")
    axs[1].set_title("Cloud Graphs")
    axs[1].legend()

    # Adjust layout
    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    asyncio.run(main())
