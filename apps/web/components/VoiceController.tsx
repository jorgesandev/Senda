'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import { createVoiceController } from '@/lib/voice'
import { useSendaStore } from '@/lib/store'

type ListenState = 'idle' | 'listening' | 'done' | 'error'

const voice = createVoiceController()

// Etiqueta de estado legible por lectores de pantalla
const STATE_LABELS: Record<ListenState, string> = {
  idle:      'Activar comando de voz',
  listening: 'Escuchando… habla ahora',
  done:      'Comando ejecutado',
  error:     'Error de reconocimiento'
}

interface Props {
  /** Renderiza el panel completo (mic + mute). false = solo muestra el botón mic compacto. */
  showPanel?: boolean
}

export function VoiceController({ showPanel = true }: Props) {
  const router = useRouter()
  const planRoute = useSendaStore((s) => s.planRoute)
  const setReportKind = useSendaStore((s) => s.setReportKind)
  const narratorMuted = useSendaStore((s) => s.a11yPrefs.narratorMuted)
  const setNarratorMuted = useSendaStore((s) => s.setNarratorMuted)

  const [listenState, setListenState] = useState<ListenState>('idle')
  const [lastTranscript, setLastTranscript] = useState('')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sincroniza el flag del singleton con el store
  useEffect(() => {
    voice.setMuted(narratorMuted)
  }, [narratorMuted])

  function resetAfter(ms = 2500) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setListenState('idle'), ms)
  }

  async function startListening() {
    if (listenState === 'listening') return
    setListenState('listening')
    setLastTranscript('')

    try {
      const command = await voice.listenOnce()
      setLastTranscript(command.transcript)
      setListenState('done')

      if (command.intent === 'plan_route' && command.destination) {
        voice.speak(`Buscando ruta a ${command.destination}`)
        await planRoute('Mi ubicacion', command.destination)
        // La narración del resultado la lanza RouteResultCard al montar
      } else if (command.intent === 'report_feature') {
        voice.speak('Abriendo reporte de barrera')
        setReportKind('barrier')
        router.push('/report')
      } else if (command.intent === 'open_map') {
        voice.speak('Abriendo el mapa')
        router.push('/map')
      } else if (command.destination) {
        // intent plan_route sin suficiente confianza: confirmar igualmente
        voice.speak(`Buscando ruta a ${command.destination}`)
        await planRoute('Mi ubicacion', command.destination)
      }

      resetAfter(2500)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setLastTranscript(message)
      setListenState('error')
      resetAfter(3000)
    }
  }

  const isListening = listenState === 'listening'
  const btnLabel = STATE_LABELS[listenState]

  if (!showPanel) {
    // Versión compacta: solo el botón mic flotante
    return (
      <button
        type="button"
        onClick={startListening}
        aria-label={btnLabel}
        aria-pressed={isListening}
        className={`touch-target grid h-14 w-14 place-items-center rounded-full shadow-[0_8px_24px_rgba(15,23,42,0.22)] transition focus-visible:outline ${
          isListening
            ? 'animate-pulse bg-red-500 text-white'
            : 'bg-white text-brand hover:bg-surface'
        }`}
      >
        {isListening ? <MicOff aria-hidden="true" size={24} /> : <Mic aria-hidden="true" size={24} />}
      </button>
    )
  }

  return (
    <section className="panel space-y-3 p-4" aria-labelledby="voice-panel-title">
      <h2 id="voice-panel-title" className="text-xl font-bold">
        Control por voz
      </h2>

      <div className="flex flex-wrap gap-2">
        {/* Botón mic principal */}
        <button
          type="button"
          onClick={startListening}
          aria-label={btnLabel}
          aria-pressed={isListening}
          className={`btn-secondary ${isListening ? 'animate-pulse border-red-400 bg-red-50 text-red-600' : ''}`}
        >
          {isListening ? (
            <MicOff aria-hidden="true" size={20} />
          ) : (
            <Mic aria-hidden="true" size={20} />
          )}
          {isListening ? 'Escuchando…' : 'Comando de voz'}
        </button>

        {/* Toggle mute narrador */}
        <button
          type="button"
          onClick={() => setNarratorMuted(!narratorMuted)}
          aria-label={narratorMuted ? 'Activar narrador' : 'Silenciar narrador'}
          aria-pressed={narratorMuted}
          className="btn-secondary"
        >
          {narratorMuted ? (
            <VolumeX aria-hidden="true" size={20} />
          ) : (
            <Volume2 aria-hidden="true" size={20} />
          )}
          {narratorMuted ? 'Narrador off' : 'Narrador on'}
        </button>
      </div>

      {/* Feedback visual del último comando */}
      {lastTranscript ? (
        <p
          className={`rounded-md px-3 py-2 text-sm font-semibold ${
            listenState === 'error'
              ? 'border border-red-200 bg-red-50 text-red-700'
              : 'border border-slate-200 bg-surface text-text'
          }`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {listenState === 'error' ? '⚠ ' : ''}
          {lastTranscript}
        </p>
      ) : (
        <p className="text-sm text-muted" aria-live="polite">
          {isListening ? 'Escuchando comando…' : 'Di "buscar ruta a…" o "reportar barrera"'}
        </p>
      )}
    </section>
  )
}
