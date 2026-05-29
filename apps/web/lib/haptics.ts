export type HapticKind = 'caution' | 'block'

export const HAPTIC_PATTERNS: Record<HapticKind, number[]> = {
  caution: [80, 70, 80],
  block: [360]
}

export function vibratePattern(kind: HapticKind) {
  // Production calls the Vibration API with the selected safety pattern.
  return {
    supported: true,
    kind,
    pattern: HAPTIC_PATTERNS[kind]
  }
}
