'use client'

import { useEffect } from 'react'
import { Bus, CircleCheck, Footprints, TriangleAlert, X } from 'lucide-react'
import { featureColor } from '@/lib/map'
import { resolveEffect } from '@/lib/matrix'
import { useSendaStore } from '@/lib/store'
import type { MapFeature } from '@/lib/types'

const KIND_ICON = {
  barrier: TriangleAlert,
  amenity: CircleCheck,
  transport: Bus,
  crossing: Footprints
}

const KIND_LABEL: Record<MapFeature['kind'], string> = {
  barrier: 'Barrera',
  amenity: 'Amenidad',
  transport: 'Transporte',
  crossing: 'Cruce peatonal'
}

const SUBTIPO_LABEL: Record<string, string> = {
  // barreras
  obstruction_temporary: 'Obstrucción temporal',
  obstruction_permanent: 'Obstrucción permanente',
  ramp_missing: 'Rampa faltante',
  ramp_defective: 'Rampa deficiente',
  step_curb: 'Escalón / borde',
  stairs: 'Escaleras',
  surface_broken: 'Superficie rota',
  surface_unpaved: 'Sin pavimentar',
  surface_loose: 'Superficie suelta (grava)',
  surface_slippery: 'Superficie resbalosa',
  tactile_missing: 'Sin guía podotáctil',
  aerial_obstacle: 'Obstáculo aéreo',
  path_narrow: 'Paso muy angosto',
  steep_grade: 'Pendiente pronunciada',
  signage_poor: 'Señalización deficiente',
  sensory_chaos: 'Caos sensorial',
  // amenidades
  good_ramp: 'Rampa en buen estado',
  step_free_access: 'Acceso sin escalones',
  accessible_restroom: 'Baño accesible',
  rest_point: 'Punto de descanso',
  tactile_present: 'Guía podotáctil',
  audio_signal_present: 'Señal de audio',
  accessible_business: 'Negocio accesible verificado',
  elevator: 'Elevador',
  accessible_parking: 'Estacionamiento accesible',
  shade_water: 'Sombra y agua'
}

const EFFECT_INFO: Record<string, { label: string; cls: string }> = {
  B: { label: 'Bloqueo para tus perfiles', cls: 'bg-red-50 text-red-700 border-red-200' },
  D: { label: 'Difícil para tus perfiles', cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  L: { label: 'Leve para tus perfiles', cls: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  CLAVE: { label: 'Clave para ti', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  UTIL: { label: 'Útil para ti', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  '·': { label: 'Sin efecto para tus perfiles', cls: 'bg-slate-100 text-slate-600 border-slate-200' }
}

function attrLabel(key: string): string {
  return (
    {
      grado_pct: 'Pendiente',
      ancho_cm: 'Ancho',
      altura_cm: 'Altura'
    }[key] ?? key
  )
}

function attrValue(key: string, value: unknown): string {
  if (key === 'grado_pct') return `${value}%`
  if (key === 'ancho_cm' || key === 'altura_cm') return `${value} cm`
  return String(value)
}

const FEATURE_FLAGS: Record<string, string> = {
  semaforo_peatonal: 'Semáforo peatonal',
  tiene_audio: 'Audio',
  tiene_podotactil: 'Podotáctil',
  rampas_esquina: 'Rampas de esquina',
  has_ramp: 'Rampa',
  low_floor: 'Piso bajo',
  wheelchair_space: 'Espacio silla',
  audio_announcements: 'Anuncios de audio',
  visual_announcements: 'Anuncios visuales',
  priority_seat: 'Asiento prioritario',
  braille: 'Braille'
}

export function FeatureDetailSheet({ feature, onClose }: { feature: MapFeature; onClose: () => void }) {
  const profiles = useSendaStore((s) => s.profiles)
  const Icon = KIND_ICON[feature.kind]
  const color = featureColor(feature, profiles)
  const effect = resolveEffect(profiles, feature)
  const effectInfo = EFFECT_INFO[effect] ?? EFFECT_INFO['·']

  const attrs = feature.atributos as Record<string, unknown>
  const nombre = typeof attrs.nombre === 'string' ? attrs.nombre : null
  const descripcion = typeof attrs.descripcion === 'string' ? attrs.descripcion : null
  const accessFeatures =
    attrs.accessibility_features && typeof attrs.accessibility_features === 'object'
      ? (attrs.accessibility_features as Record<string, unknown>)
      : null
  const numericAttrs = Object.entries(attrs).filter(([k]) => ['grado_pct', 'ancho_cm', 'altura_cm'].includes(k))

  // Flags booleanos (cruces y transporte)
  const flagEntries = Object.entries(accessFeatures ?? attrs).filter(
    ([k, v]) => k in FEATURE_FLAGS && typeof v === 'boolean'
  ) as Array<[string, boolean]>

  const title =
    feature.kind === 'transport' || feature.kind === 'crossing'
      ? nombre ?? KIND_LABEL[feature.kind]
      : SUBTIPO_LABEL[feature.subtipo] ?? feature.subtipo.replaceAll('_', ' ')

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[55] mx-auto w-full max-w-md p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
      role="dialog"
      aria-modal="false"
      aria-labelledby="feature-detail-title"
    >
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.28)]">
        <div className="flex items-start justify-between gap-3 p-4 pb-2">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full"
              style={{ backgroundColor: `${color}22` }}
            >
              <Icon aria-hidden="true" size={24} color={color} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                {KIND_LABEL[feature.kind]}
              </p>
              <h2 id="feature-detail-title" className="truncate text-lg font-bold leading-tight">
                {title}
              </h2>
              {nombre && title !== nombre ? <p className="truncate text-sm text-muted">{nombre}</p> : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="touch-target grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-300 bg-white text-text hover:bg-surface"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>

        <div className="space-y-3 px-4 pb-4">
          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold ${effectInfo.cls}`}>
            {effectInfo.label}
          </span>

          {feature.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={feature.photo_url}
              alt={`Foto de ${title}`}
              className="max-h-56 w-full rounded-xl border border-slate-200 object-cover"
            />
          ) : null}

          {descripcion ? <p className="text-sm leading-6 text-text">{descripcion}</p> : null}

          {numericAttrs.length > 0 ? (
            <dl className="flex flex-wrap gap-2">
              {numericAttrs.map(([k, v]) => (
                <div key={k} className="rounded-xl bg-surface px-3 py-1.5">
                  <dt className="text-xs font-semibold text-muted">{attrLabel(k)}</dt>
                  <dd className="font-bold">{attrValue(k, v)}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {flagEntries.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5" aria-label="Características de accesibilidad">
              {flagEntries.map(([k, v]) => (
                <li
                  key={k}
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                    v ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'
                  }`}
                >
                  {v ? '✓' : '✗'} {FEATURE_FLAGS[k]}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <span>{feature.source === 'ciudadano' ? '👤 Reporte ciudadano' : '🛰️ Detección automática'}</span>
            <span>·</span>
            <span>Estado: {feature.status}</span>
            {feature.upvotes > 0 ? (
              <>
                <span>·</span>
                <span>{feature.upvotes} votos</span>
              </>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  )
}
