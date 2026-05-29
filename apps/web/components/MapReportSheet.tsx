'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { KindSelector } from './KindSelector'
import { ReportSheet } from './ReportSheet'

interface MapReportSheetProps {
  open: boolean
  onClose: () => void
}

export function MapReportSheet({ open, onClose }: MapReportSheetProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) return

    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60]" role="presentation">
      <button
        type="button"
        className="absolute inset-0 h-full w-full bg-slate-950/55"
        aria-label="Cerrar reporte"
        onClick={onClose}
      />

      <section
        className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-3xl bg-white p-3 shadow-[0_-22px_60px_rgba(15,23,42,0.34)] md:bottom-6 md:left-1/2 md:right-auto md:w-[min(920px,calc(100vw-3rem))] md:-translate-x-1/2 md:rounded-2xl md:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="map-report-title"
      >
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand">Capa viva</p>
            <h2 id="map-report-title" className="text-2xl font-bold">
              Reportar en este mapa
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="touch-target grid h-12 w-12 place-items-center rounded-full border border-slate-300 bg-white text-text hover:bg-surface"
            aria-label="Cerrar reporte"
            onClick={onClose}
          >
            <X aria-hidden="true" size={22} />
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-[300px_minmax(0,1fr)]">
          <KindSelector />
          <ReportSheet />
        </div>
      </section>
    </div>
  )
}
