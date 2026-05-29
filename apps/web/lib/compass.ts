export interface CompassReading {
  headingDeg: number
  accuracy: 'mock' | 'low' | 'medium' | 'high'
}

export function getCompassReading(): CompassReading {
  // Production wraps DeviceOrientation events for non-visual route guidance.
  return {
    headingDeg: 318,
    accuracy: 'mock'
  }
}
