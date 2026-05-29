export type Profile = 'WHEELCHAIR' | 'REDUCED_MOB' | 'BLIND' | 'LOW_VISION' | 'DEAF_HOH' | 'COGNITIVE'

export type Situational = 'STROLLER' | 'TEMP_INJURY'

export type MapFeatureKind = 'barrier' | 'amenity' | 'transport' | 'crossing'

export type FeatureSource = 'auto' | 'ciudadano'

export type FeatureStatus = 'activo' | 'confirmado' | 'no_confirmado' | 'resuelto'

export type EffectCode = 'B' | 'D' | 'L' | '·'

export type AmenityEffect = 'CLAVE' | 'UTIL' | '·'

export type MapViewState = 'idle' | 'loading' | 'routed' | 'blocked'

export type ReportKind = MapFeatureKind

export interface LatLng {
  lat: number
  lng: number
}

export interface MapFeature {
  id: string
  kind: MapFeatureKind
  categoria: string
  subtipo: string
  atributos: Record<string, unknown>
  lat: number
  lng: number
  geometry: Record<string, unknown> | null
  source: FeatureSource
  confidence: number
  photo_url: string | null
  status: FeatureStatus
  upvotes: number
  created_at: string
}

export interface User {
  id: string
  perfiles: Profile[]
  situacionales: Situational[]
  prefs_a11y: Record<string, unknown>
}

export interface RouteRequest {
  origin: LatLng | string
  destination: LatLng | string
  profiles: Profile[]
}

export interface RouteResponse {
  coords: [number, number][]
  distance_m: number
  eta_min: number
  features_evitadas: MapFeature[]
  features_aprovechadas: MapFeature[]
  steps: string[]
}

export interface GeoJsonFeatureCollection {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    geometry: {
      type: 'Point'
      coordinates: [number, number]
    }
    properties: MapFeature
  }>
}

export interface TransportResponse {
  routes: MapFeature[]
}

export interface A11yPrefs {
  highContrast: boolean
  textScale: 100 | 125 | 150 | 200
  reducedMotion: boolean
}
