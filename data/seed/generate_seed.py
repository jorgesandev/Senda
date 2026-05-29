#!/usr/bin/env python3
"""Genera mock data realista citywide para el demo de Senda.

Conserva intactas las features calibradas a mano del corredor Centro -> Zona Rio
(las entradas `seed-*`, que hacen que WHEELCHAIR y BLIND tomen rutas distintas) y
agrega:
  - Amenidades ancladas a landmarks reales de Tijuana (centros comerciales,
    hospitales, universidades, parques, garitas, playas).
  - Barreras dispersas por colonias (pendientes en cerros, banquetas rotas,
    obstrucciones), evitando el corredor calibrado para no romper el demo.
  - Cruces y transporte con atributos de accesibilidad.

Escribe el set fusionado a `features_seed.json`. Con `--push`, ademas hace upsert
a Firestore (idempotente por id).

Correr desde apps/api para tener firebase-admin + ADC disponibles:
    cd apps/api && .venv/bin/python ../../data/seed/generate_seed.py --push
"""
from __future__ import annotations

import argparse
import json
import random
from datetime import datetime, timedelta, timezone
from pathlib import Path

SEED_PATH = Path(__file__).resolve().parent / "features_seed.json"

rng = random.Random(42)
_BASE_TS = datetime(2026, 5, 28, 9, 0, 0, tzinfo=timezone.utc)
_counter = 0


def _iso() -> str:
    global _counter
    ts = _BASE_TS + timedelta(minutes=7 * _counter)
    _counter += 1
    return ts.isoformat().replace("+00:00", "Z")


# El corredor calibrado a mano: NO sembrar barreras nuevas aqui (rompe el demo
# WHEELCHAIR vs BLIND). Amenidades si son seguras (nunca excluyen).
_CORRIDOR = {"min_lat": 32.5280, "max_lat": 32.5345, "min_lng": -117.0370, "max_lng": -117.0235}


def _in_corridor(lat: float, lng: float) -> bool:
    return (
        _CORRIDOR["min_lat"] <= lat <= _CORRIDOR["max_lat"]
        and _CORRIDOR["min_lng"] <= lng <= _CORRIDOR["max_lng"]
    )


def _feat(
    fid: str,
    kind: str,
    categoria: str,
    subtipo: str,
    lat: float,
    lng: float,
    atributos: dict,
    *,
    source: str = "ciudadano",
    status: str = "confirmado",
) -> dict:
    return {
        "id": fid,
        "kind": kind,
        "categoria": categoria,
        "subtipo": subtipo,
        "atributos": atributos,
        "lat": round(lat, 6),
        "lng": round(lng, 6),
        "geometry": None,
        "source": source,
        "confidence": round(rng.uniform(0.74, 0.96), 2),
        "photo_url": None,
        "status": status,
        "upvotes": rng.randint(2, 28),
        "created_at": _iso(),
    }


