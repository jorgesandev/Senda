import type { MapFeature, RouteResponse } from './types'

export const TJ_CENTER: [number, number] = [-117.0382, 32.5331]

export const DARK_MAP_STYLE = {
  version: 8,
  sources: {},
  layers: [
    {
      id: 'senda-background',
      type: 'background',
      paint: {
        'background-color': '#0B1220'
      }
    }
  ]
}

export function featureColor(feature: MapFeature): string {
  if (feature.kind === 'amenity') return '#10B981'
  if (feature.kind === 'transport') return '#3B82F6'
  if (feature.kind === 'crossing') return '#FB923C'
  return feature.subtipo.includes('missing') || feature.subtipo.includes('unsafe') ? '#EF4444' : '#FACC15'
}

export function featureLabel(feature: MapFeature): string {
  return `${feature.kind}: ${feature.subtipo.replaceAll('_', ' ')}`
}

export function routeGeoJson(route: RouteResponse | null) {
  return {
    type: 'FeatureCollection',
    features: route
      ? [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: route.coords
            },
            properties: {}
          }
        ]
      : []
  }
}

export function featuresGeoJson(features: MapFeature[]) {
  return {
    type: 'FeatureCollection',
    features: features.map((feature) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [feature.lng, feature.lat]
      },
      properties: {
        id: feature.id,
        kind: feature.kind,
        label: featureLabel(feature),
        color: featureColor(feature)
      }
    }))
  }
}
