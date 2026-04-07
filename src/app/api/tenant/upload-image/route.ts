import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { apiError, apiOk } from "@/lib/api"
import { getOwnedTenantForUser } from "@/lib/tenant"

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError("Unauthorized", 401, "UNAUTHORIZED")

  const tenant = await getOwnedTenantForUser(user)
  if (!tenant) return apiError("Tenant not found", 403, "TENANT_NOT_FOUND")

  const formData = await request.formData()
  const file = formData.get("file") as File | null

  if (!file) return apiError("No file", 400, "FILE_REQUIRED")
  if (file.size > MAX_SIZE_BYTES) return apiError("File too large (max 10MB)", 413, "FILE_TOO_LARGE")

  const ext = file.name.split(".").pop() ?? "jpg"
  const path = `${tenant.id}/${user.id}/${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabaseAdmin.storage
    .from("product-images")
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (error) {
    return apiError(error.message, 500, "UPLOAD_FAILED")
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from("product-images")
    .getPublicUrl(path)

  return apiOk({ url: publicUrl })
}
