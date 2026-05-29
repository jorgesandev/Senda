'use client'

import { FormEvent, useState } from 'react'
import { Navigation, Search } from 'lucide-react'
import { LocationInput } from './LocationInput'
import { useSendaStore } from '@/lib/store'

export function RoutePlanner() {
  const [origin, setOrigin] = useState('Mi ubicacion')
  const [destination, setDestination] = useState('Zona Rio')
  const [isLoading, setIsLoading] = useState(false)
  const planMockRoute = useSendaStore((state) => state.planMockRoute)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    await planMockRoute()
    setIsLoading(false)
  }

  return (
    <form className="panel space-y-4 p-4" onSubmit={submit} aria-label="Planeador de ruta">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <Navigation aria-hidden="true" size={24} />
          Planear ruta
        </h2>
        <p className="mt-1 text-muted">Ruta mock con contrato igual al API.</p>
      </div>
      <LocationInput label="Origen" value={origin} onChange={setOrigin} placeholder="Ubicacion actual" />
      <LocationInput label="Destino" value={destination} onChange={setDestination} placeholder="Destino" />
      <button type="submit" className="btn-primary w-full" disabled={isLoading}>
        <Search aria-hidden="true" size={20} />
        {isLoading ? 'Buscando' : 'Buscar ruta'}
      </button>
    </form>
  )
}
