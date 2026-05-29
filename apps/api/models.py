from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


Profile = Literal["WHEELCHAIR", "REDUCED_MOB", "BLIND", "LOW_VISION", "DEAF_HOH", "COGNITIVE"]
Situational = Literal["STROLLER", "TEMP_INJURY"]
FeatureKind = Literal["barrier", "amenity", "transport", "crossing"]
FeatureSource = Literal["auto", "ciudadano"]
FeatureStatus = Literal["activo", "confirmado", "no_confirmado", "resuelto"]


class LatLng(BaseModel):
    lat: float
    lng: float


class MapFeature(BaseModel):
    id: str
    kind: FeatureKind
    categoria: str
    subtipo: str
    atributos: dict[str, Any]
    lat: float
    lng: float
    geometry: dict[str, Any] | None = None
    source: FeatureSource
    confidence: float
    photo_url: str | None = None
    status: FeatureStatus = "activo"
    upvotes: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class User(BaseModel):
    id: str
    perfiles: list[Profile]
    situacionales: list[Situational]
    prefs_a11y: dict[str, Any]


class RouteRequest(BaseModel):
    origin: LatLng | str
    destination: LatLng | str
    profiles: list[Profile]


class RouteResponse(BaseModel):
    coords: list[tuple[float, float]]
    distance_m: float
    eta_min: float
    features_evitadas: list[MapFeature]
    features_aprovechadas: list[MapFeature]
    steps: list[str]


class TransportResponse(BaseModel):
    routes: list[MapFeature]


class HealthResponse(BaseModel):
    status: Literal["ok"]


class GeoJsonFeature(BaseModel):
    type: Literal["Feature"] = "Feature"
    geometry: dict[str, Any]
    properties: dict[str, Any]


class GeoJsonFeatureCollection(BaseModel):
    type: Literal["FeatureCollection"] = "FeatureCollection"
    features: list[GeoJsonFeature]

    model_config = ConfigDict(extra="allow")
