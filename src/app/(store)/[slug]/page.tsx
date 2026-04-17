import { supabaseAdmin } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import { getTenantSchemaName } from "@/lib/tenant"
import TryOnStudio, { type StudioProduct } from "./TryOnStudio"

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preload?: string }>
}

function normalizeStudioCategory(category?: string | null) {
  const value = (category ?? "").toLowerCase()

  if (["top", "tops", "shirt", "tshirt", "sweatshirt", "hoodie"].includes(value)) return "tops"
  if (["bottom", "bottoms", "pants", "shorts", "joggers", "trousers"].includes(value)) return "bottoms"
  if (["dress", "dresses"].includes(value)) return "dresses"
  if (["shoe", "shoes", "sneakers"].includes(value)) return "shoes"
  if (["suit", "suits", "tracksuit", "track_suit"].includes(value)) return "suits"
  if (["hat", "hats", "cap", "caps", "glasses", "accessory", "accessories"].includes(value)) return "accessories"

  return "accessories"
}

const CUSTOM_PINNED_PRODUCTS: StudioProduct[] = []

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

  // ── Products via exec_sql_json RPC (no DATABASE_URL needed, no PostgREST whitelist) ───
  const schemaName = getTenantSchemaName(tenant.id)

  let rawProducts: StudioProduct[] = []
  try {
    const sql = `
      SELECT id, name, price::text AS price, currency, images, category, sizes, colors
      FROM "${schemaName}".products
      WHERE is_active = TRUE
      ORDER BY created_at DESC
      LIMIT 200
    `
    const { data, error } = await supabaseAdmin.rpc("exec_sql_json", { sql })
    if (!error && Array.isArray(data)) {
      rawProducts = data as StudioProduct[]
    }
  } catch {
    // Schema not provisioned yet — show empty wardrobe
  }

  const studioProducts: StudioProduct[] = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    currency: p.currency,
    images: p.images,
    category: normalizeStudioCategory(p.category),
    sizes: p.sizes,
    colors: p.colors,
  }))

  const mergedProducts: StudioProduct[] = [
    ...CUSTOM_PINNED_PRODUCTS,
    ...studioProducts.filter(
      (product) => !CUSTOM_PINNED_PRODUCTS.some((customProduct) => customProduct.name === product.name)
    ),
  ]

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
      products={mergedProducts}
      tenant={{ id: tenant.id, slug: tenant.slug, name: tenant.name }}
      preloadedItems={preloadedItems}
    />
  )
}
