export interface DetectedPreferences {
  prefersContrast: boolean
  prefersReducedMotion: boolean
  prefersDarkScheme: boolean
}

export function detectPreferences(): DetectedPreferences {
  if (typeof window === 'undefined') {
    return { prefersContrast: false, prefersReducedMotion: false, prefersDarkScheme: false }
  }
  return {
    prefersContrast:
      window.matchMedia('(prefers-contrast: more)').matches ||
      window.matchMedia('(forced-colors: active)').matches,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    prefersDarkScheme: window.matchMedia('(prefers-color-scheme: dark)').matches
  }
}
