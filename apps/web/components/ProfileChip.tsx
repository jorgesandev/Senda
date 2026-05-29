'use client'

import { Accessibility, Brain, Ear, Eye, Glasses, PersonStanding } from 'lucide-react'
import type { Profile } from '@/lib/types'

const PROFILE_LABELS: Record<Profile, string> = {
  WHEELCHAIR: 'Silla de ruedas',
  REDUCED_MOB: 'Movilidad reducida',
  BLIND: 'Ceguera',
  LOW_VISION: 'Baja vision',
  DEAF_HOH: 'Sordera o hipoacusia',
  COGNITIVE: 'Cognicion'
}

const PROFILE_ICONS = {
  WHEELCHAIR: Accessibility,
  REDUCED_MOB: PersonStanding,
  BLIND: Eye,
  LOW_VISION: Glasses,
  DEAF_HOH: Ear,
  COGNITIVE: Brain
}

export function ProfileChip({
  profile,
  selected,
  onToggle
}: {
  profile: Profile
  selected: boolean
  onToggle: (profile: Profile) => void
}) {
  const Icon = PROFILE_ICONS[profile]

  return (
    <button
      type="button"
      className={`touch-target inline-flex items-center gap-2 rounded-md border px-3 py-2 text-left font-semibold transition ${
        selected ? 'border-brand bg-blue-50 text-brand' : 'border-slate-300 bg-white text-text hover:bg-surface'
      }`}
      aria-pressed={selected}
      onClick={() => onToggle(profile)}
    >
      <Icon aria-hidden="true" size={20} />
      <span>{PROFILE_LABELS[profile]}</span>
    </button>
  )
}
