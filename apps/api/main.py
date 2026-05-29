from __future__ import annotations

from typing import Annotated

import httpx
from fastapi import FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from features import create_feature, list_features_geojson, load_seed
from models import (
    FeatureKind,
    GeoJsonFeatureCollection,
    HealthResponse,
    MapFeature,
    RouteRequest,
    RouteResponse,
    TransportResponse,
)
from routing import request_valhalla_route


app = FastAPI(title="Senda API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup() -> None:
    load_seed()


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.post("/route", response_model=RouteResponse)
async def route(payload: RouteRequest) -> RouteResponse:
    try:
        return await request_valhalla_route(payload)
    except httpx.HTTPStatusError as exc:
        detail = exc.response.text[:500]
        raise HTTPException(status_code=502, detail=f"Valhalla route failed: {detail}") from exc
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Valhalla route unavailable: {exc}") from exc
    except (RuntimeError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/report", response_model=MapFeature)
async def report(
    image: Annotated[UploadFile | None, File()] = None,
    voice_text: Annotated[str | None, Form()] = None,
    lat: Annotated[float, Form()] = 32.5331,
    lng: Annotated[float, Form()] = -117.0382,
    kind: Annotated[FeatureKind, Form()] = "barrier",
) -> MapFeature:
    import uuid
    from datetime import datetime, timezone

    if image is not None:
        await image.close()

    feature = MapFeature(
        id=f"report-{kind}-{uuid.uuid4().hex[:8]}",
        kind=kind,
        categoria="obstruccion" if kind == "barrier" else kind,
        subtipo="obstruction_temporary" if kind == "barrier" else "accessible_business",
        atributos={"voice_text": voice_text or "", "classified": False},
        lat=lat,
        lng=lng,
        geometry=None,
        source="ciudadano",
        confidence=0.6,
        photo_url=None,
        status="activo",
        upvotes=0,
        created_at=datetime.now(timezone.utc),
    )
    return await create_feature(feature)


@app.get("/features", response_model=GeoJsonFeatureCollection)
async def features(
    bbox: Annotated[str | None, Query(description="minLng,minLat,maxLng,maxLat")] = None,
    kind: Annotated[FeatureKind | None, Query()] = None,
) -> GeoJsonFeatureCollection:
    return await list_features_geojson(bbox, kind)


@app.get("/transport", response_model=TransportResponse)
async def transport(bbox: Annotated[str | None, Query(description="minLng,minLat,maxLng,maxLat")] = None) -> TransportResponse:
    from features import get_active_features

    items = get_active_features(kind="transport")
    if bbox:
        parts = [float(x) for x in bbox.split(",")]
        if len(parts) == 4:
            items = get_active_features((parts[0], parts[1], parts[2], parts[3]), kind="transport")
    return TransportResponse(routes=items)
