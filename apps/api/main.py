from __future__ import annotations

from datetime import datetime, timezone
from typing import Annotated

from fastapi import FastAPI, File, Form, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from models import (
    FeatureKind,
    GeoJsonFeature,
    GeoJsonFeatureCollection,
    HealthResponse,
    MapFeature,
    RouteRequest,
    RouteResponse,
    TransportResponse,
)


app = FastAPI(title="Senda API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def mock_feature(
    feature_id: str = "feat-centro-ramp-001",
    kind: FeatureKind = "barrier",
    lat: float = 32.5331,
    lng: float = -117.0382,
) -> MapFeature:
    subtype = "ramp_missing" if kind == "barrier" else "accessible_business"
    return MapFeature(
        id=feature_id,
        kind=kind,
        categoria="cambio_nivel" if kind == "barrier" else kind,
        subtipo=subtype,
        atributos={"mock": True},
        lat=lat,
        lng=lng,
        geometry=None,
        source="ciudadano",
        confidence=0.82,
        photo_url=None,
        status="activo",
        upvotes=4,
        created_at=datetime.now(timezone.utc),
    )


def mock_amenity() -> MapFeature:
    return MapFeature(
        id="feat-zona-rio-rest-001",
        kind="amenity",
        categoria="alivio",
        subtipo="rest_point",
        atributos={"sombra": True, "banca": True},
        lat=32.5225,
        lng=-117.0191,
        geometry=None,
        source="ciudadano",
        confidence=0.91,
        photo_url=None,
        status="confirmado",
        upvotes=12,
        created_at=datetime.now(timezone.utc),
    )


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.post("/route", response_model=RouteResponse)
async def route(payload: RouteRequest) -> RouteResponse:
    return RouteResponse(
        coords=[(-117.0382, 32.5331), (-117.0292, 32.529), (-117.0191, 32.5225)],
        distance_m=1240,
        eta_min=19 if "WHEELCHAIR" in payload.profiles else 15,
        features_evitadas=[mock_feature()],
        features_aprovechadas=[mock_amenity()],
        steps=[
            "Avanza hacia Av. Revolucion",
            "Gira a la derecha en Calle 4ta",
            "Continua por la ruta accesible marcada",
        ],
    )


@app.post("/report", response_model=MapFeature)
async def report(
    image: Annotated[UploadFile | None, File()] = None,
    voice_text: Annotated[str | None, Form()] = None,
    lat: Annotated[float, Form()] = 32.5331,
    lng: Annotated[float, Form()] = -117.0382,
    kind: Annotated[FeatureKind, Form()] = "barrier",
) -> MapFeature:
    if image is not None:
        await image.close()
    feature = mock_feature(feature_id=f"report-{kind}-mock", kind=kind, lat=lat, lng=lng)
    feature.atributos = {"voice_text": voice_text or "", "classified": True}
    return feature


@app.get("/features", response_model=GeoJsonFeatureCollection)
async def features(
    bbox: Annotated[str | None, Query(description="minLng,minLat,maxLng,maxLat")] = None,
    kind: Annotated[FeatureKind | None, Query()] = None,
) -> GeoJsonFeatureCollection:
    del bbox
    items = [mock_feature(), mock_amenity()]
    if kind is not None:
        items = [item for item in items if item.kind == kind]
    return GeoJsonFeatureCollection(
        features=[
            GeoJsonFeature(
                geometry={"type": "Point", "coordinates": [item.lng, item.lat]},
                properties=item.model_dump(mode="json"),
            )
            for item in items
        ]
    )


@app.get("/transport", response_model=TransportResponse)
async def transport(bbox: Annotated[str | None, Query(description="minLng,minLat,maxLng,maxLat")] = None) -> TransportResponse:
    del bbox
    return TransportResponse(
        routes=[
            MapFeature(
                id="route-centro-zona-rio",
                kind="transport",
                categoria="ruta_camion",
                subtipo="Centro - Zona Rio",
                atributos={"accessibility_features": {"has_ramp": True, "low_floor": True}},
                lat=32.525,
                lng=-117.025,
                geometry={"type": "LineString", "coordinates": [[-117.0382, 32.5331], [-117.0191, 32.5225]]},
                source="ciudadano",
                confidence=0.8,
                photo_url=None,
                status="activo",
                upvotes=4,
                created_at=datetime.now(timezone.utc),
            )
        ]
    )
