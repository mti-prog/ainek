import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import Link from "next/link"

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "В обработке", color: "text-yellow-400 bg-yellow-400/10" },
  confirmed: { label: "Подтверждён", color: "text-blue-400 bg-blue-400/10" },
  shipped: { label: "Доставляется", color: "text-violet-400 bg-violet-400/10" },
  delivered: { label: "Доставлен", color: "text-green-400 bg-green-400/10" },
  cancelled: { label: "Отменён", color: "text-red-400 bg-red-400/10" },
}

export default async function OrdersPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: orders } = await supabaseAdmin
    .from("order_history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Мои заказы</h1>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white/20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-white/40 mb-4">У вас ещё нет заказов</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo =
              STATUS_LABELS[order.status] ?? STATUS_LABELS.pending
            return (
              <div
                key={order.id}
                className="p-5 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-white/40 text-xs mb-1">
                      {order.tenant_name ?? "Магазин"}
                    </p>
                    <p className="text-white font-semibold">
                      Заказ #{order.order_id?.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-white/40 text-sm mt-0.5">
                      {order.items_count} товара(ов) ·{" "}
                      {Number(order.total).toLocaleString("ru-RU")} {order.currency ?? "сом"}
                    </p>
                    <p className="text-white/30 text-xs mt-1">
                      {new Date(order.created_at).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${statusInfo.color}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
