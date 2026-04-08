import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { apiError, apiOk } from "@/lib/api"

// GET /api/saved-outfits — user's saved outfit combinations
export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError("Unauthorized", 401, "UNAUTHORIZED")

  const { data, error } = await supabaseAdmin
    .from("saved_outfits")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return apiError("Failed to fetch saved outfits", 500, "DB_ERROR")

  return apiOk({ outfits: data ?? [] })
}

// POST /api/saved-outfits — save an outfit combination
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError("Unauthorized", 401, "UNAUTHORIZED")

  const body = await request.json()
  const { storeId, storeSlug, items, previewImageBase64 } = body

  if (!storeId || !Array.isArray(items) || items.length === 0) {
    return apiError("storeId and items are required", 400, "INVALID_BODY")
  }

  // Compress preview: store first 50KB of base64 max (thumbnail)
  const preview = previewImageBase64
    ? previewImageBase64.slice(0, 50000)
    : null

  const { data, error } = await supabaseAdmin
    .from("saved_outfits")
    .insert({
      user_id: user.id,
      store_id: storeId,
      store_slug: storeSlug,
      items,                  // full product objects (id, name, price, images, category)
      preview_image: preview,
    })
    .select("id")
    .single()

  if (error) {
    // Table might not exist — guide the user
    if (error.code === "42P01") {
      return apiError(
        "saved_outfits table missing. Run the migration in Supabase SQL Editor.",
        500,
        "TABLE_MISSING"
      )
    }
    return apiError("Failed to save outfit", 500, "DB_ERROR")
  }

  return apiOk({ id: data.id })
}

// DELETE /api/saved-outfits?id=... — remove saved outfit
export async function DELETE(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError("Unauthorized", 401, "UNAUTHORIZED")

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return apiError("id required", 400, "MISSING_ID")

  const { error } = await supabaseAdmin
    .from("saved_outfits")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)  // RLS safety

  if (error) return apiError("Failed to delete", 500, "DB_ERROR")

  return apiOk({ deleted: true })
}
