import type { MapFeature, Profile } from './types'

type BarrierEffect = 'B' | 'D' | 'L' | '·'
type AmenityEffect = 'CLAVE' | 'UTIL' | '·'

const BARRIER_RANK: Record<BarrierEffect, number> = { '·': 0, L: 1, D: 2, B: 3 }
const AMENITY_RANK: Record<AmenityEffect, number> = { '·': 0, UTIL: 1, CLAVE: 2 }

const IMPACT: Record<string, Partial<Record<Profile, BarrierEffect>>> = {
  surface_broken:          { WHEELCHAIR: 'B', REDUCED_MOB: 'D', BLIND: 'D', LOW_VISION: 'L', DEAF_HOH: '·', COGNITIVE: 'L' },
  surface_unpaved:         { WHEELCHAIR: 'B', REDUCED_MOB: 'D', BLIND: 'D', LOW_VISION: 'L', DEAF_HOH: '·', COGNITIVE: 'L' },
  surface_loose:           { WHEELCHAIR: 'D', REDUCED_MOB: 'D', BLIND: 'D', LOW_VISION: 'L', DEAF_HOH: '·', COGNITIVE: 'L' },
  surface_slippery:        { WHEELCHAIR: 'D', REDUCED_MOB: 'D', BLIND: 'D', LOW_VISION: 'L', DEAF_HOH: '·', COGNITIVE: 'L' },
  step_curb:               { WHEELCHAIR: 'B', REDUCED_MOB: 'D', BLIND: 'D', LOW_VISION: 'L', DEAF_HOH: '·', COGNITIVE: 'L' },
  stairs:                  { WHEELCHAIR: 'B', REDUCED_MOB: 'D', BLIND: 'D', LOW_VISION: 'L', DEAF_HOH: '·', COGNITIVE: 'L' },
  ramp_missing:            { WHEELCHAIR: 'B', REDUCED_MOB: 'L', BLIND: '·', LOW_VISION: '·', DEAF_HOH: '·', COGNITIVE: '·' },
  ramp_defective:          { WHEELCHAIR: 'B', REDUCED_MOB: 'D', BLIND: '·', LOW_VISION: '·', DEAF_HOH: '·', COGNITIVE: '·' },
  steep_grade:             { WHEELCHAIR: 'B', REDUCED_MOB: 'D', BLIND: 'L', LOW_VISION: '·', DEAF_HOH: '·', COGNITIVE: 'L' },
  path_narrow:             { WHEELCHAIR: 'B', REDUCED_MOB: 'L', BLIND: 'L', LOW_VISION: '·', DEAF_HOH: '·', COGNITIVE: '·' },
  obstruction_temporary:   { WHEELCHAIR: 'B', REDUCED_MOB: 'D', BLIND: 'D', LOW_VISION: 'L', DEAF_HOH: '·', COGNITIVE: 'D' },
  obstruction_permanent:   { WHEELCHAIR: 'B', REDUCED_MOB: 'D', BLIND: 'D', LOW_VISION: 'L', DEAF_HOH: '·', COGNITIVE: 'D' },
  aerial_obstacle:         { WHEELCHAIR: '·', REDUCED_MOB: '·', BLIND: 'B', LOW_VISION: 'L', DEAF_HOH: '·', COGNITIVE: '·' },
  tactile_missing:         { WHEELCHAIR: '·', REDUCED_MOB: '·', BLIND: 'B', LOW_VISION: 'D', DEAF_HOH: '·', COGNITIVE: 'L' },
  signage_poor:            { WHEELCHAIR: '·', REDUCED_MOB: '·', BLIND: 'L', LOW_VISION: 'D', DEAF_HOH: 'L', COGNITIVE: 'D' },
  sensory_chaos:           { WHEELCHAIR: '·', REDUCED_MOB: 'L', BLIND: 'L', LOW_VISION: '·', DEAF_HOH: '·', COGNITIVE: 'D' },
  crossing_unsafe:         { WHEELCHAIR: 'D', REDUCED_MOB: 'D', BLIND: 'B', LOW_VISION: 'D', DEAF_HOH: 'L', COGNITIVE: 'D' },
  crossing_no_audio:       { WHEELCHAIR: '·', REDUCED_MOB: '·', BLIND: 'B', LOW_VISION: 'L', DEAF_HOH: '·', COGNITIVE: 'L' },
  crossing_no_curb_ramp:   { WHEELCHAIR: 'B', REDUCED_MOB: 'L', BLIND: '·', LOW_VISION: '·', DEAF_HOH: '·', COGNITIVE: '·' },
}

const AMENITY: Record<string, Partial<Record<Profile, AmenityEffect>>> = {
  elevator:              { WHEELCHAIR: 'CLAVE', REDUCED_MOB: 'CLAVE' },
  accessible_restroom:   { WHEELCHAIR: 'CLAVE', REDUCED_MOB: 'UTIL' },
  rest_point:            { WHEELCHAIR: 'UTIL', REDUCED_MOB: 'CLAVE', BLIND: 'UTIL', LOW_VISION: 'UTIL', DEAF_HOH: 'UTIL', COGNITIVE: 'UTIL' },
  tactile_present:       { BLIND: 'CLAVE', LOW_VISION: 'UTIL' },
  audio_signal_present:  { BLIND: 'CLAVE', LOW_VISION: 'UTIL' },
  step_free_access:      { WHEELCHAIR: 'CLAVE', REDUCED_MOB: 'UTIL' },
  good_ramp:             { WHEELCHAIR: 'CLAVE', REDUCED_MOB: 'UTIL' },
  accessible_business:   { WHEELCHAIR: 'UTIL', REDUCED_MOB: 'UTIL', BLIND: 'UTIL', LOW_VISION: 'UTIL', DEAF_HOH: 'UTIL', COGNITIVE: 'UTIL' },
}

function crossingSubtypes(feature: MapFeature): string[] {
  const attrs = feature.atributos as Record<string, unknown>
  const subtypes: string[] = []
  if (attrs['semaforo_peatonal'] === false) subtypes.push('crossing_unsafe')
  if (attrs['tiene_audio'] === false) subtypes.push('crossing_no_audio')
  if (attrs['rampas_esquina'] === false) subtypes.push('crossing_no_curb_ramp')
  return subtypes
}

export function resolveEffect(profiles: Profile[], feature: MapFeature): BarrierEffect | AmenityEffect {
  if (!profiles.length) return '·'

  if (feature.kind === 'amenity') {
    const effects = profiles.map((p) => (AMENITY[feature.subtipo]?.[p] ?? '·') as AmenityEffect)
    return effects.reduce((best, e) => (AMENITY_RANK[e] > AMENITY_RANK[best] ? e : best), '·' as AmenityEffect)
  }

  const subtypes = feature.kind === 'crossing'
    ? [feature.subtipo, ...crossingSubtypes(feature)]
    : [feature.subtipo]

  const effects = profiles.flatMap((p) =>
    subtypes.map((s) => (IMPACT[s]?.[p] ?? '·') as BarrierEffect)
  )

  return effects.reduce((best, e) => (BARRIER_RANK[e] > BARRIER_RANK[best] ? e : best), '·' as BarrierEffect)
}
