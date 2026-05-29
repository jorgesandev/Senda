from __future__ import annotations

from collections.abc import Mapping, Sequence
from typing import Any, Literal


Profile = Literal["WHEELCHAIR", "REDUCED_MOB", "BLIND", "LOW_VISION", "DEAF_HOH", "COGNITIVE"]
BarrierEffect = Literal["B", "D", "L", "·"]
AmenityEffect = Literal["CLAVE", "UTIL", "·"]

PROFILES: tuple[Profile, ...] = ("WHEELCHAIR", "REDUCED_MOB", "BLIND", "LOW_VISION", "DEAF_HOH", "COGNITIVE")

IMPACT_MATRIX: dict[str, dict[Profile, BarrierEffect]] = {
    "surface_broken": {
        "WHEELCHAIR": "B",
        "REDUCED_MOB": "D",
        "BLIND": "D",
        "LOW_VISION": "L",
        "DEAF_HOH": "·",
        "COGNITIVE": "L",
    },
    "surface_unpaved": {
        "WHEELCHAIR": "B",
        "REDUCED_MOB": "D",
        "BLIND": "D",
        "LOW_VISION": "L",
        "DEAF_HOH": "·",
        "COGNITIVE": "L",
    },
    "surface_loose": {
        "WHEELCHAIR": "D",
        "REDUCED_MOB": "D",
        "BLIND": "D",
        "LOW_VISION": "L",
        "DEAF_HOH": "·",
        "COGNITIVE": "L",
    },
    "surface_slippery": {
        "WHEELCHAIR": "D",
        "REDUCED_MOB": "D",
        "BLIND": "D",
        "LOW_VISION": "L",
        "DEAF_HOH": "·",
        "COGNITIVE": "L",
    },
    "step_curb": {
        "WHEELCHAIR": "B",
        "REDUCED_MOB": "D",
        "BLIND": "D",
        "LOW_VISION": "L",
        "DEAF_HOH": "·",
        "COGNITIVE": "L",
    },
    "stairs": {
        "WHEELCHAIR": "B",
        "REDUCED_MOB": "D",
        "BLIND": "D",
        "LOW_VISION": "L",
        "DEAF_HOH": "·",
        "COGNITIVE": "L",
    },
    "ramp_missing": {
        "WHEELCHAIR": "B",
        "REDUCED_MOB": "L",
        "BLIND": "·",
        "LOW_VISION": "·",
        "DEAF_HOH": "·",
        "COGNITIVE": "·",
    },
    "ramp_defective": {
        "WHEELCHAIR": "B",
        "REDUCED_MOB": "D",
        "BLIND": "·",
        "LOW_VISION": "·",
        "DEAF_HOH": "·",
        "COGNITIVE": "·",
    },
    "steep_grade": {
        "WHEELCHAIR": "B",
        "REDUCED_MOB": "D",
        "BLIND": "L",
        "LOW_VISION": "·",
        "DEAF_HOH": "·",
        "COGNITIVE": "L",
    },
    "path_narrow": {
        "WHEELCHAIR": "B",
        "REDUCED_MOB": "L",
        "BLIND": "L",
        "LOW_VISION": "·",
        "DEAF_HOH": "·",
        "COGNITIVE": "·",
    },
    "obstruction_temporary": {
        "WHEELCHAIR": "B",
        "REDUCED_MOB": "D",
        "BLIND": "D",
        "LOW_VISION": "L",
        "DEAF_HOH": "·",
        "COGNITIVE": "D",
    },
    "obstruction_permanent": {
        "WHEELCHAIR": "B",
        "REDUCED_MOB": "D",
        "BLIND": "D",
        "LOW_VISION": "L",
        "DEAF_HOH": "·",
        "COGNITIVE": "D",
    },
    "aerial_obstacle": {
        "WHEELCHAIR": "·",
        "REDUCED_MOB": "·",
        "BLIND": "B",
        "LOW_VISION": "L",
        "DEAF_HOH": "·",
        "COGNITIVE": "·",
    },
    "tactile_missing": {
        "WHEELCHAIR": "·",
        "REDUCED_MOB": "·",
        "BLIND": "B",
        "LOW_VISION": "D",
        "DEAF_HOH": "·",
        "COGNITIVE": "L",
    },
    "signage_poor": {
        "WHEELCHAIR": "·",
        "REDUCED_MOB": "·",
        "BLIND": "L",
        "LOW_VISION": "D",
        "DEAF_HOH": "L",
        "COGNITIVE": "D",
    },
    "sensory_chaos": {
        "WHEELCHAIR": "·",
        "REDUCED_MOB": "L",
        "BLIND": "L",
        "LOW_VISION": "·",
        "DEAF_HOH": "·",
        "COGNITIVE": "D",
    },
    "crossing_unsafe": {
        "WHEELCHAIR": "D",
        "REDUCED_MOB": "D",
        "BLIND": "B",
        "LOW_VISION": "D",
        "DEAF_HOH": "L",
        "COGNITIVE": "D",
    },
    "crossing_no_audio": {
        "WHEELCHAIR": "·",
        "REDUCED_MOB": "·",
        "BLIND": "B",
        "LOW_VISION": "L",
        "DEAF_HOH": "·",
        "COGNITIVE": "L",
    },
    "crossing_no_curb_ramp": {
        "WHEELCHAIR": "B",
        "REDUCED_MOB": "L",
        "BLIND": "·",
        "LOW_VISION": "·",
        "DEAF_HOH": "·",
        "COGNITIVE": "·",
    },
}

