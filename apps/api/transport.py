from __future__ import annotations

from models import TransportResponse


async def query_transport(bbox: str | None = None) -> TransportResponse:
    """Query accessible transport routes and stops for a bounding box."""
    raise NotImplementedError("query transport routes and stops")
