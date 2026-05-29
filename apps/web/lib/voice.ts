export interface VoiceCommand {
  intent: 'plan_route' | 'report_feature' | 'open_map'
  transcript: string
  confidence: number
  destination?: string
}

export interface SpeechResult {
  spoken: boolean
  message: string
}

// Singleton muted flag — compartido entre todas las instancias de createVoiceController()
let _muted = false

function parseCommand(transcript: string, confidence: number): VoiceCommand {
  const t = transcript.toLowerCase().trim()

  // "buscar ruta a X", "llevarme a X", "llévame a X", "navegar a X", "ir a X", "cómo llego a X"
  const routeMatch =
    /(?:buscar ruta a|llevarme a|ll[eé]vame a|navegar a|ir a|quiero ir a|c[oó]mo llego a|ruta a)\s+(.+)/i.exec(t)
  if (routeMatch) {
    const destination = routeMatch[1]
      .replace(/\s+(?:por ruta accesible|ruta accesible|por favor|gracias)$/i, '')
      .trim()
    return { intent: 'plan_route', transcript, confidence, destination }
  }

  // "reportar barrera", "hay una barrera", "reportar obstáculo"
  if (/\b(?:reportar|barrera|obst[áa]culo|hay un[ao]?\s|problema|escalón|rampa rota)\b/.test(t)) {
    return { intent: 'report_feature', transcript, confidence }
  }

  // "abrir mapa", "ver mapa"
  if (/\b(?:mapa|abrir mapa|ver mapa)\b/.test(t)) {
    return { intent: 'open_map', transcript, confidence }
  }

  // Fallback: interpretar como destino con confianza reducida
  return { intent: 'plan_route', transcript, confidence: confidence * 0.6, destination: transcript }
}

export function createVoiceController() {
  return {
    get isMuted() {
      return _muted
    },

    setMuted(muted: boolean) {
      _muted = muted
    },

    isSupported(): boolean {
      if (typeof window === 'undefined') return false
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any
      return !!(w.SpeechRecognition ?? w.webkitSpeechRecognition)
    },

    listenOnce(): Promise<VoiceCommand> {
      return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
          reject(new Error('Reconocimiento de voz no disponible en servidor'))
          return
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any
        const RecognitionClass: (new () => any) | undefined =
          w.SpeechRecognition ?? w.webkitSpeechRecognition

        if (!RecognitionClass) {
          reject(new Error('Reconocimiento de voz no disponible en este navegador'))
          return
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recognition: any = new RecognitionClass()
        recognition.lang = 'es-MX'
        recognition.interimResults = false
        recognition.maxAlternatives = 1
        recognition.continuous = false

        let resolved = false

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          const first = event.results?.[0]?.[0]
          if (first && !resolved) {
            resolved = true
            resolve(parseCommand(first.transcript as string, first.confidence as number))
          }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (event: any) => {
          if (!resolved) {
            resolved = true
            reject(new Error((event.error as string) ?? 'error de reconocimiento'))
          }
        }

        recognition.start()
      })
    },

    speak(message: string): SpeechResult {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        return { spoken: false, message }
      }
      if (_muted) return { spoken: false, message }

      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.lang = 'es-MX'
      utterance.rate = 0.92
      utterance.pitch = 1.0

      // Prefiere voz es-MX, cae a cualquier voz española
      const voices = window.speechSynthesis.getVoices()
      const preferred =
        voices.find((v) => v.lang === 'es-MX') ??
        voices.find((v) => v.lang.startsWith('es')) ??
        null
      if (preferred) utterance.voice = preferred

      window.speechSynthesis.speak(utterance)
      return { spoken: true, message }
    },

    cancel() {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }
}
