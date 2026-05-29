const ROWS = [
  { segment: 'Centro Calle 4ta', features: 9, trips: 1240, cost: '$18k', score: 68.8 },
  { segment: 'Zona Rio Paseo Centenario', features: 6, trips: 980, cost: '$22k', score: 44.5 },
  { segment: 'Otay Universidad', features: 5, trips: 720, cost: '$16k', score: 45.0 }
]

export function PrioritizationTable() {
  return (
    <section className="panel overflow-hidden" aria-labelledby="prior-title">
      <div className="p-5">
        <h2 id="prior-title" className="text-2xl font-bold">
          Priorizacion
        </h2>
        <p className="mt-1 text-muted">Ranking mock por trayectos desbloqueados y costo estimado.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-t border-slate-200 text-left">
          <thead className="bg-surface text-sm text-muted">
            <tr>
              <th className="px-4 py-3">Segmento</th>
              <th className="px-4 py-3">Features</th>
              <th className="px-4 py-3">Trayectos</th>
              <th className="px-4 py-3">Costo</th>
              <th className="px-4 py-3">Score</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.segment} className="border-t border-slate-200">
                <td className="px-4 py-3 font-semibold">{row.segment}</td>
                <td className="px-4 py-3">{row.features}</td>
                <td className="px-4 py-3">{row.trips}</td>
                <td className="px-4 py-3">{row.cost}</td>
                <td className="px-4 py-3">{row.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
