'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'

export function ExportButton() {
  const [status, setStatus] = useState('Listo para exportar')

  return (
    <div className="flex items-center gap-3">
      <button type="button" className="btn-primary" onClick={() => setStatus('GeoJSON mock preparado')}>
        <Download aria-hidden="true" size={20} />
        Exportar
      </button>
      <span className="text-sm text-muted" role="status">
        {status}
      </span>
    </div>
  )
}
