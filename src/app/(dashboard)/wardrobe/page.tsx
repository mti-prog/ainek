import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function WardrobePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: tenant } = await supabaseAdmin
    .from("tenants")
    .select("id")
    .eq("email", user.email!)
    .single()

  if (!tenant) redirect("/login")

  const schemaName = `store_${tenant.id.replace(/-/g, "_")}`

  const { data: products } = await supabaseAdmin
    .schema(schemaName)
    .from("products")
    .select("id, name, price, currency, category, images, is_active, try_on_count")
    .order("created_at", { ascending: false })

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Гардероб</h1>
          <p className="text-white/40 text-sm">{products?.length ?? 0} товаров</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/wardrobe/import"
            className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/15 transition"
          >
            Импорт CSV
          </Link>
          <Link
            href="/dashboard/wardrobe/upload"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm hover:opacity-90 transition"
          >
            + Добавить товар
          </Link>
        </div>
      </div>

      {!products?.length ? (
        <div className="text-center py-24 text-white/30">
          <p className="text-lg mb-2">Каталог пустой</p>
          <p className="text-sm mb-6">Добавьте первый товар, чтобы покупатели могли примерять</p>
          <Link
            href="/dashboard/wardrobe/upload"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:opacity-90 transition inline-block"
          >
            Добавить товар
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => {
            const images = p.images as Array<{ url: string; isPrimary?: boolean }>
            const thumb = images?.find((i) => i.isPrimary) ?? images?.[0]
            return (
              <div key={p.id} className="rounded-xl overflow-hidden bg-white/5 border border-white/10">
                <div className="aspect-[3/4] bg-white/5">
                  {thumb ? (
                    <img src={thumb.url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
                      Нет фото
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-white text-sm font-medium line-clamp-1">{p.name}</p>
                  <p className="text-violet-400 text-sm">{parseFloat(p.price).toLocaleString("ru-RU")} {p.currency}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-white/30 text-xs">{p.try_on_count ?? 0} примерок</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_active ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/30"}`}>
                      {p.is_active ? "актив" : "скрыт"}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
