export default function OrdersLoading() {
  return (
    <div className="p-8 max-w-5xl animate-pulse">
      <div className="h-8 w-24 bg-white/10 rounded-lg mb-6" />
      <div className="flex gap-2 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 w-20 rounded-lg bg-white/5" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-white/5" />
        ))}
      </div>
    </div>
  )
}