# ---------------------------------------------------------------------------
# Amenidades en landmarks reales (subtipo, categoria, lat, lng, nombre)
# ---------------------------------------------------------------------------
AMENITIES: list[tuple[str, str, float, float, str]] = [
    # Zona Rio
    ("elevator", "acceso", 32.5283, -117.0205, "Plaza Rio Tijuana - Elevador central"),
    ("accessible_restroom", "alivio", 32.5281, -117.0210, "Plaza Rio Tijuana - Bano accesible"),
    ("accessible_parking", "acceso", 32.5288, -117.0199, "Plaza Rio Tijuana - Estacionamiento accesible"),
    ("good_ramp", "acceso", 32.5279, -117.0216, "Plaza Rio Tijuana - Rampa acceso norte"),
    ("accessible_business", "servicio", 32.5277, -117.0200, "Starbucks Plaza Rio"),
    ("accessible_restroom", "alivio", 32.5258, -117.0283, "CECUT - Sanitario accesible"),
    ("good_ramp", "acceso", 32.5260, -117.0278, "CECUT - Rampa de acceso principal"),
    ("tactile_present", "guia", 32.5256, -117.0286, "CECUT - Guia podotactil en entrada"),
    ("elevator", "acceso", 32.5238, -117.0179, "Hospital Angeles Tijuana - Elevador"),
    ("accessible_parking", "acceso", 32.5235, -117.0184, "Hospital Angeles - Estacionamiento accesible"),
    ("accessible_restroom", "alivio", 32.5316, -117.0249, "Macroplaza del Rio - Bano accesible"),
    ("step_free_access", "acceso", 32.5314, -117.0254, "Macroplaza del Rio - Acceso a nivel"),
    ("accessible_business", "servicio", 32.5247, -117.0188, "Mercado Hidalgo - Local Accesible Verificado"),
    ("rest_point", "alivio", 32.5300, -117.0228, "Paseo de los Heroes - Punto de descanso"),
    # Centro (oeste del corredor)
    ("good_ramp", "acceso", 32.5325, -117.0376, "Catedral de Tijuana - Rampa lateral"),
    ("rest_point", "alivio", 32.5294, -117.0405, "Parque Teniente Guerrero - Banca con sombra"),
    ("shade_water", "alivio", 32.5292, -117.0408, "Parque Teniente Guerrero - Bebedero"),
    ("accessible_business", "servicio", 32.5320, -117.0398, "Av. Revolucion - Comercio Accesible Verificado"),
    ("accessible_restroom", "alivio", 32.5318, -117.0390, "Plaza Santa Cecilia - Bano accesible"),
    # Otay
    ("good_ramp", "acceso", 32.5305, -116.9667, "UABC Otay - Rampa de biblioteca"),
    ("rest_point", "alivio", 32.5309, -116.9662, "UABC Otay - Area de descanso"),
    ("accessible_restroom", "alivio", 32.5411, -116.9706, "Aeropuerto Internacional TJ - Sanitario accesible"),
    ("elevator", "acceso", 32.5413, -116.9701, "Aeropuerto Internacional TJ - Elevador terminal"),
    ("accessible_parking", "acceso", 32.5300, -116.9610, "Macroplaza Otay - Estacionamiento accesible"),
    ("accessible_business", "servicio", 32.5295, -116.9620, "Calimax Otay - Acceso a nivel"),
    # La Mesa / Agua Caliente / Chapultepec
    ("elevator", "acceso", 32.5067, -116.9707, "Estadio Caliente - Elevador de gradas"),
    ("accessible_parking", "acceso", 32.5070, -116.9700, "Estadio Caliente - Cajones accesibles"),
    ("accessible_restroom", "alivio", 32.5006, -116.9806, "Plaza Mundo Divertido - Bano accesible"),
    ("step_free_access", "acceso", 32.5100, -116.9950, "Hospital General de Tijuana - Acceso a nivel"),
    ("accessible_restroom", "alivio", 32.5103, -116.9945, "Hospital General de Tijuana - Sanitario accesible"),
    ("elevator", "acceso", 32.5097, -116.9953, "Hospital General de Tijuana - Elevador"),
    # Playas de Tijuana
    ("rest_point", "alivio", 32.5277, -117.1186, "Playas de Tijuana - Banca de malecon"),
    ("good_ramp", "acceso", 32.5347, -117.1234, "Faro de Playas - Rampa al mirador"),
    ("shade_water", "alivio", 32.5270, -117.1190, "Malecon Playas - Sombra y bebedero"),
    # Garita El Chaparral
    ("step_free_access", "acceso", 32.5430, -117.0297, "Garita El Chaparral - Acceso peatonal a nivel"),
    ("tactile_present", "guia", 32.5428, -117.0301, "Garita El Chaparral - Guia podotactil"),
    ("audio_signal_present", "guia", 32.5432, -117.0294, "Garita El Chaparral - Cruce con senal de audio"),
]


