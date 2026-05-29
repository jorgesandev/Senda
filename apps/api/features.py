from __future__ import annotations

import asyncio
import json
import os
from pathlib import Path

from models import FeatureKind, GeoJsonFeature, GeoJsonFeatureCollection, MapFeature

# ---------------------------------------------------------------------------
# Firestore (optional — falls back to in-memory if unavailable)
# ---------------------------------------------------------------------------
_DB = None
try:
    import firebase_admin
    from firebase_admin import firestore as _fs  # type: ignore[import]

    _project = os.getenv("FIREBASE_PROJECT_ID", "sendamx")
    try:
        firebase_admin.get_app()
    except ValueError:
        firebase_admin.initialize_app(options={"projectId": _project})
    _DB = _fs.client()
except Exception:
    pass

# ---------------------------------------------------------------------------
# In-memory store (always used for fast reads)
# ---------------------------------------------------------------------------
_STORE: list[MapFeature] = []

# ---------------------------------------------------------------------------
# SSE broadcast queues
# ---------------------------------------------------------------------------
_SSE_QUEUES: set[asyncio.Queue] = set()


def add_sse_client(queue: asyncio.Queue) -> None:
    _SSE_QUEUES.add(queue)


def remove_sse_client(queue: asyncio.Queue) -> None:
    _SSE_QUEUES.discard(queue)


async def broadcast_new_feature(feature: MapFeature) -> None:
    for q in list(_SSE_QUEUES):
        try:
            q.put_nowait(feature)
        except asyncio.QueueFull:
            pass


# ---------------------------------------------------------------------------
# Seed / startup
# ---------------------------------------------------------------------------

def load_seed() -> None:
    """Load features: Firestore first (if available), then fall back to seed file."""
    if _DB is not None:
        try:
            docs = list(_DB.collection("features").stream())
            if docs:
                for doc in docs:
                    data = doc.to_dict()
                    if data:
                        try:
                            _STORE.append(MapFeature(**data))
                        except Exception:
                            pass
                return
        except Exception:
            pass

    seed_path = Path(__file__).parent.parent.parent / "data" / "seed" / "features_seed.json"
    if not seed_path.exists():
        return
    raw: list[dict] = json.loads(seed_path.read_text())
    for item in raw:
        feature = MapFeature(**item)
        _STORE.append(feature)
        if _DB is not None:
            try:
                _DB.collection("features").document(feature.id).set(
                    feature.model_dump(mode="json")
                )
            except Exception:
                pass


# ---------------------------------------------------------------------------
# CRUD
# ---------------------------------------------------------------------------

def get_active_features(
    bbox: tuple[float, float, float, float] | None = None,
    kind: FeatureKind | None = None,
) -> list[MapFeature]:
    result = [f for f in _STORE if f.status != "resuelto"]
    if kind is not None:
        result = [f for f in result if f.kind == kind]
    if bbox is not None:
        min_lng, min_lat, max_lng, max_lat = bbox
        result = [f for f in result if min_lat <= f.lat <= max_lat and min_lng <= f.lng <= max_lng]
    return result


async def list_features_geojson(bbox: str | None = None, kind: FeatureKind | None = None) -> GeoJsonFeatureCollection:
    parsed_bbox: tuple[float, float, float, float] | None = None
    if bbox:
        parts = [float(x) for x in bbox.split(",")]
        if len(parts) == 4:
            parsed_bbox = (parts[0], parts[1], parts[2], parts[3])

    items = get_active_features(parsed_bbox, kind)
    return GeoJsonFeatureCollection(
        features=[
            GeoJsonFeature(
                geometry={"type": "Point", "coordinates": [f.lng, f.lat]},
                properties=f.model_dump(mode="json"),
            )
            for f in items
        ]
    )


async def create_feature(feature: MapFeature) -> MapFeature:
    _STORE.append(feature)
    if _DB is not None:
        try:
            _DB.collection("features").document(feature.id).set(
                feature.model_dump(mode="json")
            )
        except Exception:
            pass
    await broadcast_new_feature(feature)
    return feature


async def resolve_feature(feature_id: str) -> MapFeature:
    for feature in _STORE:
        if feature.id == feature_id:
            feature.status = "resuelto"
            if _DB is not None:
                try:
                    _DB.collection("features").document(feature_id).update({"status": "resuelto"})
                except Exception:
                    pass
            return feature
    raise ValueError(f"Feature {feature_id} not found")


async def delete_feature(feature_id: str) -> bool:
    """Hard-delete a feature (used to undo a just-created report)."""
    global _STORE
    before = len(_STORE)
    _STORE = [f for f in _STORE if f.id != feature_id]
    removed = len(_STORE) < before
    if _DB is not None:
        try:
            _DB.collection("features").document(feature_id).delete()
        except Exception:
            pass
    return removed
