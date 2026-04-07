import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { z } from "zod"

// ── GET /api/tenant/products ─────────────────────────────────────────────────
// Returns paginated products for a store.
// Query params: tenantId (required), category?, page?, limit?

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const tenantId =
    searchParams.get("tenantId") ?? request.headers.get("x-tenant-id")
  const category = searchParams.get("category")
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"))
  const offset = (page - 1) * limit

  if (!tenantId) {
    return NextResponse.json({ error: "tenantId required" }, { status: 400 })
  }

  const schemaName = `store_${tenantId.replace(/-/g, "_")}`

  let query = supabaseAdmin
    .schema(schemaName)
    .from("products")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (category && category !== "all") {
    query = query.eq("category", category)
  }

  const { data, error, count } = await query

  if (error) {
    console.error("Products query error:", error)
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 })
  }

  return NextResponse.json({
    products: data ?? [],
    total: count ?? 0,
    page,
    limit,
  })
}

// ── POST /api/tenant/products ────────────────────────────────────────────────
// Creates a new product. Requires store owner auth.

const createSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  price: z.number().positive(),
  currency: z.string().default("KGS"),
  sku: z.string().optional(),
  images: z.array(z.object({ url: z.string(), isPrimary: z.boolean().optional(), color: z.string().optional() })).default([]),
  sizes: z.array(z.object({ size: z.string(), stockQty: z.number().default(0) })).default([]),
  colors: z.array(z.object({ name: z.string(), hex: z.string(), images: z.array(z.string()).default([]) })).default([]),
  isVirtualTryOnEnabled: z.boolean().default(true),
})

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get tenant for this store owner
  const { data: tenant } = await supabaseAdmin
    .from("tenants")
    .select("id")
    .eq("email", user.email!)
    .single()

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 403 })
  }

  const body = await request.json()
  const parsed = createSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const schemaName = `store_${tenant.id.replace(/-/g, "_")}`

  const { data, error } = await supabaseAdmin
    .schema(schemaName)
    .from("products")
    .insert({
      tenant_id: tenant.id,
      name: parsed.data.name,
      description: parsed.data.description,
      category: parsed.data.category,
      subcategory: parsed.data.subcategory,
      brand: parsed.data.brand,
      price: parsed.data.price,
      currency: parsed.data.currency,
      sku: parsed.data.sku,
      images: parsed.data.images,
      sizes: parsed.data.sizes,
      colors: parsed.data.colors,
      is_virtual_try_on_enabled: parsed.data.isVirtualTryOnEnabled,
    })
    .select("id")
    .single()

  if (error) {
    console.error("Product insert error:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }

  return NextResponse.json({ productId: data.id }, { status: 201 })
}
