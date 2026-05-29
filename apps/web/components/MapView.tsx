'use client'

import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import { TJ_CENTER, featuresGeoJson, resolveMapStyle, routeGeoJson } from '@/lib/map'
import { useSendaStore } from '@/lib/store'
import type { MapViewState } from '@/lib/types'

export function MapView({ state = 'idle' }: { state?: MapViewState }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const activeRoute = useSendaStore((store) => store.activeRoute)
  const liveFeatures = useSendaStore((store) => store.liveFeatures)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: resolveMapStyle() as maplibregl.StyleSpecification | string,
      center: TJ_CENTER,
      zoom: 12.7,
      attributionControl: false
    })

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right')
    mapRef.current = map

    map.on('load', () => {
      map.addSource('senda-route', {
        type: 'geojson',
        data: routeGeoJson(activeRoute) as maplibregl.GeoJSONSourceSpecification['data']
      })
      map.addLayer({
        id: 'senda-route-line',
        type: 'line',
        source: 'senda-route',
        paint: {
          'line-color': '#10B981',
          'line-width': 6,
          'line-opacity': 0.95
        }
      })
      map.addSource('senda-features', {
        type: 'geojson',
        data: featuresGeoJson(liveFeatures) as maplibregl.GeoJSONSourceSpecification['data']
      })
      map.addLayer({
        id: 'senda-feature-points',
        type: 'circle',
        source: 'senda-features',
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': 9,
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 2
        }
      })
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [activeRoute, liveFeatures])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return
    const routeSource = map.getSource('senda-route') as maplibregl.GeoJSONSource | undefined
    const featureSource = map.getSource('senda-features') as maplibregl.GeoJSONSource | undefined
    routeSource?.setData(routeGeoJson(activeRoute) as maplibregl.GeoJSONSourceSpecification['data'])
    featureSource?.setData(featuresGeoJson(liveFeatures) as maplibregl.GeoJSONSourceSpecification['data'])
  }, [activeRoute, liveFeatures])

  return (
    <section className="map-panel relative h-full min-h-[540px] overflow-hidden" aria-label="Mapa accesible de Senda">
      <div ref={containerRef} className="absolute inset-0" role="application" aria-label="Mapa interactivo de Tijuana" />
      <div className="absolute left-4 top-4 rounded-md bg-white px-3 py-2 text-sm font-semibold text-text shadow-panel">
        Estado: {state}
      </div>
      <div className="absolute bottom-4 left-4 max-w-sm rounded-md bg-white px-3 py-2 text-sm text-text shadow-panel">
        Marcadores usan icono, texto y color para comunicar tipo y severidad.
      </div>
    </section>
  )
}
