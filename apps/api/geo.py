from __future__ import annotations

import httpx

from config import settings
from models import LatLng


async def geocode(query: str) -> LatLng:
    """Resolve a text place query to coordinates."""
    normalized = query.strip()
    if not normalized:
        raise ValueError("empty geocode query")

    if normalized.lower() in {"mi ubicacion", "mi ubicación", "ubicacion actual", "ubicación actual"}:
        return LatLng(lat=32.5331, lng=-117.0382)

    if not settings.google_maps_api_key:
        raise RuntimeError("GOOGLE_MAPS_API_KEY is required for text geocoding")

    params = {
        "address": f"{normalized}, Tijuana, Baja California, Mexico",
        "key": settings.google_maps_api_key,
        "region": "mx",
        "language": "es",
        "bounds": "32.40,-117.13|32.57,-116.85",
    }
    async with httpx.AsyncClient(timeout=8) as client:
        response = await client.get("https://maps.googleapis.com/maps/api/geocode/json", params=params)
        response.raise_for_status()

    payload = response.json()
    if payload.get("status") != "OK" or not payload.get("results"):
        raise ValueError(f"geocode failed for {normalized!r}: {payload.get('status', 'UNKNOWN')}")

    location = payload["results"][0]["geometry"]["location"]
    return LatLng(lat=float(location["lat"]), lng=float(location["lng"]))


async def snap_to_graph(point: LatLng) -> LatLng:
    """Snap a coordinate to the pedestrian routing graph."""
    raise NotImplementedError("snap coordinate to Valhalla graph")
