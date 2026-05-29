import type {
  GeoJsonFeatureCollection,
  MapFeature,
  ReportKind,
  RouteRequest,
  RouteResponse,
  TransportResponse
} from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers
    }
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `API request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export const MOCK_FEATURES: MapFeature[] = [
  {
    id: 'feat-centro-ramp-001',
    kind: 'barrier',
    categoria: 'cambio_nivel',
    subtipo: 'ramp_missing',
    atributos: { esquina: 'Av. Revolucion y Calle 4ta' },
    lat: 32.5331,
    lng: -117.0382,
    geometry: null,
    source: 'ciudadano',
    confidence: 0.86,
    photo_url: null,
    status: 'activo',
    upvotes: 7,
    created_at: '2026-05-29T12:00:00.000Z'
  },
  {
    id: 'feat-zona-rio-rest-001',
    kind: 'amenity',
    categoria: 'alivio',
    subtipo: 'rest_point',
    atributos: { sombra: true, banca: true },
    lat: 32.5225,
    lng: -117.0191,
    geometry: null,
    source: 'ciudadano',
    confidence: 0.91,
    photo_url: null,
    status: 'confirmado',
    upvotes: 12,
    created_at: '2026-05-29T12:02:00.000Z'
  },
  {
    id: 'feat-otay-cross-001',
    kind: 'crossing',
    categoria: 'cruce',
    subtipo: 'crossing_no_audio',
    atributos: { tiene_audio: false, tiene_conteo: true, rampas_esquina: true },
    lat: 32.5339,
    lng: -116.9701,
    geometry: null,
    source: 'auto',
    confidence: 0.74,
    photo_url: null,
    status: 'no_confirmado',
    upvotes: 3,
    created_at: '2026-05-29T12:05:00.000Z'
  }
]

export const MOCK_TRANSPORT: MapFeature[] = [
  {
    id: 'route-centro-zona-rio',
    kind: 'transport',
    categoria: 'ruta_camion',
    subtipo: 'Centro - Zona Rio',
    atributos: { accessibility_features: { has_ramp: true, low_floor: true, visual_announcements: true } },
    lat: 32.525,
    lng: -117.025,
    geometry: { type: 'LineString', coordinates: [[-117.0382, 32.5331], [-117.0191, 32.5225]] },
    source: 'ciudadano',
    confidence: 0.8,
    photo_url: null,
    status: 'activo',
    upvotes: 4,
    created_at: '2026-05-29T12:08:00.000Z'
  },
  {
    id: 'route-otay-centro',
    kind: 'transport',
    categoria: 'ruta_camion',
    subtipo: 'Otay - Centro',
    atributos: { accessibility_features: { priority_seat: true, visual_announcements: true } },
    lat: 32.534,
    lng: -117.006,
    geometry: { type: 'LineString', coordinates: [[-116.9701, 32.5339], [-117.0382, 32.5331]] },
    source: 'ciudadano',
    confidence: 0.72,
    photo_url: null,
    status: 'activo',
    upvotes: 2,
    created_at: '2026-05-29T12:09:00.000Z'
  },
  {
    id: 'route-playas-centro',
    kind: 'transport',
    categoria: 'ruta_camion',
    subtipo: 'Playas - Centro',
    atributos: { accessibility_features: { wheelchair_space: true, audio_announcements: true } },
    lat: 32.522,
    lng: -117.078,
    geometry: { type: 'LineString', coordinates: [[-117.1202, 32.5076], [-117.0382, 32.5331]] },
    source: 'ciudadano',
    confidence: 0.7,
    photo_url: null,
    status: 'activo',
    upvotes: 5,
    created_at: '2026-05-29T12:10:00.000Z'
  }
]

export async function requestRoute(payload: RouteRequest): Promise<RouteResponse> {
  return apiJson<RouteResponse>('/route', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function submitReport(input: {
  image?: File | null
  voice_text?: string
  lat: number
  lng: number
  kind: ReportKind
}): Promise<MapFeature> {
  void API_BASE_URL
  void input.image
  // Production will send multipart report data and receive a classified live feature.
  return {
    id: `report-${input.kind}-mock`,
    kind: input.kind,
    categoria: input.kind === 'barrier' ? 'obstruccion' : input.kind,
    subtipo: input.kind === 'barrier' ? 'obstruction_temporary' : 'accessible_business',
    atributos: { voice_text: input.voice_text ?? '' },
    lat: input.lat,
    lng: input.lng,
    geometry: null,
    source: 'ciudadano',
    confidence: 0.76,
    photo_url: null,
    status: 'activo',
    upvotes: 0,
    created_at: new Date().toISOString()
  }
}

export async function getFeatures(): Promise<GeoJsonFeatureCollection> {
  void API_BASE_URL
  // Production will GET live features by bounding box and optional kind filter.
  return {
    type: 'FeatureCollection',
    features: MOCK_FEATURES.map((feature) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [feature.lng, feature.lat] },
      properties: feature
    }))
  }
}

export async function getTransport(): Promise<TransportResponse> {
  void API_BASE_URL
  // Production will GET accessible transport features for the active map viewport.
  return { routes: MOCK_TRANSPORT }
}

export async function getFeatureById(id: string): Promise<MapFeature> {
  void API_BASE_URL
  // Production will GET a single live feature by id.
  return [...MOCK_FEATURES, ...MOCK_TRANSPORT].find((feature) => feature.id === id) ?? MOCK_FEATURES[0]
}
