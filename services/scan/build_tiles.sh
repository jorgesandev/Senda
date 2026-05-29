#!/usr/bin/env bash
set -euo pipefail

python - <<'PY'
raise NotImplementedError("build Valhalla tiles from enriched OSM data")
PY
