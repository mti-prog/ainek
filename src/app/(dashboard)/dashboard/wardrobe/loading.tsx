export default function WardrobeLoading() {
  return (
    <div className="p-8 max-w-5xl animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 w-28 bg-white/10 rounded-lg" />
        <div className="h-9 w-32 bg-white/5 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden bg-white/5">
            <div className="aspect-[3/4] bg-white/10" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-white/10 rounded" />
              <div className="h-4 w-2/3 bg-white/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
