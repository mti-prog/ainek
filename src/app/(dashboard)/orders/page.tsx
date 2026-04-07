import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { getOwnedTenantForUser, getTenantSchemaName, isTenantOnboardingReady } from "@/lib/tenant"
import OrderStatusButton from "@/components/dashboard/OrderStatusButton"

const STATUS_LABELS: Record<string, string> = {
  pending: "Новый",
  confirmed: "Подтверждён",
  shipped: "Отправлен",
  delivered: "Доставлен",
  cancelled: "Отменён",
  refunded: "Возврат",
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-blue-500/20 text-blue-400",
  shipped: "bg-purple-500/20 text-purple-400",
  delivered: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
  refunded: "bg-orange-500/20 text-orange-400",
}

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function DashboardOrdersPage({ searchParams }: Props) {
  const { status } = await searchParams

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const tenant = await getOwnedTenantForUser(user)

  if (!tenant) redirect("/login")

  if (!isTenantOnboardingReady(tenant)) {
    return (
      <div className="p-8 max-w-5xl">
        <h1 className="text-2xl font-bold text-white mb-6">Заказы</h1>
        <p className="text-white/30 text-center py-16">Заказы будут доступны после завершения настройки магазина.</p>
      </div>
    )
  }

  const schemaName = getTenantSchemaName(tenant.id)

  let query = supabaseAdmin
    .schema(schemaName)
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)

  if (status) {
    query = query.eq("status", status)
  }

  const { data: orders } = await query

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-white mb-6">Заказы</h1>

      {/* Status filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {["", "pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
          <a
            key={s}
            href={s ? `/dashboard/orders?status=${s}` : "/dashboard/orders"}
            className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition ${
              status === s || (!status && !s)
                ? "bg-violet-600 text-white"
                : "bg-white/10 text-white/60 hover:bg-white/15"
            }`}
          >
            {s ? STATUS_LABELS[s] : "Все"}
          </a>
        ))}
      </div>

      {!orders?.length ? (
        <p className="text-white/30 text-center py-16">Заказов нет</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const items = order.items as Array<{ name: string; qty: number }>
            return (
              <div key={order.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-white font-medium text-sm">
                      {items.map((i) => `${i.name} ×${i.qty}`).join(", ")}
                    </p>
                    <p className="text-white/40 text-xs mt-0.5">
                      {new Date(order.created_at).toLocaleDateString("ru-RU", {
                        day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-semibold">
                      {parseFloat(order.total).toLocaleString("ru-RU")} {order.currency}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${STATUS_COLORS[order.status] ?? "bg-white/10 text-white/40"}`}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </div>
                </div>

                {/* Status actions */}
                {order.status === "pending" && (
                  <div className="flex gap-2 mt-3">
                    <OrderStatusButton orderId={order.id} status="confirmed" label="Подтвердить" />
                    <OrderStatusButton orderId={order.id} status="cancelled" label="Отменить" danger />
                  </div>
                )}
                {order.status === "confirmed" && (
                  <OrderStatusButton orderId={order.id} status="shipped" label="Отправить" />
                )}
                {order.status === "shipped" && (
                  <OrderStatusButton orderId={order.id} status="delivered" label="Доставлен" />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
