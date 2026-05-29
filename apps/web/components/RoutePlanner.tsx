'use client'

import { FormEvent, useState } from 'react'
import { Navigation, Search } from 'lucide-react'
import { LocationInput } from './LocationInput'
import { useSendaStore } from '@/lib/store'

export function RoutePlanner() {
  const [origin, setOrigin] = useState('Mi ubicacion')
  const [destination, setDestination] = useState('Zona Rio')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const planRoute = useSendaStore((state) => state.planRoute)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      await planRoute(origin, destination)
    } catch (routeError) {
      setError(routeError instanceof Error ? routeError.message : 'No se pudo calcular la ruta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="panel space-y-4 p-4" onSubmit={submit} aria-label="Planeador de ruta">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <Navigation aria-hidden="true" size={24} />
          Planear ruta
        </h2>
        <p className="mt-1 text-muted">Ruta peatonal real con Valhalla local.</p>
      </div>
      <LocationInput label="Origen" value={origin} onChange={setOrigin} placeholder="Ubicacion actual" />
      <LocationInput label="Destino" value={destination} onChange={setDestination} placeholder="Destino" />
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" className="btn-primary w-full" disabled={isLoading}>
        <Search aria-hidden="true" size={20} />
        {isLoading ? 'Buscando' : 'Buscar ruta'}
      </button>
    </form>
  )
}
