'use client'

import { useState } from 'react'
import { Mic, Volume2 } from 'lucide-react'
import { createVoiceController, type VoiceCommand } from '@/lib/voice'

const voice = createVoiceController()

export function VoiceController() {
  const [command, setCommand] = useState<VoiceCommand | null>(null)
  const [spoken, setSpoken] = useState<string>('Narrador listo')

  async function listen() {
    const nextCommand = await voice.listenOnce()
    setCommand(nextCommand)
  }

  function narrate() {
    const result = voice.speak('Ruta accesible encontrada. Avanza hacia Avenida Revolucion.')
    setSpoken(result.message)
  }

  return (
    <section className="panel space-y-3 p-4" aria-labelledby="voice-title">
      <h2 id="voice-title" className="text-xl font-bold">
        Voz y narrador
      </h2>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-secondary" onClick={listen}>
          <Mic aria-hidden="true" size={20} />
          Escuchar
        </button>
        <button type="button" className="btn-secondary" onClick={narrate}>
          <Volume2 aria-hidden="true" size={20} />
          Narrar
        </button>
      </div>
      <p className="text-sm text-muted">{command ? command.transcript : 'Sin comando activo'}</p>
      <p className="text-sm text-muted">{spoken}</p>
    </section>
  )
}
