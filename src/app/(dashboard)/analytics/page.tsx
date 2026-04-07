import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { getOwnedTenantForUser, getTenantSchemaName, isTenantOnboardingReady } from "@/lib/tenant"

export default async function AnalyticsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const tenant = await getOwnedTenantForUser(user)

  if (!tenant) redirect("/login")

  if (!isTenantOnboardingReady(tenant)) {
    return (
      <div className="p-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-white mb-4">Аналитика</h1>
        <p className="text-white/40">Аналитика появится после завершения настройки магазина.</p>
      </div>
    )
  }

  const schemaName = getTenantSchemaName(tenant.id)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()

  // Try-on sessions last 30 days
  const { data: sessions, count: totalSessions } = await supabaseAdmin
    .from("try_on_sessions")
    .select("created_at, is_cached, cost_usd", { count: "exact" })
    .eq("tenant_id", tenant.id)
    .gte("created_at", thirtyDaysAgo)
    .order("created_at", { ascending: true })

  // Analytics from store schema
  const { data: analytics } = await supabaseAdmin
    .schema(schemaName)
    .from("try_on_analytics")
    .select("product_id, converted_to_order, created_at")
    .gte("created_at", thirtyDaysAgo)

  const totalTryOns = totalSessions ?? 0
  const cachedCount = sessions?.filter((s) => s.is_cached).length ?? 0
  const cacheHitRate = totalTryOns > 0 ? Math.round((cachedCount / totalTryOns) * 100) : 0

  const conversions = analytics?.filter((a) => a.converted_to_order).length ?? 0
  const totalAnalytics = analytics?.length ?? 0
  const conversionRate = totalAnalytics > 0 ? Math.round((conversions / totalAnalytics) * 100) : 0

  const totalCost = sessions?.reduce((sum, s) => sum + parseFloat(String(s.cost_usd ?? 0)), 0) ?? 0

  // Group sessions by day for a simple chart
  const byDay: Record<string, number> = {}
  sessions?.forEach((s) => {
    const day = s.created_at.split("T")[0]
    byDay[day] = (byDay[day] ?? 0) + 1
  })
  const chartData = Object.entries(byDay).slice(-14) // last 14 days

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-8">Аналитика</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard label="Примерок (30д)" value={totalTryOns} />
        <KPICard label="Кэш-хит" value={`${cacheHitRate}%`} hint="от повторных запросов" />
        <KPICard label="Конверсия" value={`${conversionRate}%`} hint="примерка → заказ" />
        <KPICard label="Стоимость AI" value={`$${totalCost.toFixed(2)}`} hint="за 30 дней" />
      </div>

      {/* Simple bar chart (CSS-only) */}
      {chartData.length > 0 && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
          <h2 className="text-white/60 text-sm mb-4">Примерки по дням (последние 14 дней)</h2>
          <div className="flex items-end gap-1 h-24">
            {chartData.map(([day, count]) => {
              const max = Math.max(...chartData.map(([, c]) => c), 1)
              const height = Math.round((count / max) * 100)
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-violet-600 to-blue-500"
                    style={{ height: `${height}%`, minHeight: "2px" }}
                    title={`${day}: ${count}`}
                  />
                  <span className="text-white/20 text-[9px] rotate-45 origin-left truncate">
                    {day.slice(5)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Cost breakdown */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <h2 className="text-white/60 text-sm mb-3">Детализация расходов</h2>
        <div className="space-y-2 text-sm">
          <Row label="Всего примерок" value={totalTryOns} />
          <Row label="Из кэша (бесплатно)" value={cachedCount} />
          <Row label="Платных генераций" value={totalTryOns - cachedCount} />
          <Row label="Стоимость ($0.067/шт)" value={`$${totalCost.toFixed(2)}`} />
        </div>
      </div>
    </div>
  )
}

function KPICard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <p className="text-white/40 text-xs mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {hint && <p className="text-white/30 text-xs mt-0.5">{hint}</p>}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between">
      <span className="text-white/50">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  )
}
