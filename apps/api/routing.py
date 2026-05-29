from __future__ import annotations

from models import RouteRequest, RouteResponse


async def request_valhalla_route(payload: RouteRequest) -> RouteResponse:
    """Call Valhalla with profile-aware dynamic excludes and return a route contract."""
    raise NotImplementedError("call Valhalla route service with dynamic excludes")


def build_dynamic_excludes(payload: RouteRequest) -> list[dict[str, float]]:
    """Build hot exclude locations from live blocking features for the selected profiles."""
    raise NotImplementedError("build dynamic exclude locations from live features")
