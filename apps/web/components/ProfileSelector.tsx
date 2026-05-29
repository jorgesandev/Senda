'use client'

import { ProfileChip } from './ProfileChip'
import { useSendaStore } from '@/lib/store'
import type { Profile } from '@/lib/types'

const PROFILES: Profile[] = ['WHEELCHAIR', 'REDUCED_MOB', 'BLIND', 'LOW_VISION', 'DEAF_HOH', 'COGNITIVE']

export function ProfileSelector() {
  const selected = useSendaStore((state) => state.profiles)
  const toggleProfile = useSendaStore((state) => state.toggleProfile)

  return (
    <section className="panel p-5" aria-labelledby="profile-selector-title">
      <div className="mb-4">
        <h2 id="profile-selector-title" className="text-2xl font-bold">
          Perfil funcional
        </h2>
        <p className="mt-2 text-muted">Seleccion multiple. La ruta usa el peor caso entre perfiles activos.</p>
      </div>
      <div className="grid gap-3" role="group" aria-label="Perfiles funcionales">
        {PROFILES.map((profile) => (
          <ProfileChip key={profile} profile={profile} selected={selected.includes(profile)} onToggle={toggleProfile} />
        ))}
      </div>
    </section>
  )
}
