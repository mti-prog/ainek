import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getOwnedTenantForUser, getTenantSchemaName, isTenantOnboardingReady } from "@/lib/tenant"
import db from "@/lib/db"

export default async function WardrobePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const tenant = await getOwnedTenantForUser(user)

  if (!tenant) redirect("/login")

  const schemaName = getTenantSchemaName(tenant.id)

  // Use direct DB — PostgREST cannot access custom tenant schemas
  let products: Array<{
    id: string; name: string; price: string; currency: string;
    category: string; images: Array<{ url: string; isPrimary?: boolean }>;
    is_active: boolean; try_on_count: number;
  }> = []

  if (isTenantOnboardingReady(tenant)) {
    try {
      products = await db.unsafe(
        `SELECT id, name, price, currency, category, images, is_active,
                COALESCE(try_on_count, 0) AS try_on_count
         FROM "${schemaName}".products
         ORDER BY created_at DESC`
      ) as typeof products
    } catch {
      // Schema not provisioned yet — show empty state
    }
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Гардероб</h1>
          <p className="text-white/40 text-sm">{products.length} товаров</p>
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

      {!isTenantOnboardingReady(tenant) ? (
        <div className="text-center py-24 text-white/30">
          <p className="text-lg mb-2">Настройка магазина ещё не завершена</p>
          <p className="text-sm mb-6">После повторной настройки здесь появится каталог для загрузки товаров.</p>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/15 transition inline-block"
          >
            Открыть обзор
          </Link>
        </div>
      ) : !products.length ? (
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
            const thumb = p.images?.find((i) => i.isPrimary) ?? p.images?.[0]
            return (
              <div key={p.id} className="rounded-xl overflow-hidden bg-white/5 border border-white/10">
                <div className="aspect-[3/4] bg-white/5 relative">
                  {thumb?.url ? (
                    <Image
                      src={thumb.url}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover"
                      unoptimized
                    />
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
