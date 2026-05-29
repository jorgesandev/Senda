from __future__ import annotations

import json

import httpx

from config import settings

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

_TRANSLATION_PROMPT = """Traduce las siguientes instrucciones de navegación peatonal del inglés al español de México. Mantén los nombres de calles sin traducir. Responde ÚNICAMENTE con un JSON array de strings, en el mismo orden y misma cantidad de elementos que el input.

Ejemplo:
Input: ["Walk south on the walkway.", "Turn right onto Calle Primera.", "You have arrived at your destination."]
Output: ["Camina hacia el sur por la banqueta.", "Gira a la derecha hacia Calle Primera.", "Has llegado a tu destino."]
"""


async def translate_steps(steps: list[str]) -> list[str]:
    """Translate Valhalla English step instructions to Mexican Spanish using Gemini Flash."""
    if not steps:
        return steps

    api_key = settings.google_maps_api_key
    if not api_key:
        # Fallback: return steps as-is if no API key configured
        return steps

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"text": _TRANSLATION_PROMPT},
                    {"text": json.dumps(steps, ensure_ascii=False)},
                ],
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "array",
                "items": {"type": "string"},
            },
        },
    }

    try:
        async with httpx.AsyncClient(timeout=8) as client:
            response = await client.post(
                f"{GEMINI_URL}?key={api_key}",
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            candidates = data.get("candidates", [])
            if candidates:
                text = candidates[0]["content"]["parts"][0]["text"]
                translated = json.loads(text)
                if isinstance(translated, list) and len(translated) == len(steps):
                    return [str(item) for item in translated]
    except Exception:
        # Any failure: silently fall back to raw English steps
        pass

    return steps
