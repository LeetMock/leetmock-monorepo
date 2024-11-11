from typing import AsyncIterable, AsyncIterator, TypeVar

T = TypeVar("T")


class AsyncIterableWrapper(AsyncIterable[T]):
    def __init__(self, async_iterator: AsyncIterator[T]):
        self.async_iterator = async_iterator

    def __aiter__(self):
        return self

    async def __anext__(self):
        try:
            return await self.async_iterator.__anext__()
        except StopAsyncIteration:
            raise StopAsyncIteration


def to_async_iterable(async_iterator: AsyncIterator[T]) -> AsyncIterable[T]:
    return AsyncIterableWrapper(async_iterator)
