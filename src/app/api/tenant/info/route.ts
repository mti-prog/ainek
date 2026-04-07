import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")?.toLowerCase().trim()

  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from("tenants")
    .select("id, name, slug, logo_url, status, plan")
    .eq("slug", slug)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
  }

  return NextResponse.json(data)
}
