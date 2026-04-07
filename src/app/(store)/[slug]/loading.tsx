export default function StoreLoading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex gap-2 mb-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 w-16 bg-white/10 rounded-full animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden bg-white/5 border border-white/10">
            <div className="aspect-[3/4] bg-white/5 animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
