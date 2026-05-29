'use client'

import Link from 'next/link'
import { LocateFixed, Plus, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { AccessibilityControls } from './AccessibilityControls'
import { VoiceController } from './VoiceController'

type LocateState = 'idle' | 'loading' | 'ok' | 'error'

function controlButtonClass(active = false) {
  return `touch-target grid h-14 w-14 place-items-center rounded-full border shadow-[0_10px_26px_rgba(15,23,42,0.24)] transition focus-visible:outline ${
    active
      ? 'border-brand bg-blue-50 text-brand'
      : 'border-white/80 bg-white/95 text-text hover:bg-surface'
  }`
}

const reportButtonClass =
  'touch-target grid h-14 w-14 place-items-center rounded-full border border-brand bg-brand text-white shadow-[0_10px_26px_rgba(15,23,42,0.24)] transition hover:brightness-95 focus-visible:outline'

export function MapFloatingControls() {
  const [locateState, setLocateState] = useState<LocateState>('idle')
  const [showA11y, setShowA11y] = useState(false)

  function centerOnUser() {
    if (!navigator.geolocation) {
      setLocateState('error')
      return
    }

    setLocateState('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        window.dispatchEvent(
          new CustomEvent('senda:center-map', {
            detail: {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            }
          })
        )
        setLocateState('ok')
      },
      () => setLocateState('error'),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 3000 }
    )
  }

  return (
    <div className="relative flex items-center gap-2 md:flex-col" aria-label="Controles del mapa">
      <button
        type="button"
        className={controlButtonClass(locateState === 'loading' || locateState === 'ok')}
        aria-label={
          locateState === 'loading'
            ? 'Buscando mi ubicación'
            : locateState === 'error'
              ? 'No se pudo obtener mi ubicación'
              : 'Centrar mapa en mi ubicación'
        }
        onClick={centerOnUser}
      >
        <LocateFixed aria-hidden="true" size={23} className={locateState === 'loading' ? 'animate-pulse' : ''} />
      </button>

      <VoiceController
        showPanel={false}
        className="!h-14 !w-14 border border-white/80 shadow-[0_10px_26px_rgba(15,23,42,0.24)]"
      />

      <Link href="/report" className={reportButtonClass} aria-label="Reportar barrera">
        <Plus aria-hidden="true" size={24} />
      </Link>

      <button
        type="button"
        className={controlButtonClass(showA11y)}
        aria-label={showA11y ? 'Ocultar controles de accesibilidad' : 'Mostrar controles de accesibilidad'}
        aria-expanded={showA11y}
        aria-pressed={showA11y}
        onClick={() => setShowA11y((open) => !open)}
      >
        <SlidersHorizontal aria-hidden="true" size={22} />
      </button>

      {showA11y ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(88vw,360px)] rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_48px_rgba(15,23,42,0.28)] md:bottom-0 md:right-full md:top-auto md:mr-2 md:mt-0">
          <AccessibilityControls />
        </div>
      ) : null}

      <p className="sr-only" role="status" aria-live="polite">
        {locateState === 'loading' && 'Buscando ubicación actual'}
        {locateState === 'ok' && 'Mapa centrado en tu ubicación'}
        {locateState === 'error' && 'No se pudo obtener tu ubicación'}
      </p>
    </div>
  )
}
