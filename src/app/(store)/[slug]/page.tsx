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

const CUSTOM_PINNED_PRODUCTS: StudioProduct[] = [
  {
    id: "custom_beanie_khaki",
    name: "Шапка-бини хаки",
    price: 0,
    currency: "",
    category: "accessories",
    images: [{ url: "/custom-products/beanie.jpeg", isPrimary: true }],
  },
  {
    id: "custom_nike_cap_grey",
    name: "Nike кепка серая",
    price: 0,
    currency: "",
    category: "accessories",
    images: [{ url: "/custom-products/nike-cap.jpeg", isPrimary: true }],
  },
  {
    id: "custom_clubmaster_glasses",
    name: "Очки клабмастер",
    price: 0,
    currency: "",
    category: "accessories",
    images: [{ url: "/custom-products/clubmaster-glasses.jpeg", isPrimary: true }],
  },
  {
    id: "custom_aviator_glasses",
    name: "Авиаторы черные",
    price: 0,
    currency: "",
    category: "accessories",
    images: [{ url: "/custom-products/aviator-glasses.jpeg", isPrimary: true }],
  },
  {
    id: "custom_kg_tracksuit",
    name: "Костюм сборной КР",
    price: 0,
    currency: "",
    category: "suits",
    images: [{ url: "/custom-products/kg-tracksuit.jpeg", isPrimary: true }],
  },
  {
    id: "custom_pink_dress",
    name: "Розовое платье",
    price: 0,
    currency: "",
    category: "dresses",
    images: [{ url: "/custom-products/pink-dress.jpeg", isPrimary: true }],
  },
  {
    id: "custom_grey_shorts",
    name: "Серые шорты",
    price: 0,
    currency: "",
    category: "bottoms",
    images: [{ url: "/custom-products/grey-shorts.jpeg", isPrimary: true }],
  },
  {
    id: "custom_black_tee",
    name: "Черная футболка",
    price: 0,
    currency: "",
    category: "tops",
    images: [{ url: "/custom-products/black-tee.jpeg", isPrimary: true }],
  },
  {
    id: "custom_adidas_samba",
    name: "Adidas Samba",
    price: 0,
    currency: "",
    category: "shoes",
    images: [{ url: "/custom-products/adidas-samba.png", isPrimary: true }],
  },
  {
    id: "custom_grey_joggers",
    name: "Серые джоггеры",
    price: 0,
    currency: "",
    category: "bottoms",
    images: [{ url: "/custom-products/grey-joggers.jpeg", isPrimary: true }],
  },
  {
    id: "custom_nike_sweatshirt",
    name: "Nike свитшот черный",
    price: 0,
    currency: "",
    category: "tops",
    images: [{ url: "/custom-products/nike-sweatshirt.jpeg", isPrimary: true }],
  },
  {
    id: "custom_black_suit",
    name: "Черный костюм",
    price: 0,
    currency: "",
    category: "suits",
    images: [{ url: "/custom-products/black-suit.jpeg", isPrimary: true }],
  },
]

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
