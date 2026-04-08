import { supabaseAdmin } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import { getTenantSchemaName } from "@/lib/tenant"
import TryOnStudio, { type StudioProduct } from "./TryOnStudio"

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preload?: string }>
}

export default async function StorePage({ params, searchParams }: Props) {
  const { slug } = await params
  const { preload } = await searchParams

  // ── Tenant ────────────────────────────────────────────────────────────────
  const { data: tenant } = await supabaseAdmin
    .from("tenants")
    .select("id, name, slug, onboarding_status")
    .eq("slug", slug)
    .single()

  if (!tenant) notFound()

  // ── Onboarding check ──────────────────────────────────────────────────────
  if (tenant.onboarding_status && tenant.onboarding_status !== "ready") {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-8 text-center">
          <p className="text-yellow-300 text-sm uppercase tracking-[0.24em] mb-3">Ainek Pilot</p>
          <h1 className="text-2xl font-bold text-white mb-3">{tenant.name} готовится к запуску</h1>
          <p className="text-white/60 text-sm">
            Магазин завершает техническую настройку. Витрина скоро появится здесь.
          </p>
        </div>
      </div>
    )
  }

  // ── Products ──────────────────────────────────────────────────────────────
  const schemaName = getTenantSchemaName(tenant.id)

  const { data: products } = await supabaseAdmin
    .schema(schemaName)
    .from("products")
    .select("id, name, price, currency, images, category, sizes, colors")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(200)

  const studioProducts: StudioProduct[] = (products ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    currency: p.currency,
    images: p.images,
    category: p.category,
    sizes: p.sizes,
    colors: p.colors,
  }))

  // ── Preloaded outfit (from saved styles) ──────────────────────────────────
  let preloadedItems: StudioProduct[] | undefined

  if (preload) {
    try {
      const { data: outfit } = await supabaseAdmin
        .from("saved_outfits")
        .select("items")
        .eq("id", preload)
        .single()

      if (outfit?.items && Array.isArray(outfit.items)) {
        preloadedItems = outfit.items as StudioProduct[]
      }
    } catch {
      // ignore — just start fresh
    }
  }

  return (
    <TryOnStudio
      products={studioProducts}
      tenant={{ id: tenant.id, slug: tenant.slug, name: tenant.name }}
      preloadedItems={preloadedItems}
    />
  )
}
