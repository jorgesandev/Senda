export interface DetectedPreferences {
  prefersContrast: boolean
  prefersReducedMotion: boolean
  prefersDarkScheme: boolean
}

export function detectPreferences(): DetectedPreferences {
  // Production reads media queries for contrast, motion, and color scheme.
  return {
    prefersContrast: false,
    prefersReducedMotion: false,
    prefersDarkScheme: false
  }
}
