'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, X } from 'lucide-react'
import { KindSelector } from './KindSelector'
import { ReportSheet } from './ReportSheet'
import { deleteReport } from '@/lib/api'
import { useSendaStore } from '@/lib/store'
import type { MapFeature } from '@/lib/types'

interface MapReportSheetProps {
  open: boolean
  onClose: () => void
}

export function MapReportSheet({ open, onClose }: MapReportSheetProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const removeLiveFeature = useSendaStore((state) => state.removeLiveFeature)
  const [submitted, setSubmitted] = useState<MapFeature | null>(null)
  const [undoing, setUndoing] = useState(false)

  // Cada vez que se abre, arranca limpio (sin pantalla de éxito previa).
  useEffect(() => {
    if (open) setSubmitted(null)
  }, [open])

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

  function handleOk() {
    setSubmitted(null)
    onClose()
  }

  async function handleUndo() {
    if (!submitted) return
    setUndoing(true)
    removeLiveFeature(submitted.id)
    try {
      await deleteReport(submitted.id)
    } catch {
      // si falla el borrado remoto, igual lo quitamos del mapa local
    } finally {
      setUndoing(false)
      setSubmitted(null)
      onClose()
    }
  }

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
              {submitted ? 'Reporte generado' : 'Reportar en este mapa'}
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

        {submitted ? (
          <div className="px-2 py-8 text-center" role="status" aria-live="polite">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100">
              <Check aria-hidden="true" size={36} className="text-emerald-600" />
            </div>
            <h3 className="mt-4 text-xl font-bold">¡Reporte generado!</h3>
            <p className="mx-auto mt-2 max-w-md text-muted">
              Tu reporte entró a la capa viva y ya aparece en el mapa. Si hay una ruta activa cercana, se recalculará automáticamente.
            </p>
            <div className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row-reverse">
              <button type="button" className="btn-primary flex-1" onClick={handleOk} disabled={undoing}>
                OK
              </button>
              <button
                type="button"
                className="touch-target inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-red-300 bg-white px-4 font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                onClick={handleUndo}
                disabled={undoing}
              >
                {undoing ? 'Deshaciendo…' : 'Cancelar (deshacer)'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-[300px_minmax(0,1fr)]">
            <KindSelector />
            <ReportSheet onSubmitted={setSubmitted} />
          </div>
        )}
      </section>
    </div>
  )
}
