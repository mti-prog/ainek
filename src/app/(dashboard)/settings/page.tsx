import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import BillingSection from "@/components/dashboard/BillingSection"
import { getOwnedTenantForUser } from "@/lib/tenant"

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const tenant = await getOwnedTenantForUser(user)

  if (!tenant) redirect("/login")

  const { data: subscription } = await supabaseAdmin
    .from("subscriptions")
    .select("plan, status, price_usd, current_period_end")
    .eq("tenant_id", tenant.id)
    .eq("status", "active")
    .single()

  return (
    <div className="p-8 max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-white">Настройки</h1>

      {/* Store profile */}
      <section className="p-6 rounded-xl bg-white/5 border border-white/10">
        <h2 className="text-white font-semibold mb-4">Профиль магазина</h2>
        <div className="space-y-1 text-sm">
          <Row label="Название" value={tenant.name} />
          <Row label="URL" value={`${tenant.slug}.ainek.kg`} />
          <Row label="Email" value={tenant.email} />
          {tenant.phone && <Row label="Телефон" value={tenant.phone} />}
          {tenant.address && <Row label="Адрес" value={tenant.address} />}
        </div>
      </section>

      {/* Billing */}
      <BillingSection tenant={tenant} subscription={subscription} />
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-white/5">
      <span className="text-white/40">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  )
}
