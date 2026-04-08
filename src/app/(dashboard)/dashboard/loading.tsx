export default function DashboardLoading() {
  return (
    <div className="p-8 max-w-5xl animate-pulse">
      <div className="h-8 w-32 bg-white/10 rounded-lg mb-2" />
      <div className="h-4 w-24 bg-white/5 rounded mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-white/5" />
        ))}
      </div>
      <div className="h-2 rounded-full bg-white/5 mb-8" />
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-48 rounded-xl bg-white/5" />
        <div className="h-48 rounded-xl bg-white/5" />
      </div>
    </div>
  )
}
