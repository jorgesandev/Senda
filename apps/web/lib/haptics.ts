export type HapticKind = 'caution' | 'block'

export const HAPTIC_PATTERNS: Record<HapticKind, number[]> = {
  caution: [80, 70, 80],  // doble-pulso corto: "precaución"
  block:   [360]          // pulso largo: "bloqueado / desvío"
}

export interface HapticResult {
  supported: boolean
  kind: HapticKind
  pattern: number[]
}

export function isHapticsSupported(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator
}

export function vibratePattern(kind: HapticKind): HapticResult {
  const pattern = HAPTIC_PATTERNS[kind]
  const supported = isHapticsSupported()
  if (supported) {
    navigator.vibrate(pattern)
  }
  return { supported, kind, pattern }
}

export function cancelVibration() {
  if (isHapticsSupported()) {
    navigator.vibrate(0)
  }
}
