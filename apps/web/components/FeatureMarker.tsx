'use client'

import { Bus, CircleCheck, Footprints, TriangleAlert } from 'lucide-react'
import { featureColor, featureLabel } from '@/lib/map'
import { useSendaStore } from '@/lib/store'
import type { MapFeature } from '@/lib/types'

const ICONS = {
  barrier: TriangleAlert,
  amenity: CircleCheck,
  transport: Bus,
  crossing: Footprints
}

export function FeatureMarker({ feature }: { feature: MapFeature }) {
  const profiles = useSendaStore((s) => s.profiles)
  const Icon = ICONS[feature.kind]
  const color = featureColor(feature, profiles)

  return (
    <span
      className="inline-flex min-h-12 items-center gap-2 rounded-md border bg-white px-3 py-2 font-semibold text-text"
      style={{ borderColor: color }}
      aria-label={featureLabel(feature)}
    >
      <Icon aria-hidden="true" size={20} color={color} />
      {feature.subtipo.replaceAll('_', ' ')}
    </span>
  )
}
