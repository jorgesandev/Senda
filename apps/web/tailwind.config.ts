import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        text: 'var(--text)',
        muted: 'var(--text-muted)',
        brand: 'var(--brand)',
        map: 'var(--map-bg)',
        ok: 'var(--route-ok)',
        blocked: 'var(--route-blocked)',
        sevLow: 'var(--sev-low)',
        sevMed: 'var(--sev-med)',
        sevHigh: 'var(--sev-high)',
        focus: 'var(--focus)'
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px'
      },
      boxShadow: {
        panel: '0 12px 36px rgb(15 23 42 / 0.10)'
      }
    }
  },
  plugins: []
}

export default config
