from __future__ import annotations

import math
from typing import Any

import httpx

from config import settings
from features import get_active_features
from geo import geocode
from matrix import resolve_effect
from models import LatLng, MapFeature, RouteRequest, RouteResponse


def _decode_polyline6(shape: str) -> list[tuple[float, float]]:
    coords: list[tuple[float, float]] = []
    index = 0
    lat = 0
    lng = 0

    while index < len(shape):
        result = 0
        shift = 0
        while True:
            byte = ord(shape[index]) - 63
            index += 1
            result |= (byte & 0x1F) << shift
            shift += 5
            if byte < 0x20:
                break
        lat += ~(result >> 1) if result & 1 else result >> 1

        result = 0
        shift = 0
        while True:
            byte = ord(shape[index]) - 63
            index += 1
            result |= (byte & 0x1F) << shift
            shift += 5
            if byte < 0x20:
                break
        lng += ~(result >> 1) if result & 1 else result >> 1

        coords.append((lng * 1e-6, lat * 1e-6))

    return coords


async def _resolve_location(location: LatLng | str) -> LatLng:
    if isinstance(location, LatLng):
        return location
    return await geocode(location)


def _valhalla_locations(origin: LatLng, destination: LatLng) -> list[dict[str, float]]:
    return [
        {"lat": origin.lat, "lon": origin.lng},
        {"lat": destination.lat, "lon": destination.lng},
    ]


def _extract_coords(trip: dict[str, Any]) -> list[tuple[float, float]]:
    coords: list[tuple[float, float]] = []
    for leg in trip.get("legs", []):
        shape = leg.get("shape")
        if not shape:
            continue
        leg_coords = _decode_polyline6(shape)
        if coords and leg_coords and coords[-1] == leg_coords[0]:
            coords.extend(leg_coords[1:])
        else:
            coords.extend(leg_coords)
    return coords


def _extract_steps(trip: dict[str, Any]) -> list[str]:
    steps: list[str] = []
    for leg in trip.get("legs", []):
        for maneuver in leg.get("maneuvers", []):
            instruction = maneuver.get("instruction")
            if instruction:
                steps.append(str(instruction))
    return steps


def _summary(trip: dict[str, Any]) -> tuple[float, float]:
    summary = trip.get("summary", {})
    length_km = float(summary.get("length", 0))
    time_seconds = float(summary.get("time", 0))

    if length_km == 0 or time_seconds == 0:
        for leg in trip.get("legs", []):
            leg_summary = leg.get("summary", {})
            length_km += float(leg_summary.get("length", 0))
            time_seconds += float(leg_summary.get("time", 0))

    return round(length_km * 1000), max(1, math.ceil(time_seconds / 60))


def _haversine_m(a: LatLng, b: LatLng) -> float:
    r = 6_371_000
    dlat = math.radians(b.lat - a.lat)
    dlng = math.radians(b.lng - a.lng)
    h = math.sin(dlat / 2) ** 2 + math.cos(math.radians(a.lat)) * math.cos(math.radians(b.lat)) * math.sin(dlng / 2) ** 2
    return 2 * r * math.asin(math.sqrt(h))


def build_dynamic_excludes(
    payload: RouteRequest,
    origin: LatLng,
    destination: LatLng,
) -> tuple[list[dict[str, float]], list[MapFeature]]:
    """Return (exclude_locations, features_evitadas) for blocking/difficult features on this route."""
    if not payload.profiles:
        return [], []

    pad = 0.018
    min_lat = min(origin.lat, destination.lat) - pad
    max_lat = max(origin.lat, destination.lat) + pad
    min_lng = min(origin.lng, destination.lng) - pad
    max_lng = max(origin.lng, destination.lng) + pad

    candidates = get_active_features((min_lng, min_lat, max_lng, max_lat), kind=None)

    excludes: list[dict[str, float]] = []
    evitadas: list[MapFeature] = []

    for feature in candidates:
        if feature.kind not in ("barrier", "crossing"):
            continue

        loc = LatLng(lat=feature.lat, lng=feature.lng)
        if _haversine_m(loc, origin) < 40 or _haversine_m(loc, destination) < 40:
            continue

        effect = resolve_effect(list(payload.profiles), feature)
        if effect in ("B", "D"):
            excludes.append({"lat": feature.lat, "lon": feature.lng})
            evitadas.append(feature)

    return excludes, evitadas


async def request_valhalla_route(payload: RouteRequest) -> RouteResponse:
    """Call Valhalla with profile-aware dynamic excludes and return a route contract."""
    origin = await _resolve_location(payload.origin)
    destination = await _resolve_location(payload.destination)
    exclude_locations, features_evitadas = build_dynamic_excludes(payload, origin, destination)

    valhalla_payload: dict[str, Any] = {
        "locations": _valhalla_locations(origin, destination),
        "costing": "pedestrian",
        "directions_options": {"units": "kilometers", "language": "es-MX"},
    }
    if exclude_locations:
        valhalla_payload["exclude_locations"] = exclude_locations

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(f"{settings.valhalla_url.rstrip('/')}/route", json=valhalla_payload)
        response.raise_for_status()

    trip = response.json().get("trip", {})
    coords = _extract_coords(trip)
    if not coords:
        raise RuntimeError("Valhalla returned no route shape")

    distance_m, eta_min = _summary(trip)
    return RouteResponse(
        coords=coords,
        distance_m=distance_m,
        eta_min=eta_min,
        features_evitadas=features_evitadas,
        features_aprovechadas=[],
        steps=_extract_steps(trip),
    )
