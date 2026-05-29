import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { A11yProvider } from '@/components/AccessibilityControls'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'Senda',
  description: 'Ruteo peatonal accesible para Tijuana',
  manifest: '/manifest.json'
}

export const viewport: Viewport = {
  themeColor: '#2563EB',
  width: 'device-width',
  initialScale: 1
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <A11yProvider>{children}</A11yProvider>
      </body>
    </html>
  )
}
