from __future__ import annotations

import json
from pathlib import Path

from models import FeatureKind, GeoJsonFeature, GeoJsonFeatureCollection, MapFeature

_STORE: list[MapFeature] = []


def load_seed() -> None:
    seed_path = Path(__file__).parent.parent.parent / "data" / "seed" / "features_seed.json"
    if not seed_path.exists():
        return
    raw: list[dict] = json.loads(seed_path.read_text())
    for item in raw:
        _STORE.append(MapFeature(**item))


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
    return feature


async def resolve_feature(feature_id: str) -> MapFeature:
    for feature in _STORE:
        if feature.id == feature_id:
            feature.status = "resuelto"
            return feature
    raise ValueError(f"Feature {feature_id} not found")
