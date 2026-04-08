import { supabaseAdmin } from "@/lib/supabase/admin"
import Link from "next/link"
import StoreSearch from "./StoreSearch"

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function StoresPage({ searchParams }: Props) {
  const { q } = await searchParams

  let query = supabaseAdmin
    .from("tenants")
    .select("id, name, slug, logo_url, city, plan, try_on_used")
    .eq("status", "trial")
    .order("created_at", { ascending: false })

  // Also include active stores
  const { data: activeStores } = await supabaseAdmin
    .from("tenants")
    .select("id, name, slug, logo_url, city, plan, try_on_used")
    .eq("status", "active")
    .order("created_at", { ascending: false })

  const { data: trialStores } = await query

  const allStores = [...(activeStores ?? []), ...(trialStores ?? [])]

  // Filter by search query
  const stores = q
    ? allStores.filter((s) =>
        s.name.toLowerCase().includes(q.toLowerCase()) ||
        s.slug.toLowerCase().includes(q.toLowerCase()) ||
        (s.city ?? "").toLowerCase().includes(q.toLowerCase())
      )
    : allStores

  return (
    <div className="min-h-screen bg-[#06060f] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-xs font-bold">
            A
          </div>
          <span className="font-bold">Ainek</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/account/orders" className="text-white/60 hover:text-white transition">
            Мои заказы
          </Link>
          <Link href="/login" className="text-white/60 hover:text-white transition">
            Войти
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Магазины Ainek</h1>
          <p className="text-white/50">Примеряйте одежду онлайн перед покупкой</p>
        </div>

        {/* Search */}
        <StoreSearch initialQuery={q ?? ""} />

        {/* Results */}
        {stores.length === 0 ? (
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
              {q ? `Найдено: ${stores.length}` : `Всего магазинов: ${stores.length}`}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {stores.map((store) => (
                <Link
                  key={store.id}
                  href={`/${store.slug}`}
                  className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/50 hover:bg-white/[0.07] transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {store.logo_url ? (
                      <img
                        src={store.logo_url}
                        alt={store.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-lg font-bold">
                        {store.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-white font-semibold group-hover:text-violet-300 transition">
                        {store.name}
                      </p>
                      <p className="text-white/40 text-xs">{store.city ?? "Бишкек"}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-white/40">
                    <span className="flex items-center gap-1">
                      <span className="text-violet-400">✦</span>
                      Виртуальная примерка
                    </span>
                    <span className="text-violet-400/70 group-hover:text-violet-400 transition">
                      Открыть →
                    </span>
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