# ---------------------------------------------------------------------------
# Barreras dispersas (subtipo, categoria, lat, lng, descripcion, attrs extra)
# ---------------------------------------------------------------------------
BARRIERS: list[tuple[str, str, float, float, str, dict]] = [
    # Zona Norte / Centro oeste
    ("surface_broken", "superficie", 32.5360, -117.0420, "Banqueta cuarteada sobre Calle 1ra, Zona Norte", {}),
    ("step_curb", "cambio_nivel", 32.5345, -117.0450, "Escalon sin rebaje en Calle Coahuila", {}),
    ("obstruction_temporary", "obstruccion", 32.5355, -117.0405, "Puesto ambulante bloqueando la banqueta", {}),
    ("path_narrow", "ancho", 32.5350, -117.0440, "Paso peatonal angosto junto a comercio", {"ancho_cm": 78}),
    ("step_curb", "cambio_nivel", 32.5300, -117.0430, "Escalon pronunciado en Calle 3ra", {}),
    ("surface_broken", "superficie", 32.5282, -117.0452, "Banqueta cuarteada en Calle 5ta", {}),
    # Colonia Libertad (cerro)
    ("steep_grade", "pendiente", 32.5400, -117.0150, "Pendiente pronunciada en Col. Libertad", {"grado_pct": 14}),
    ("surface_unpaved", "superficie", 32.5420, -117.0120, "Tramo sin pavimentar en Col. Libertad", {}),
    ("step_curb", "cambio_nivel", 32.5410, -117.0180, "Escalones de concreto sin pasamanos", {}),
    # Camino Verde / Cerro Colorado
    ("steep_grade", "pendiente", 32.4900, -116.9800, "Subida empinada en Camino Verde", {"grado_pct": 16}),
    ("surface_loose", "superficie", 32.4880, -116.9820, "Grava suelta sobre la banqueta", {}),
    ("ramp_missing", "cambio_nivel", 32.4910, -116.9790, "Esquina sin rampa de acceso", {}),
    # Sanchez Taboada
    ("surface_broken", "superficie", 32.4860, -116.9500, "Banqueta destruida en Blvd. Sanchez Taboada", {}),
    ("obstruction_permanent", "obstruccion", 32.4870, -116.9510, "Poste en medio de la banqueta", {}),
    ("tactile_missing", "guia_orientacion", 32.4855, -116.9495, "Avenida sin guia podotactil", {}),
    # La Mesa
    ("surface_broken", "superficie", 32.5020, -116.9650, "Pavimento roto en Blvd. Diaz Ordaz", {}),
    ("aerial_obstacle", "obstruccion", 32.5015, -116.9660, "Letrero bajo a 1.78m", {"altura_cm": 178}),
    # Otay
    ("step_curb", "cambio_nivel", 32.5320, -116.9580, "Escalon alto en Otay Universidad", {}),
    ("obstruction_temporary", "obstruccion", 32.5310, -116.9600, "Vehiculo estacionado sobre banqueta", {}),
    ("signage_poor", "guia_orientacion", 32.5330, -116.9550, "Senalizacion deficiente en cruce", {}),
    # Chapultepec / Hipodromo
    ("steep_grade", "pendiente", 32.5150, -117.0050, "Calle empinada en Col. Chapultepec", {"grado_pct": 11}),
    ("surface_slippery", "superficie", 32.5160, -117.0040, "Superficie resbalosa cuando llueve", {}),
    # Zona Rio (borde este, lejos del corredor)
    ("obstruction_temporary", "obstruccion", 32.5270, -117.0150, "Materiales de obra en la banqueta", {}),
    ("path_narrow", "ancho", 32.5250, -117.0160, "Banqueta angosta junto a obra", {"ancho_cm": 72}),
    # Playas
    ("surface_unpaved", "superficie", 32.5230, -117.1150, "Tramo sin pavimentar cerca del malecon", {}),
    ("ramp_missing", "cambio_nivel", 32.5300, -117.1200, "Esquina sin rampa en Playas", {}),
    # El Florido / Soler (este)
    ("surface_broken", "superficie", 32.4700, -116.9000, "Banqueta rota en El Florido", {}),
    ("steep_grade", "pendiente", 32.4750, -116.9100, "Pendiente en Col. El Florido", {"grado_pct": 13}),
    ("obstruction_permanent", "obstruccion", 32.4720, -116.9050, "Arbol invade el paso peatonal", {}),
    # Misc
    ("obstruction_temporary", "obstruccion", 32.5180, -116.9900, "Contenedor de basura bloqueando el paso", {}),
    ("tactile_missing", "guia_orientacion", 32.5050, -116.9750, "Parada sin guia podotactil", {}),
    ("signage_poor", "guia_orientacion", 32.4950, -116.9700, "Senalizacion pobre en cruce escolar", {}),
    ("path_narrow", "ancho", 32.5450, -117.0250, "Paso angosto bajo el puente", {"ancho_cm": 75}),
]


# ---------------------------------------------------------------------------
# Cruces (lat, lng, nombre, attrs)
# ---------------------------------------------------------------------------
CROSSINGS: list[tuple[float, float, str, dict]] = [
    (32.5280, -117.0220, "Sanchez Taboada y Independencia",
     {"semaforo_peatonal": True, "tiene_audio": False, "tiene_podotactil": False, "rampas_esquina": True}),
    (32.5305, -116.9665, "Cruce UABC Otay",
     {"semaforo_peatonal": True, "tiene_audio": False, "tiene_podotactil": False, "rampas_esquina": True}),
    (32.5070, -116.9710, "Cruce Estadio Caliente",
     {"semaforo_peatonal": False, "tiene_audio": False, "tiene_podotactil": False, "rampas_esquina": False}),
    (32.5320, -117.0405, "Cruce Calle 2da Centro",
     {"semaforo_peatonal": True, "tiene_audio": False, "tiene_podotactil": False, "rampas_esquina": False}),
    (32.5410, -116.9395, "Cruce Garita Otay",
     {"semaforo_peatonal": True, "tiene_audio": True, "tiene_podotactil": True, "rampas_esquina": True}),
    (32.5006, -116.9810, "Cruce Plaza Mundo Divertido",
     {"semaforo_peatonal": True, "tiene_audio": False, "tiene_podotactil": False, "rampas_esquina": True}),
]


