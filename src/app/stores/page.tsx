import { supabaseAdmin } from "@/lib/supabase/admin"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import Link from "next/link"
import Image from "next/image"
import StoreSearch from "./StoreSearch"
import SignOutButton from "@/components/SignOutButton"

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function StoresPage({ searchParams }: Props) {
  const { q } = await searchParams

  // Auth check (server)
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch all active + trial stores in parallel
  const [{ data: activeStores }, { data: trialStores }] = await Promise.all([
    supabaseAdmin
      .from("tenants")
      .select("id, name, slug, logo_url, city, onboarding_status")
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("tenants")
      .select("id, name, slug, logo_url, city, onboarding_status")
      .eq("status", "trial")
      .eq("onboarding_status", "ready")
      .order("created_at", { ascending: false }),
  ])

  const allStores = [...(activeStores ?? []), ...(trialStores ?? [])]

  const filtered = q
    ? allStores.filter((s) =>
        s.name.toLowerCase().includes(q.toLowerCase()) ||
        s.slug.toLowerCase().includes(q.toLowerCase()) ||
        (s.city ?? "").toLowerCase().includes(q.toLowerCase())
      )
    : allStores

  // Fetch up to 3 product preview images per store (parallel)
  const storesWithPreviews = await Promise.all(
    filtered.map(async (store) => {
      const schemaName = `store_${store.id.replace(/-/g, "_")}`
      try {
        const { data: products } = await supabaseAdmin
          .schema(schemaName)
          .from("products")
          .select("images")
          .eq("is_active", true)
          .limit(3)

        const previews = (products ?? [])
          .flatMap((p) => {
            const imgs = (p.images as Array<{ url: string; isPrimary?: boolean }>) ?? []
            const primary = imgs.find((i) => i.isPrimary) ?? imgs[0]
            return primary ? [primary.url] : []
          })
          .slice(0, 3)

        return { ...store, previews }
      } catch {
        return { ...store, previews: [] as string[] }
      }
    })
  )

  return (
    <div className="min-h-screen bg-[#06060f] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/stores" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-xs font-bold">
            A
          </div>
          <span className="font-bold">Ainek</span>
        </Link>

        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link
                href="/account/orders"
                className="flex items-center gap-1.5 text-white/60 hover:text-white transition"
                title="Мои заказы"
              >
                {/* receipt icon */}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6m-6 4h3" />
                </svg>
                <span className="hidden sm:inline">Заказы</span>
              </Link>
              <Link
                href="/account/profile"
                className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-xs font-bold hover:opacity-80 transition"
                title="Профиль"
              >
                {user.email?.charAt(0).toUpperCase()}
              </Link>
              <SignOutButton iconOnly className="text-white/40 hover:text-white/70 transition" />
            </>
          ) : (
            <>
              <Link href="/register" className="text-white/60 hover:text-white transition">
                Регистрация
              </Link>
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white transition"
              >
                Войти
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Магазины Ainek</h1>
          <p className="text-white/50">Примеряйте одежду онлайн перед покупкой</p>
        </div>

        <StoreSearch initialQuery={q ?? ""} />

        {storesWithPreviews.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/40 text-lg mb-2">
              {q ? `По запросу «${q}» ничего не найдено` : "Магазины скоро появятся"}
            </p>
            {q && (
              <Link href="/stores" className="text-violet-400 text-sm hover:underline">
                Показать все магазины
              </Link>
            )}
          </div>
        ) : (
          <>
            <p className="text-white/40 text-sm mb-6">
              {q ? `Найдено: ${storesWithPreviews.length}` : `Всего: ${storesWithPreviews.length}`}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {storesWithPreviews.map((store) => (
                <Link
                  key={store.id}
                  href={`/${store.slug}`}
                  className="group rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/50 transition-all overflow-hidden"
                >
                  {/* Product image preview */}
                  <div className="relative h-44 bg-white/5 overflow-hidden">
                    {store.previews.length > 0 ? (
                      <div className={`grid h-full ${store.previews.length === 1 ? "grid-cols-1" : store.previews.length === 2 ? "grid-cols-2" : "grid-cols-3"} gap-0.5`}>
                        {store.previews.map((url, i) => (
                          <div key={i} className="relative overflow-hidden">
                            <Image
                              src={url}
                              alt=""
                              fill
                              sizes="200px"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              unoptimized
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-6xl font-bold text-white/5">
                          {store.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-blue-600/20" />
                      </div>
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#06060f] via-transparent to-transparent" />

                    {/* Try-on badge */}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-violet-600/90 text-white text-xs font-medium backdrop-blur-sm flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                      </svg>
                      Примерка
                    </div>
                  </div>

                  {/* Store info */}
                  <div className="p-4 flex items-center gap-3">
                    {store.logo_url ? (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={store.logo_url} alt={store.name} fill sizes="40px" className="object-cover" unoptimized />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {store.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold group-hover:text-violet-300 transition truncate">
                        {store.name}
                      </p>
                      <p className="text-white/40 text-xs">{store.city ?? "Бишкек"}</p>
                    </div>
                    <svg className="w-4 h-4 text-white/30 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
