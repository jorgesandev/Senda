# Valhalla Local Service

This folder contains the Valhalla service shell for local routing over OSM data.

## Tijuana PBF

1. Download a Baja California or Mexico OSM PBF extract from a trusted OSM extract provider.
2. Clip it to the Tijuana metro bounding box if you need a smaller file.
3. Place the extract outside git, for example `services/valhalla/tijuana.osm.pbf`.
4. Build tiles into `services/valhalla/valhalla_tiles/`.

Example tile build command shape:

```bash
docker run --rm --entrypoint valhalla_build_tiles \
  -v "$PWD:/custom_files" ghcr.io/gis-ops/docker-valhalla/valhalla:latest \
  -c /custom_files/valhalla.json /custom_files/tijuana.osm.pbf
```

Run the service:

```bash
docker compose up
```
