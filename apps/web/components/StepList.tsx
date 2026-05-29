export function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-2" aria-label="Indicaciones paso a paso">
      {steps.map((step, index) => (
        <li key={step} className="flex gap-3 rounded-md bg-surface p-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
            {index + 1}
          </span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  )
}
