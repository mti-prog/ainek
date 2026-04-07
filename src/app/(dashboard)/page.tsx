import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: tenant } = await supabaseAdmin
    .from("tenants")
    .select("id, name, slug, plan, status, try_on_used, try_on_limit, trial_ends_at")
    .eq("email", user.email!)
    .single()

  if (!tenant) redirect("/login")

  const schemaName = `store_${tenant.id.replace(/-/g, "_")}`

  // Recent try-on sessions for this store
  const { data: sessions, count: sessionCount } = await supabaseAdmin
    .from("try_on_sessions")
    .select("*", { count: "exact" })
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Recent orders
  const { data: orders } = await supabaseAdmin
    .schema(schemaName)
    .from("orders")
    .select("id, status, total, currency, created_at, items")
    .order("created_at", { ascending: false })
    .limit(5)

  const trialDaysLeft = tenant.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(tenant.trial_ends_at).getTime() - Date.now()) / 86400000))
    : null

  const usagePercent = Math.min(100, Math.round((tenant.try_on_used / tenant.try_on_limit) * 100))

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-white mb-2">Обзор</h1>
      <p className="text-white/40 text-sm mb-8">{tenant.name}</p>

      {/* Trial banner */}
      {tenant.status === "trial" && trialDaysLeft !== null && (
        <div className="mb-6 p-4 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Пробный период</p>
            <p className="text-white/60 text-sm">Осталось {trialDaysLeft} дней · 50 примерок включено</p>
          </div>
          <a
            href="/dashboard/settings"
            className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm hover:bg-violet-500 transition"
          >
            Подключить тариф
          </a>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Примерок этот месяц" value={tenant.try_on_used} max={tenant.try_on_limit} />
        <StatCard label="Всего примерок" value={sessionCount ?? 0} />
        <StatCard label="Заказов сегодня" value={(orders ?? []).filter(o =>
          new Date(o.created_at).toDateString() === new Date().toDateString()
        ).length} />
        <StatCard label="Тариф" value={tenant.plan} uppercase />
      </div>

      {/* Try-on usage bar */}
      <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-white/60">Использование примерок</span>
          <span className="text-white">{tenant.try_on_used} / {tenant.try_on_limit}</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${usagePercent > 85 ? "bg-red-500" : "bg-gradient-to-r from-violet-600 to-blue-600"}`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent try-on sessions */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <h2 className="text-white font-medium mb-4">Последние примерки</h2>
          {!sessions?.length ? (
            <p className="text-white/30 text-sm">Примерок пока нет</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <span className="text-white/60">{new Date(s.created_at).toLocaleDateString("ru-RU")}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${s.is_cached ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}`}>
                    {s.is_cached ? "кэш" : "новая"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <h2 className="text-white font-medium mb-4">Последние заказы</h2>
          {!orders?.length ? (
            <p className="text-white/30 text-sm">Заказов пока нет</p>
          ) : (
            <div className="space-y-2">
              {orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between text-sm">
                  <span className="text-white/60">{parseFloat(o.total).toLocaleString("ru-RU")} {o.currency}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    o.status === "delivered" ? "bg-green-500/20 text-green-400" :
                    o.status === "cancelled" ? "bg-red-500/20 text-red-400" :
                    "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {o.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, max, uppercase }: {
  label: string
  value: number | string
  max?: number
  uppercase?: boolean
}) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <p className="text-white/40 text-xs mb-1">{label}</p>
      <p className={`text-2xl font-bold text-white ${uppercase ? "capitalize" : ""}`}>
        {value}
        {max !== undefined && <span className="text-white/30 text-sm font-normal"> /{max}</span>}
      </p>
    </div>
  )
}
