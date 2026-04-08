import { supabaseAdmin } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import ProductCard from "@/components/store/ProductCard"
import { getTenantSchemaName } from "@/lib/tenant"

const CATEGORIES = [
  { key: "all", label: "Все" },
  { key: "tops", label: "Верх" },
  { key: "bottoms", label: "Низ" },
  { key: "dresses", label: "Платья" },
  { key: "shoes", label: "Обувь" },
  { key: "accessories", label: "Аксессуары" },
]

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ category?: string; page?: string }>
}

export default async function StoreCatalogPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { category = "all", page = "1" } = await searchParams
  const pageNum = Math.max(1, parseInt(page))
  const limit = 20
  const offset = (pageNum - 1) * limit

  const { data: tenant } = await supabaseAdmin
    .from("tenants")
    .select("id, name, onboarding_status")
    .eq("slug", slug)
    .single()

  if (!tenant) notFound()

  const schemaName = getTenantSchemaName(tenant.id)

  if (tenant.onboarding_status && tenant.onboarding_status !== "ready") {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-8 text-center">
          <p className="text-yellow-300 text-sm uppercase tracking-[0.24em] mb-3">Ainek Pilot</p>
          <h1 className="text-2xl font-bold text-white mb-3">{tenant.name} готовится к запуску</h1>
          <p className="text-white/60 text-sm">
            Магазин завершает техническую настройку каталога и примерки. Витрина скоро появится здесь.
          </p>
        </div>
      </div>
    )
  }

  let query = supabaseAdmin
    .schema(schemaName)
    .from("products")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (category !== "all") {
    query = query.eq("category", category)
  }

  const { data: products, count } = await query
  const totalPages = Math.ceil((count ?? 0) / limit)

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Category tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <a
            key={cat.key}
            href={`/${slug}?category=${cat.key}`}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${
              category === cat.key
                ? "bg-violet-600 text-white"
                : "bg-white/10 text-white/70 hover:bg-white/15"
            }`}
          >
            {cat.label}
          </a>
        ))}
      </div>

      {/* Product grid */}
      {!products?.length ? (
        <div className="text-center py-24 text-white/40">
          <p className="text-lg mb-2">Товаров пока нет</p>
          <p className="text-sm">Магазин скоро добавит ассортимент</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} slug={slug} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }, (_, i) => (
            <a
              key={i}
              href={`/${slug}?category=${category}&page=${i + 1}`}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                pageNum === i + 1
                  ? "bg-violet-600 text-white"
                  : "bg-white/10 text-white/60 hover:bg-white/15"
              }`}
            >
              {i + 1}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
