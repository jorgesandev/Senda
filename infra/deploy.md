# Deployment Notes

## Web

- Target: Vercel.
- Package manager: Bun.
- Build command: `bun run build`.
- Runtime environment: set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.

## API

- Target: Cloud Run.
- Container: `apps/api/Dockerfile`.
- Port: `8080`.
- Required runtime variables: `VALHALLA_URL`, `VISION_BACKEND`, and credentials only when the related integration is wired.

## Valhalla

- Target: GCP VM.
- Run the Valhalla container with mounted tiles under `valhalla_tiles/`.
- Rebuild tiles after accepted cold-layer data changes.
