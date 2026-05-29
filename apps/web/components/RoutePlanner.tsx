'use client'

import { FormEvent, useState } from 'react'
import { Accessibility, Brain, Ear, Eye, Glasses, LocateFixed, Navigation, PersonStanding, Search } from 'lucide-react'
import { useSendaStore } from '@/lib/store'
import type { Profile } from '@/lib/types'

const PROFILE_OPTIONS: Array<{ profile: Profile; label: string; short: string; icon: typeof Accessibility }> = [
  { profile: 'WHEELCHAIR', label: 'Silla de ruedas', short: 'Silla', icon: Accessibility },
  { profile: 'REDUCED_MOB', label: 'Movilidad reducida', short: 'Movilidad', icon: PersonStanding },
  { profile: 'BLIND', label: 'Ceguera', short: 'Ceguera', icon: Eye },
  { profile: 'LOW_VISION', label: 'Baja vision', short: 'Baja vision', icon: Glasses },
  { profile: 'DEAF_HOH', label: 'Sordera o hipoacusia', short: 'Audicion', icon: Ear },
  { profile: 'COGNITIVE', label: 'Cognicion', short: 'Cognicion', icon: Brain }
]

export function RoutePlanner() {
  const [origin, setOrigin] = useState('Mi ubicacion')
  const [destination, setDestination] = useState('Zona Rio')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showOrigin, setShowOrigin] = useState(false)
  const planRoute = useSendaStore((state) => state.planRoute)
  const profiles = useSendaStore((state) => state.profiles)
  const toggleProfile = useSendaStore((state) => state.toggleProfile)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      await planRoute(origin, destination)
    } catch (routeError) {
      setError(routeError instanceof Error ? routeError.message : 'No se pudo calcular la ruta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      className="space-y-2 rounded-[1.75rem] border border-white/80 bg-white/95 p-2.5 shadow-[0_14px_40px_rgba(15,23,42,0.24)] backdrop-blur"
      onSubmit={submit}
      aria-label="Planeador de ruta"
    >
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <label className="sr-only" htmlFor="route-destination">
            Destino
          </label>
          <div className="flex min-h-12 items-center gap-2 rounded-full bg-surface px-4">
            <Search aria-hidden="true" size={20} className="shrink-0 text-muted" />
            <input
              id="route-destination"
              className="min-h-12 min-w-0 flex-1 bg-transparent text-base font-semibold outline-none placeholder:text-muted"
              value={destination}
              placeholder="Buscar destino"
              onChange={(event) => setDestination(event.target.value)}
            />
          </div>
        </div>
        <button
          type="submit"
          className="touch-target inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-brand px-4 font-bold text-white shadow-[0_8px_20px_rgba(37,99,235,0.28)] transition hover:brightness-95 disabled:opacity-60"
          disabled={isLoading}
          aria-label={isLoading ? 'Buscando ruta' : 'Buscar ruta'}
        >
          <Navigation aria-hidden="true" size={19} />
          <span className="hidden sm:inline">{isLoading ? 'Buscando' : 'Buscar'}</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="touch-target inline-flex h-12 shrink-0 items-center gap-2 rounded-full px-3 text-sm font-semibold text-brand hover:bg-blue-50"
          aria-label={showOrigin ? 'Ocultar origen' : 'Editar origen'}
          aria-expanded={showOrigin}
          onClick={() => setShowOrigin((open) => !open)}
        >
          <LocateFixed aria-hidden="true" size={18} />
          <span>Origen</span>
        </button>
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-muted" aria-live="polite">
          {origin}
        </p>
      </div>

      {showOrigin ? (
        <div className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-2">
          <span className="grid h-11 w-11 place-items-center rounded-full text-brand" aria-hidden="true">
            <LocateFixed size={21} />
          </span>
          <label className="sr-only" htmlFor="route-origin">
            Origen
          </label>
          <input
            id="route-origin"
            className="min-h-11 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold outline-none placeholder:text-muted"
            value={origin}
            placeholder="Origen"
            onChange={(event) => setOrigin(event.target.value)}
          />
        </div>
      ) : null}

      <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Perfiles funcionales">
        {PROFILE_OPTIONS.map(({ profile, label, short, icon: Icon }) => {
          const selected = profiles.includes(profile)
          return (
            <button
              key={profile}
              type="button"
              className={`inline-flex h-12 min-w-12 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-bold transition ${
                selected ? 'border-brand bg-blue-50 text-brand' : 'border-slate-200 bg-white text-text hover:bg-surface'
              }`}
              aria-label={label}
              aria-pressed={selected}
              onClick={() => toggleProfile(profile)}
            >
              <Icon aria-hidden="true" size={17} />
              {short}
            </button>
          )
        })}
      </div>

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  )
}
