'use client'

import { useEffect, useRef, useState } from 'react'
import { TJ_CENTER, featureColor, featureIcon, featureLabel } from '@/lib/map'
import { useSendaStore } from '@/lib/store'
import type { MapFeature, MapViewState, RouteResponse } from '@/lib/types'

type GoogleApi = typeof globalThis.google

let googleMapsPromise: Promise<GoogleApi> | null = null

const GOOGLE_DARK_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#111827' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#D1D5DB' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0B1220' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#334155' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#111827' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#182235' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#94A3B8' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#273449' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0F172A' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#E2E8F0' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#334155' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#475569' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1E293B' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0A2038' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#7DD3FC' }] }
]

function loadGoogleMaps(): Promise<GoogleApi> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps solo carga en el navegador'))
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google)
  }

  if (googleMapsPromise) {
    return googleMapsPromise
  }

  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!key) {
    return Promise.reject(new Error('Falta NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en apps/web/.env'))
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-senda-google-maps="true"]')
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google))
      existing.addEventListener('error', () => reject(new Error('No se pudo cargar Google Maps JS API')))
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly`
    script.async = true
    script.defer = true
    script.dataset.sendaGoogleMaps = 'true'
    script.onload = () => resolve(window.google)
    script.onerror = () => reject(new Error('No se pudo cargar Google Maps JS API'))
    document.head.appendChild(script)
  })

  return googleMapsPromise
}

function routePath(route: RouteResponse | null) {
  return route?.coords.map(([lng, lat]) => ({ lat, lng })) ?? []
}

function markerLabel(feature: MapFeature) {
  return featureIcon(feature)
}

function fitRoute(map: google.maps.Map, google: GoogleApi, route: RouteResponse | null) {
  const path = routePath(route)
  if (path.length < 2) return

  const bounds = new google.maps.LatLngBounds()
  path.forEach((point) => bounds.extend(point))
  map.fitBounds(bounds, 64)
}

export function MapView({ state = 'idle' }: { state?: MapViewState }) {
  void state
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const routeCasingRef = useRef<google.maps.Polyline | null>(null)
  const routeLineRef = useRef<google.maps.Polyline | null>(null)
  const markerRefs = useRef<google.maps.Marker[]>([])
  const [googleApi, setGoogleApi] = useState<GoogleApi | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const activeRoute = useSendaStore((store) => store.activeRoute)
  const liveFeatures = useSendaStore((store) => store.liveFeatures)
  const profiles = useSendaStore((store) => store.profiles)

  useEffect(() => {
    let cancelled = false

    loadGoogleMaps()
      .then((google) => {
        if (cancelled || !containerRef.current || mapRef.current) return

        const map = new google.maps.Map(containerRef.current, {
          center: { lat: TJ_CENTER[1], lng: TJ_CENTER[0] },
          zoom: 13,
          styles: GOOGLE_DARK_STYLE,
          backgroundColor: '#0B1220',
          clickableIcons: false,
          disableDefaultUI: true,
          fullscreenControl: true,
          gestureHandling: 'greedy',
          keyboardShortcuts: true,
          mapTypeControl: false,
          streetViewControl: false,
          zoomControl: true
        })

        mapRef.current = map
        setGoogleApi(google)
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : 'No se pudo cargar el mapa')
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const google = googleApi
    if (!map || !google) return

    const path = routePath(activeRoute)

    if (!routeCasingRef.current) {
      routeCasingRef.current = new google.maps.Polyline({
        map,
        path,
        clickable: false,
        strokeColor: '#FFFFFF',
        strokeOpacity: 0.92,
        strokeWeight: 11,
        zIndex: 20
      })
    } else {
      routeCasingRef.current.setPath(path)
    }

    if (!routeLineRef.current) {
      routeLineRef.current = new google.maps.Polyline({
        map,
        path,
        clickable: false,
        strokeColor: '#10B981',
        strokeOpacity: 1,
        strokeWeight: 7,
        zIndex: 21
      })
    } else {
      routeLineRef.current.setPath(path)
    }

    markerRefs.current.forEach((marker) => marker.setMap(null))
    markerRefs.current = liveFeatures.map((feature) => {
      const color = featureColor(feature, profiles)
      return new google.maps.Marker({
        map,
        position: { lat: feature.lat, lng: feature.lng },
        title: featureLabel(feature),
        label: {
          text: markerLabel(feature),
          color: '#FFFFFF',
          fontSize: '12px',
          fontWeight: '700'
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 1,
          scale: 9,
          strokeColor: '#FFFFFF',
          strokeWeight: 2
        },
        zIndex: 30
      })
    })

    fitRoute(map, google, activeRoute)
  }, [activeRoute, googleApi, liveFeatures, profiles])

  return (
    <section className="relative h-full min-h-[540px] overflow-hidden bg-map" aria-label="Mapa accesible de Senda">
      <div ref={containerRef} className="absolute inset-0" role="application" aria-label="Mapa interactivo de Tijuana" />
      {loadError ? (
        <div className="absolute inset-x-4 top-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 shadow-panel" role="alert">
          {loadError}
        </div>
      ) : null}
      <div className="absolute bottom-4 left-4 hidden max-w-sm flex-wrap gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-text shadow-panel md:flex" aria-label="Leyenda del mapa">
        <span>B Barrera</span>
        <span>A Amenidad</span>
        <span>T Transporte</span>
        <span>C Cruce</span>
      </div>
    </section>
  )
}
