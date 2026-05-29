from __future__ import annotations

from models import LatLng


async def geocode(query: str) -> LatLng:
    """Resolve a text place query to coordinates."""
    raise NotImplementedError("geocode text query")


async def snap_to_graph(point: LatLng) -> LatLng:
    """Snap a coordinate to the pedestrian routing graph."""
    raise NotImplementedError("snap coordinate to Valhalla graph")
