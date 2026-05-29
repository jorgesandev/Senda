from __future__ import annotations

from models import FeatureKind, MapFeature


async def classify_report(
    *,
    image_bytes: bytes | None,
    voice_text: str | None,
    lat: float,
    lng: float,
    kind: FeatureKind,
    backend: str,
) -> MapFeature:
    """Classify an image or transcript into a MapFeature."""
    if backend == "gemini":
        raise NotImplementedError("classify report with Gemini backend")
    if backend == "self_hosted_vlm":
        raise NotImplementedError("classify report with self-hosted VLM backend")
    raise ValueError(f"Unsupported vision backend: {backend}")
