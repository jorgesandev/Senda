export interface VoiceCommand {
  intent: 'plan_route' | 'report_feature' | 'open_map'
  transcript: string
  confidence: number
}

export interface SpeechResult {
  spoken: boolean
  message: string
}

export function createVoiceController() {
  return {
    async listenOnce(): Promise<VoiceCommand> {
      // Production wraps Web Speech recognition and maps transcripts to app commands.
      return {
        intent: 'plan_route',
        transcript: 'llevarme a zona rio por ruta accesible',
        confidence: 0.82
      }
    },
    speak(message: string): SpeechResult {
      // Production uses speechSynthesis to narrate screen state and route steps.
      return { spoken: true, message }
    }
  }
}
