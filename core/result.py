"""
core/result.py
Railway-oriented Result type.

Services return Result objects instead of raising exceptions for
expected failure paths.  This makes control flow explicit and
forces callers to handle both success and failure.

Usage:
    result = user_service.register(email, password)
    if result.is_failure:
        return Response({"error": result.error}, status=400)
    return Response(UserSerializer(result.value).data, status=201)
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Generic, TypeVar

T = TypeVar("T")
E = TypeVar("E")


@dataclass(frozen=True)
class Result(Generic[T]):
    """Immutable result container.  Use Ok() / Err() helpers."""

    _value: T | None = field(default=None, repr=True)
    _error: str | None = field(default=None, repr=True)
    _ok: bool = field(default=True, repr=True)

    @property
    def is_ok(self) -> bool:
        return self._ok

    @property
    def is_failure(self) -> bool:
        return not self._ok

    @property
    def value(self) -> T:
        if not self._ok:
            raise ValueError(f"Result is a failure: {self._error}")
        return self._value  # type: ignore[return-value]

    @property
    def error(self) -> str:
        if self._ok:
            raise ValueError("Result is a success; no error present.")
        return self._error  # type: ignore[return-value]

    def unwrap(self) -> T:
        """Return value or raise RuntimeError with error message."""
        if self.is_failure:
            raise RuntimeError(self.error)
        return self.value

    def unwrap_or(self, default: T) -> T:
        return self._value if self._ok else default  # type: ignore[return-value]


def Ok(value: T | None = None) -> Result[T]:  # noqa: N802
    """Construct a successful result."""
    return Result(_value=value, _ok=True)


def Err(error: str) -> Result:  # noqa: N802
    """Construct a failure result."""
    return Result(_error=error, _ok=False)
