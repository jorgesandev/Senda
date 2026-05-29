FROM ghcr.io/gis-ops/docker-valhalla/valhalla:latest

# Tiles y config horneados en la imagen (23 MB — no requiere volumen externo)
COPY valhalla.json /custom_files/valhalla.json
COPY valhalla_tiles/ /custom_files/valhalla_tiles/

EXPOSE 8002

ENTRYPOINT ["valhalla_service"]
CMD ["/custom_files/valhalla.json", "1"]
