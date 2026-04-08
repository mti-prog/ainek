import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { getTenantSchemaName } from "@/lib/tenant"
import { notFound } from "next/navigation"
import Link from "next/link"

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: "Новый",        color: "bg-yellow-500/20 text-yellow-400" },
  confirmed: { label: "Подтверждён",  color: "bg-blue-500/20 text-blue-400" },
  shipped:   { label: "Отправлен",    color: "bg-purple-500/20 text-purple-400" },
  delivered: { label: "Доставлен",    color: "bg-green-500/20 text-green-400" },
  cancelled: { label: "Отменён",      color: "bg-red-500/20 text-red-400" },
}

interface Props {
  params: Promise<{ slug: string }>
}

export default async function StoreOrdersPage({ params }: Props) {
  const { slug } = await params

  // Get tenant
  const { data: tenant } = await supabaseAdmin
    .from("tenants")
    .select("id, name, status")
    .eq("slug", slug)
    .single()

  if (!tenant || tenant.status === "suspended") notFound()

  // Check auth
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Войдите чтобы увидеть заказы</h2>
        <p className="text-white/50 text-sm mb-6">
          Все ваши заказы из {tenant.name} будут здесь
        </p>
        <Link
          href={`/login?next=/${slug}/orders`}
          className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold hover:opacity-90 transition"
        >
          Войти
        </Link>
        <div className="mt-3">
          <Link
            href={`/register?next=/${slug}/orders`}
            className="text-sm text-violet-400 hover:underline"
          >
            Нет аккаунта? Зарегистрироваться
          </Link>
        </div>
      </div>
    )
  }

  // Fetch user's orders from store schema
  const schemaName = getTenantSchemaName(tenant.id)

  const { data: orders } = await supabaseAdmin
    .schema(schemaName)
    .from("orders")
    .select("id, status, total, currency, items, delivery_method, created_at, notes")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30)

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Мои заказы</h1>
        <Link href={`/${slug}`} className="text-sm text-violet-400 hover:underline">
          Продолжить покупки
        </Link>
      </div>

      {!orders?.length ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-white/40 mb-2">Заказов пока нет</p>
          <Link
            href={`/${slug}`}
            className="text-sm text-violet-400 hover:underline"
          >
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const items = order.items as Array<{ name: string; qty: number; price: number; size?: string }>
            const statusInfo = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending

            return (
              <div
                key={order.id}
                className="p-5 rounded-xl bg-white/5 border border-white/10"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-white/40 text-xs">
                      {new Date(order.created_at).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-white font-mono text-xs mt-0.5 text-white/30">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-1 mb-3">
                  {items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-white/70">
                        {item.name}
                        {item.size && <span className="text-white/30 ml-1">({item.size})</span>}
                        <span className="text-white/40 ml-1">×{item.qty}</span>
                      </span>
                      <span className="text-white/60">
                        {(Number(item.price) * item.qty).toLocaleString("ru-RU")} {order.currency}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="text-white/40 text-xs capitalize">
                    {order.delivery_method === "courier" ? "Курьер" : "Самовывоз"}
                  </span>
                  <span className="text-white font-semibold">
                    {Number(order.total).toLocaleString("ru-RU")} {order.currency}
                  </span>
                </div>

                {order.notes && (
                  <p className="text-white/30 text-xs mt-2 italic">{order.notes}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
