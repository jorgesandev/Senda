export function GovHeatmap() {
  const cells = Array.from({ length: 48 }, (_, index) => index)

  return (
    <section className="panel p-5" aria-labelledby="heatmap-title">
      <h2 id="heatmap-title" className="text-2xl font-bold">
        Mapa de calor
      </h2>
      <p className="mt-1 text-muted">Densidad mock por zonas prioritarias.</p>
      <div className="mt-5 grid grid-cols-8 gap-2" role="img" aria-label="Mapa de calor mock de Tijuana">
        {cells.map((cell) => {
          const intensity = cell % 5
          const bg = ['bg-slate-100', 'bg-yellow-200', 'bg-orange-300', 'bg-red-400', 'bg-rose-600'][intensity]
          return <span key={cell} className={`aspect-square rounded-sm ${bg}`} />
        })}
      </div>
    </section>
  )
}
