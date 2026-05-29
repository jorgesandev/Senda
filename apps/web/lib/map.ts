import { resolveEffect } from './matrix'
import type { MapFeature, Profile } from './types'

export const TJ_CENTER: [number, number] = [-117.0382, 32.5331]

export function featureColor(feature: MapFeature, profiles: Profile[] = []): string {
  if (feature.kind === 'amenity') return '#10B981'
  if (feature.kind === 'transport') return '#3B82F6'

  if (profiles.length > 0) {
    const effect = resolveEffect(profiles, feature)
    if (effect === 'B') return '#EF4444'
    if (effect === 'D') return '#FB923C'
    if (effect === 'L') return '#FACC15'
    return '#94A3B8'
  }

  if (feature.kind === 'crossing') return '#FB923C'
  const isHigh = feature.subtipo.includes('missing') || feature.subtipo.includes('unsafe') || feature.subtipo.includes('broken')
  return isHigh ? '#EF4444' : '#FACC15'
}

export function featureLabel(feature: MapFeature): string {
  return `${feature.kind}: ${feature.subtipo.replaceAll('_', ' ')}`
}

export function featureIcon(feature: MapFeature): string {
  if (feature.kind === 'amenity') return 'A'
  if (feature.kind === 'transport') return 'T'
  if (feature.kind === 'crossing') return 'C'
  return 'B'
}
