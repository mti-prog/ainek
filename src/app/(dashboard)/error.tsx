"use client"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <p className="text-red-400 font-medium">Что-то пошло не так</p>
      <p className="text-white/40 text-sm">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/15 transition"
      >
        Попробовать снова
      </button>
    </div>
  )
}