# ---------------------------------------------------------------------------
# Transporte (lat, lng, nombre, accessibility_features)
# ---------------------------------------------------------------------------
TRANSPORT: list[tuple[float, float, str, dict]] = [
    (32.5283, -117.0205, "Parada Plaza Rio - Ruta Centro",
     {"has_ramp": True, "low_floor": True, "visual_announcements": True, "priority_seat": True}),
    (32.5305, -116.9667, "Parada UABC Otay - Ruta Otay-Centro",
     {"has_ramp": True, "audio_announcements": True, "priority_seat": True}),
    (32.5067, -116.9710, "Parada Estadio Caliente - Ruta La Mesa",
     {"visual_announcements": True, "priority_seat": True, "low_floor": True}),
]


def build_mock() -> list[dict]:
    out: list[dict] = []
    skipped = 0

    for i, (subtipo, categoria, lat, lng, nombre) in enumerate(AMENITIES):
        out.append(
            _feat(f"mock-amenity-{i:03d}", "amenity", categoria, subtipo, lat, lng,
                  {"nombre": nombre, "descripcion": nombre})
        )

    for i, (subtipo, categoria, lat, lng, desc, extra) in enumerate(BARRIERS):
        if _in_corridor(lat, lng):
            skipped += 1
            continue
        attrs = {"descripcion": desc, **extra}
        status = "activo" if i % 3 else "confirmado"
        out.append(
            _feat(f"mock-barrier-{i:03d}", "barrier", categoria, subtipo, lat, lng, attrs,
                  source="ciudadano" if i % 2 else "auto", status=status)
        )

    for i, (lat, lng, nombre, attrs) in enumerate(CROSSINGS):
        out.append(
            _feat(f"mock-crossing-{i:03d}", "crossing", "cruce", "crossing", lat, lng,
                  {"nombre": nombre, **attrs}, status="activo")
        )

    for i, (lat, lng, nombre, feats) in enumerate(TRANSPORT):
        out.append(
            _feat(f"mock-transport-{i:03d}", "transport", "parada", nombre, lat, lng,
                  {"accessibility_features": feats}, status="activo")
        )

    if skipped:
        print(f"  (omitidas {skipped} barreras que caian en el corredor calibrado)")
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description="Genera mock data citywide para Senda")
    parser.add_argument("--push", action="store_true", help="Upsert a Firestore (idempotente)")
    args = parser.parse_args()

    existing: list[dict] = json.loads(SEED_PATH.read_text()) if SEED_PATH.exists() else []
    calibrated = [f for f in existing if str(f.get("id", "")).startswith("seed-")]

    mock = build_mock()
    merged = calibrated + mock

    SEED_PATH.write_text(json.dumps(merged, ensure_ascii=False, indent=2) + "\n")
    by_kind: dict[str, int] = {}
    for f in merged:
        by_kind[f["kind"]] = by_kind.get(f["kind"], 0) + 1
    print(f"Escritas {len(merged)} features en {SEED_PATH.name}: {by_kind}")
    print(f"  ({len(calibrated)} calibradas seed-* + {len(mock)} mock-*)")

    if args.push:
        _push_firestore(merged)


def _push_firestore(features: list[dict]) -> None:
    import os

    import firebase_admin
    from firebase_admin import firestore

    project = os.getenv("FIREBASE_PROJECT_ID", "sendamx")
    try:
        firebase_admin.get_app()
    except ValueError:
        firebase_admin.initialize_app(options={"projectId": project})
    db = firestore.client()

    batch = db.batch()
    col = db.collection("features")
    n = 0
    for f in features:
        batch.set(col.document(f["id"]), f)
        n += 1
        if n % 400 == 0:
            batch.commit()
            batch = db.batch()
    batch.commit()
    print(f"Firestore: upsert de {n} features en proyecto {project}/features")


if __name__ == "__main__":
    main()
