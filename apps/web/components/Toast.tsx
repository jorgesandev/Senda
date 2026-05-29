export function Toast({ message }: { message: string }) {
  return (
    <div className="rounded-md bg-text px-4 py-3 font-semibold text-white shadow-panel" role="status">
      {message}
    </div>
  )
}
