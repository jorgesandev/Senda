'use client'

import { FormEvent, useState } from 'react'
import { Send } from 'lucide-react'
import { CameraCapture } from './CameraCapture'
import { ClassificationResult } from './ClassificationResult'
import { submitReport } from '@/lib/api'
import { useSendaStore } from '@/lib/store'
import type { ReportKind } from '@/lib/types'

export function ReportSheet() {
  const [kind, setKind] = useState<ReportKind>('barrier')
  const [voiceText, setVoiceText] = useState('Carro tapando una rampa en la esquina')
  const [lat, setLat] = useState('32.5331')
  const [lng, setLng] = useState('-117.0382')
  const [image, setImage] = useState<File | null>(null)
  const [sent, setSent] = useState(false)
  const addLiveFeature = useSendaStore((state) => state.addLiveFeature)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const feature = await submitReport({
      image,
      voice_text: voiceText,
      lat: Number(lat),
      lng: Number(lng),
      kind
    })
    addLiveFeature(feature)
    setSent(true)
  }

  return (
    <form className="panel space-y-4 p-5" onSubmit={submit} aria-label="Enviar reporte ciudadano">
      <div>
        <h1 className="text-3xl font-bold">Reporte ciudadano</h1>
        <p className="mt-1 text-muted">El reporte mock entra a la capa viva local.</p>
      </div>
      <label className="grid gap-2 font-semibold">
        Kind
        <select
          className="min-h-12 rounded-md border border-slate-300 bg-white px-3"
          value={kind}
          onChange={(event) => setKind(event.target.value as ReportKind)}
        >
          <option value="barrier">Barrera</option>
          <option value="amenity">Amenidad</option>
          <option value="transport">Transporte</option>
          <option value="crossing">Cruce</option>
        </select>
      </label>
      <CameraCapture onImage={setImage} />
      <label className="grid gap-2 font-semibold">
        Voz o descripcion
        <textarea
          className="min-h-28 rounded-md border border-slate-300 bg-white p-3"
          value={voiceText}
          onChange={(event) => setVoiceText(event.target.value)}
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 font-semibold">
          Latitud
          <input className="min-h-12 rounded-md border border-slate-300 px-3" value={lat} onChange={(event) => setLat(event.target.value)} />
        </label>
        <label className="grid gap-2 font-semibold">
          Longitud
          <input className="min-h-12 rounded-md border border-slate-300 px-3" value={lng} onChange={(event) => setLng(event.target.value)} />
        </label>
      </div>
      <ClassificationResult label={kind === 'barrier' ? 'obstruction_temporary con confianza mock 76%' : 'accessible_business con confianza mock 76%'} />
      <button type="submit" className="btn-primary w-full">
        <Send aria-hidden="true" size={20} />
        Enviar reporte
      </button>
      {sent ? <p className="rounded-md bg-green-50 p-3 font-semibold text-green-800">Reporte agregado a la capa viva.</p> : null}
    </form>
  )
}
