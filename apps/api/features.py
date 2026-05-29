from __future__ import annotations

from models import FeatureKind, GeoJsonFeatureCollection, MapFeature


async def list_features_geojson(bbox: str | None = None, kind: FeatureKind | None = None) -> GeoJsonFeatureCollection:
    """Read live features from Firestore and export a GeoJSON FeatureCollection."""
    raise NotImplementedError("read live features from Firestore")


async def create_feature(feature: MapFeature) -> MapFeature:
    """Persist a live feature in Firestore."""
    raise NotImplementedError("persist live feature in Firestore")


async def resolve_feature(feature_id: str) -> MapFeature:
    """Mark a live feature as resolved in Firestore."""
    raise NotImplementedError("resolve live feature in Firestore")
