'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { Accessibility, Brain, Ear, Eye, Glasses, LocateFixed, MapPin, Navigation, PersonStanding, Search, X } from 'lucide-react'
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

function formatDistance(meters: number): string {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`
}

export function RoutePlanner() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [origin, setOrigin] = useState('Mi ubicacion')
  const [destination, setDestination] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const destinationInputRef = useRef<HTMLInputElement>(null)

  const calculatePreview = useSendaStore((state) => state.calculatePreview)
  const commitRoute = useSendaStore((state) => state.commitRoute)
  const clearPreview = useSendaStore((state) => state.clearPreview)
  const previewRoute = useSendaStore((state) => state.previewRoute)
  const activeRoute = useSendaStore((state) => state.activeRoute)
  const activeDestination = useSendaStore((state) => state.activeDestination)
  const hasStartedRoute = useSendaStore((state) => state.hasStartedRoute)
  const profiles = useSendaStore((state) => state.profiles)
  const toggleProfile = useSendaStore((state) => state.toggleProfile)

  // Si hay una ruta activa previa, mostrar su destino en el input
  useEffect(() => {
    if (activeDestination && !destination && !previewRoute) {
      setDestination(activeDestination)
    }
  }, [activeDestination, destination, previewRoute])

  const currentRoute = previewRoute || activeRoute
  const showRouteInfo = !!previewRoute && !hasStartedRoute
  const isRouted = !!currentRoute && !hasStartedRoute

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!destination.trim()) {
      setError('Ingresa un destino')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      if (isRouted) {
        commitRoute()
      } else {
        await calculatePreview(origin, destination)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo calcular la ruta')
    } finally {
      setIsLoading(false)
    }
  }

  function handleExpand() {
    setIsExpanded(true)
    // Enfocar destino al expandir para que el usuario siga escribiendo
    setTimeout(() => destinationInputRef.current?.focus(), 50)
  }

  function handleClearDestination() {
    setDestination('')
    destinationInputRef.current?.focus()
  }

  function handleClose() {
    setIsExpanded(false)
    if (!hasStartedRoute) {
      clearPreview()
    }
  }

  return (
    <form
      className="space-y-2 rounded-[1.75rem] border border-white/80 bg-white/95 p-2.5 shadow-[0_14px_40px_rgba(15,23,42,0.24)] backdrop-blur"
      onSubmit={handleSubmit}
      aria-label="Planeador de ruta"
    >
      {!isExpanded ? (
        // Estado colapsado: solo input de destino
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <label className="sr-only" htmlFor="route-destination-collapsed">
              Destino
            </label>
            <div className="flex min-h-12 items-center gap-2 rounded-full bg-surface px-4">
              <Search aria-hidden="true" size={20} className="shrink-0 text-muted" />
              <input
                id="route-destination-collapsed"
                className="min-h-12 min-w-0 flex-1 bg-transparent text-base font-semibold outline-none placeholder:text-muted"
                value={destination}
                placeholder="Buscar destino"
                onChange={(event) => setDestination(event.target.value)}
                onFocus={handleExpand}
              />
              {destination ? (
                <button
                  type="button"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition hover:bg-slate-200"
                  aria-label="Borrar destino"
                  onClick={handleClearDestination}
                >
                  <X aria-hidden="true" size={16} />
                </button>
              ) : null}
            </div>
          </div>
          <button
            type="submit"
            className="touch-target inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-brand px-4 font-bold text-white shadow-[0_8px_20px_rgba(37,99,235,0.28)] transition hover:brightness-95 disabled:opacity-60"
            disabled={isLoading}
            aria-label="Buscar ruta"
          >
            <Navigation aria-hidden="true" size={19} />
            <span className="hidden sm:inline">Buscar</span>
          </button>
        </div>
      ) : (
        // Estado expandido: origen + destino apilados
        <div className="space-y-2">
          {/* Header con título y botón cerrar */}
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-bold text-text">Planear ruta</span>
            <button
              type="button"
              className="touch-target grid h-10 w-10 place-items-center rounded-full text-muted transition hover:bg-surface"
              aria-label="Cerrar"
              onClick={handleClose}
            >
              <X aria-hidden="true" size={20} />
            </button>
          </div>

          {/* Origen */}
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600">
              <LocateFixed aria-hidden="true" size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <label className="sr-only" htmlFor="route-origin">
                Origen
              </label>
              <input
                id="route-origin"
                className="min-h-11 w-full rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold outline-none placeholder:text-muted"
                value={origin}
                placeholder="Origen"
                onChange={(event) => setOrigin(event.target.value)}
              />
            </div>
          </div>

          {/* Destino */}
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-red-100 text-red-600">
              <MapPin aria-hidden="true" size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <label className="sr-only" htmlFor="route-destination">
                Destino
              </label>
              <div className="flex items-center rounded-full border border-slate-200 bg-white px-4">
                <input
                  id="route-destination"
                  ref={destinationInputRef}
                  className="min-h-11 min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-muted"
                  value={destination}
                  placeholder="Buscar destino"
                  onChange={(event) => setDestination(event.target.value)}
                />
                {destination ? (
                  <button
                    type="button"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition hover:bg-slate-200"
                    aria-label="Borrar destino"
                    onClick={handleClearDestination}
                  >
                    <X aria-hidden="true" size={16} />
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Info del viaje (preview) */}
          {showRouteInfo ? (
            <div className="rounded-2xl bg-surface p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-text">
                    {formatDistance(previewRoute.distance_m)}
                  </span>
                  <span className="text-sm font-semibold text-muted">
                    {previewRoute.eta_min} min
                  </span>
                  {previewRoute.features_evitadas.length > 0 && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                      {previewRoute.features_evitadas.length} barrera{previewRoute.features_evitadas.length !== 1 ? 's' : ''} evitada{previewRoute.features_evitadas.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {/* Botón de acción principal */}
          <button
            type="submit"
            className="touch-target inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand px-4 font-bold text-white shadow-[0_8px_20px_rgba(37,99,235,0.28)] transition hover:brightness-95 disabled:opacity-60"
            disabled={isLoading}
            aria-label={isLoading ? 'Buscando ruta' : isRouted ? 'Iniciar ruta' : 'Buscar ruta'}
          >
            <Navigation aria-hidden="true" size={19} />
            <span>{isLoading ? 'Buscando...' : isRouted ? 'Iniciar' : 'Buscar'}</span>
          </button>
        </div>
      )}

      {/* Perfiles funcionales - siempre visibles */}
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
