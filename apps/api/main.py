from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timezone
from typing import Annotated

import httpx
from fastapi import FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from features import (
    add_sse_client,
    create_feature,
    delete_feature,
    get_active_features,
    list_features_geojson,
    load_seed,
    remove_sse_client,
)
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


_DEFAULT_SUBTIPO: dict[FeatureKind, str] = {
    "barrier": "obstruction_temporary",
    "amenity": "accessible_business",
    "transport": "parada_camion",
    "crossing": "crossing_unsafe",
}


@app.post("/report", response_model=MapFeature)
async def report(
    image: Annotated[UploadFile | None, File()] = None,
    voice_text: Annotated[str | None, Form()] = None,
    lat: Annotated[float, Form()] = 32.5331,
    lng: Annotated[float, Form()] = -117.0382,
    kind: Annotated[FeatureKind, Form()] = "barrier",
    subtipo: Annotated[str | None, Form()] = None,
    photo_data_url: Annotated[str | None, Form()] = None,
) -> MapFeature:
    if image is not None:
        await image.close()

    resolved_subtipo = subtipo or _DEFAULT_SUBTIPO.get(kind, "obstruction_temporary")
    feature = MapFeature(
        id=f"report-{kind}-{uuid.uuid4().hex[:8]}",
        kind=kind,
        categoria="obstruccion" if kind == "barrier" else kind,
        subtipo=resolved_subtipo,
        atributos={"voice_text": voice_text or "", "classified": False},
        lat=lat,
        lng=lng,
        geometry=None,
        source="ciudadano",
        confidence=0.7,
        photo_url=photo_data_url or None,
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


@app.delete("/features/{feature_id}")
async def remove_feature(feature_id: str) -> dict[str, str]:
    removed = await delete_feature(feature_id)
    if not removed:
        raise HTTPException(status_code=404, detail="Feature not found")
    return {"deleted": feature_id}


@app.get("/features/stream")
async def features_stream() -> StreamingResponse:
    queue: asyncio.Queue[MapFeature] = asyncio.Queue(maxsize=100)
    add_sse_client(queue)

    async def generate():
        try:
            for feature in get_active_features():
                yield f"event: initial\ndata: {feature.model_dump_json()}\n\n"
            yield "event: ready\ndata: {}\n\n"

            while True:
                try:
                    feature = await asyncio.wait_for(queue.get(), timeout=30.0)
                    yield f"event: new_feature\ndata: {feature.model_dump_json()}\n\n"
                except asyncio.TimeoutError:
                    yield ": keepalive\n\n"
        finally:
            remove_sse_client(queue)

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.get("/transport", response_model=TransportResponse)
async def transport(bbox: Annotated[str | None, Query(description="minLng,minLat,maxLng,maxLat")] = None) -> TransportResponse:
    items = get_active_features(kind="transport")
    if bbox:
        parts = [float(x) for x in bbox.split(",")]
        if len(parts) == 4:
            items = get_active_features((parts[0], parts[1], parts[2], parts[3]), kind="transport")
    return TransportResponse(routes=items)