AMENITY_MATRIX: dict[str, dict[Profile, AmenityEffect]] = {
    "elevator": {
        "WHEELCHAIR": "CLAVE",
        "REDUCED_MOB": "CLAVE",
        "BLIND": "·",
        "LOW_VISION": "·",
        "DEAF_HOH": "·",
        "COGNITIVE": "·",
    },
    "accessible_restroom": {
        "WHEELCHAIR": "CLAVE",
        "REDUCED_MOB": "UTIL",
        "BLIND": "·",
        "LOW_VISION": "·",
        "DEAF_HOH": "·",
        "COGNITIVE": "·",
    },
    "rest_point": {
        "WHEELCHAIR": "UTIL",
        "REDUCED_MOB": "CLAVE",
        "BLIND": "UTIL",
        "LOW_VISION": "UTIL",
        "DEAF_HOH": "UTIL",
        "COGNITIVE": "UTIL",
    },
    "tactile_present": {
        "WHEELCHAIR": "·",
        "REDUCED_MOB": "·",
        "BLIND": "CLAVE",
        "LOW_VISION": "UTIL",
        "DEAF_HOH": "·",
        "COGNITIVE": "·",
    },
    "audio_signal_present": {
        "WHEELCHAIR": "·",
        "REDUCED_MOB": "·",
        "BLIND": "CLAVE",
        "LOW_VISION": "UTIL",
        "DEAF_HOH": "·",
        "COGNITIVE": "·",
    },
    "step_free_access": {
        "WHEELCHAIR": "CLAVE",
        "REDUCED_MOB": "UTIL",
        "BLIND": "·",
        "LOW_VISION": "·",
        "DEAF_HOH": "·",
        "COGNITIVE": "·",
    },
    "good_ramp": {
        "WHEELCHAIR": "CLAVE",
        "REDUCED_MOB": "UTIL",
        "BLIND": "·",
        "LOW_VISION": "·",
        "DEAF_HOH": "·",
        "COGNITIVE": "·",
    },
    "accessible_business": {
        "WHEELCHAIR": "UTIL",
        "REDUCED_MOB": "UTIL",
        "BLIND": "UTIL",
        "LOW_VISION": "UTIL",
        "DEAF_HOH": "UTIL",
        "COGNITIVE": "UTIL",
    },
}

BARRIER_RANK: dict[BarrierEffect, int] = {"·": 0, "L": 1, "D": 2, "B": 3}
AMENITY_RANK: dict[AmenityEffect, int] = {"·": 0, "UTIL": 1, "CLAVE": 2}


def _field(feature: Any, key: str, default: Any = None) -> Any:
    if isinstance(feature, Mapping):
        return feature.get(key, default)
    return getattr(feature, key, default)


def _attrs(feature: Any) -> Mapping[str, Any]:
    value = _field(feature, "atributos", {})
    return value if isinstance(value, Mapping) else {}


def _attr_number(feature: Any, *keys: str, default: float) -> float:
    attrs = _attrs(feature)
    for key in keys:
        value = attrs.get(key)
        if isinstance(value, int | float):
            return float(value)
    return default


def _barrier_effect(profile: Profile, subtype: str, feature: Any) -> BarrierEffect:
    if subtype == "steep_grade":
        grade = _attr_number(feature, "grado_pct", "grade_pct", "pendiente_pct", default=9)
        if grade < 5:
            return "·"
        if profile == "WHEELCHAIR":
            return "B" if grade > 8 else "D"
        if profile in {"REDUCED_MOB", "BLIND", "COGNITIVE"}:
            return IMPACT_MATRIX[subtype][profile]
        return "·"

    if subtype == "path_narrow":
        width_cm = _attr_number(feature, "ancho_cm", "width_cm", default=80)
        if width_cm >= 90:
            return "·"

    return IMPACT_MATRIX.get(subtype, {}).get(profile, "·")


def _crossing_subtypes(feature: Any) -> list[str]:
    attrs = _attrs(feature)
    subtypes: list[str] = []
    if attrs.get("semaforo_peatonal") is False:
        subtypes.append("crossing_unsafe")
    if attrs.get("tiene_audio") is False:
        subtypes.append("crossing_no_audio")
    if attrs.get("rampas_esquina") is False:
        subtypes.append("crossing_no_curb_ramp")
    return subtypes


def _unique(values: Sequence[str]) -> list[str]:
    result: list[str] = []
    for value in values:
        if value and value not in result:
            result.append(value)
    return result


def resolve_effect(profiles: Sequence[Profile], feature: Any) -> str:
    kind = _field(feature, "kind", "barrier")
    subtype = str(_field(feature, "subtipo", ""))
    active_profiles = [profile for profile in profiles if profile in PROFILES]

    if not active_profiles:
        return "·"

    if kind == "amenity":
        amenity_effects = [AMENITY_MATRIX.get(subtype, {}).get(profile, "·") for profile in active_profiles]
        return max(amenity_effects, key=lambda effect: AMENITY_RANK[effect])

    subtypes = [subtype]
    if kind == "crossing":
        subtypes.extend(_crossing_subtypes(feature))

    barrier_effects = [
        _barrier_effect(profile, item, feature)
        for profile in active_profiles
        for item in _unique(subtypes)
    ]
    return max(barrier_effects, key=lambda effect: BARRIER_RANK[effect]) if barrier_effects else "·"
