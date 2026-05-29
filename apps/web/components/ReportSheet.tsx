'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { Locate, Send } from 'lucide-react'
import { CameraCapture } from './CameraCapture'
import { ClassificationResult } from './ClassificationResult'
import { submitReport } from '@/lib/api'
import { useSendaStore } from '@/lib/store'
import type { MapFeature, ReportKind } from '@/lib/types'

const SUBTIPOS: Record<ReportKind, Array<{ value: string; label: string }>> = {
  barrier: [
    { value: 'obstruction_temporary', label: 'Obstrucción temporal (carro, basura…)' },
    { value: 'obstruction_permanent', label: 'Obstrucción permanente (poste, árbol)' },
    { value: 'ramp_missing', label: 'Rampa faltante' },
    { value: 'ramp_defective', label: 'Rampa deficiente' },
    { value: 'step_curb', label: 'Escalón / borde' },
    { value: 'surface_broken', label: 'Superficie rota / cuarteada' },
    { value: 'tactile_missing', label: 'Sin guía podotáctil' },
    { value: 'aerial_obstacle', label: 'Obstáculo aéreo (rama, letrero bajo)' },
    { value: 'path_narrow', label: 'Paso muy angosto' },
  ],
  amenity: [
    { value: 'good_ramp', label: 'Rampa en buen estado' },
    { value: 'step_free_access', label: 'Acceso sin escalones' },
    { value: 'accessible_restroom', label: 'Baño accesible' },
    { value: 'rest_point', label: 'Banca / punto de descanso' },
    { value: 'tactile_present', label: 'Guía podotáctil presente' },
    { value: 'audio_signal_present', label: 'Señal de audio presente' },
    { value: 'accessible_business', label: 'Negocio accesible verificado' },
  ],
  transport: [
    { value: 'parada_camion', label: 'Parada de camión' },
    { value: 'parada_accesible', label: 'Parada accesible (rampa/piso bajo)' },
  ],
  crossing: [
    { value: 'crossing_unsafe', label: 'Cruce sin semáforo peatonal' },
    { value: 'crossing_no_audio', label: 'Semáforo sin audio' },
    { value: 'crossing_no_curb_ramp', label: 'Cruce sin rampas de esquina' },
  ],
}

type GpsStatus = 'idle' | 'loading' | 'ok' | 'error'

export function ReportSheet({ onSubmitted }: { onSubmitted?: (feature: MapFeature) => void } = {}) {
  const reportKind = useSendaStore((state) => state.reportKind)
  const addLiveFeature = useSendaStore((state) => state.addLiveFeature)

  const [subtipo, setSubtipo] = useState<string>(SUBTIPOS[reportKind][0].value)
  const [voiceText, setVoiceText] = useState('')
  const [lat, setLat] = useState('32.5331')
  const [lng, setLng] = useState('-117.0382')
  const [image, setImage] = useState<File | null>(null)
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle')

  const currentSubtipos = SUBTIPOS[reportKind]
  const resolvedSubtipo = currentSubtipos.some((s) => s.value === subtipo)
    ? subtipo
    : currentSubtipos[0].value

  const getGpsLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus('error')
      return
    }
    setGpsStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude.toFixed(6)))
        setLng(String(pos.coords.longitude.toFixed(6)))
        setGpsStatus('ok')
      },
      () => setGpsStatus('error'),
      { timeout: 8000, enableHighAccuracy: true }
    )
  }, [])

  // Por defecto, el reporte usa la ubicación GPS real para coords exactas.
  useEffect(() => {
    getGpsLocation()
  }, [getGpsLocation])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSending(true)
    try {
      const feature = await submitReport({
        image,
        voice_text: voiceText,
        lat: Number(lat),
        lng: Number(lng),
        kind: reportKind,
        subtipo: resolvedSubtipo,
      })
      addLiveFeature(feature)
      if (onSubmitted) {
        onSubmitted(feature)
      } else {
        setSent(true)
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <form className="panel space-y-4 p-5" onSubmit={submit} aria-label="Enviar reporte ciudadano">
      <div>
        <h1 className="text-3xl font-bold">Reporte ciudadano</h1>
        <p className="mt-1 text-muted">El reporte entra a la capa viva y puede recalcular rutas activas.</p>
      </div>

      <label className="grid gap-2 font-semibold">
        Tipo específico
        <select
          className="min-h-12 rounded-md border border-slate-300 bg-white px-3"
          value={resolvedSubtipo}
          onChange={(e) => setSubtipo(e.target.value)}
        >
          {currentSubtipos.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <CameraCapture onImage={setImage} />

      <label className="grid gap-2 font-semibold">
        Descripción (opcional)
        <textarea
          className="min-h-24 rounded-md border border-slate-300 bg-white p-3"
          value={voiceText}
          onChange={(e) => setVoiceText(e.target.value)}
          placeholder="Ej: hay un carro tapando la rampa en la esquina del Oxxo"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 font-semibold">
          Latitud
          <input
            className="min-h-12 rounded-md border border-slate-300 px-3"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
          />
        </label>
        <label className="grid gap-2 font-semibold">
          Longitud
          <input
            className="min-h-12 rounded-md border border-slate-300 px-3"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
          />
        </label>
      </div>

      <button
        type="button"
        onClick={getGpsLocation}
        disabled={gpsStatus === 'loading'}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white font-semibold hover:border-brand hover:text-brand disabled:opacity-60"
        aria-label="Usar mi ubicación GPS"
      >
        <Locate aria-hidden="true" size={18} />
        {gpsStatus === 'idle' && 'Usar mi ubicación GPS'}
        {gpsStatus === 'loading' && 'Obteniendo ubicación…'}
        {gpsStatus === 'ok' && 'Ubicación capturada ✓'}
        {gpsStatus === 'error' && 'GPS no disponible — edita coordenadas'}
      </button>

      <ClassificationResult
        label={`${currentSubtipos.find((s) => s.value === resolvedSubtipo)?.label ?? resolvedSubtipo}`}
      />

      <button type="submit" disabled={sending} className="btn-primary w-full">
        <Send aria-hidden="true" size={20} />
        {sending ? 'Enviando…' : 'Enviar reporte'}
      </button>

      {sent ? (
        <p className="rounded-md bg-green-50 p-3 font-semibold text-green-800" role="status">
          Reporte agregado a la capa viva. Si hay una ruta activa cercana, se recalculará automáticamente.
        </p>
      ) : null}
    </form>
  )
}
