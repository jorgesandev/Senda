'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { Accessibility, Brain, Ear, Eye, Glasses, LocateFixed, Menu, Mic, Navigation, PersonStanding, Search } from 'lucide-react'
import { AccessibilityControls } from './AccessibilityControls'
import { createVoiceController } from '@/lib/voice'
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

const voice = createVoiceController()

export function RoutePlanner() {
  const [origin, setOrigin] = useState('Mi ubicacion')
  const [destination, setDestination] = useState('Zona Rio')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
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

  async function fillDestinationByVoice() {
    const command = await voice.listenOnce()
    const match = command.transcript.match(/(?:a|hacia)\s+(.+?)(?:\s+por|\s+en|$)/i)
    setDestination(match?.[1] ?? command.transcript)
  }

  return (
    <form className="space-y-3 rounded-lg bg-white p-3 shadow-[0_10px_35px_rgba(15,23,42,0.24)]" onSubmit={submit} aria-label="Planeador de ruta">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-text hover:bg-surface"
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Menu aria-hidden="true" size={22} />
        </button>
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
            <button type="button" className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-brand hover:bg-white" aria-label="Buscar por voz" onClick={fillDestinationByVoice}>
              <Mic aria-hidden="true" size={20} />
            </button>
          </div>
        </div>
      </div>

      {menuOpen ? (
        <div className="rounded-md border border-slate-200 bg-white p-3 shadow-panel">
          <nav className="grid grid-cols-3 gap-2 text-sm font-bold" aria-label="Menu de mapa">
            <Link href="/" className="rounded-md bg-surface px-3 py-2 text-center">
              Inicio
            </Link>
            <Link href="/report" className="rounded-md bg-surface px-3 py-2 text-center">
              Reportar
            </Link>
            <Link href="/gov" className="rounded-md bg-surface px-3 py-2 text-center">
              Gobierno
            </Link>
          </nav>
          <div className="mt-3">
            <AccessibilityControls />
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-2">
        <button type="button" className="grid h-11 w-11 place-items-center rounded-full text-brand hover:bg-blue-50" aria-label="Usar ubicacion actual">
          <LocateFixed aria-hidden="true" size={21} />
        </button>
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

      <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Perfiles funcionales">
        {PROFILE_OPTIONS.map(({ profile, label, short, icon: Icon }) => {
          const selected = profiles.includes(profile)
          return (
            <button
              key={profile}
              type="button"
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-3 text-sm font-bold transition ${
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
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" className="btn-primary w-full rounded-full" disabled={isLoading}>
        <Navigation aria-hidden="true" size={20} />
        {isLoading ? 'Buscando' : 'Buscar ruta'}
      </button>
    </form>
  )
}
