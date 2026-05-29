import type { MapFeature } from './types'

export const TJ_CENTER: [number, number] = [-117.0382, 32.5331]

export function featureColor(feature: MapFeature): string {
  if (feature.kind === 'amenity') return '#10B981'
  if (feature.kind === 'transport') return '#3B82F6'
  if (feature.kind === 'crossing') return '#FB923C'
  return feature.subtipo.includes('missing') || feature.subtipo.includes('unsafe') ? '#EF4444' : '#FACC15'
}

export function featureLabel(feature: MapFeature): string {
  return `${feature.kind}: ${feature.subtipo.replaceAll('_', ' ')}`
}
