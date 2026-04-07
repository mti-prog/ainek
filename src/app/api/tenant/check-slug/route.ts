import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")?.toLowerCase().trim()

  if (!slug || !/^[a-z0-9-]{2,100}$/.test(slug)) {
    return NextResponse.json({ available: false })
  }

  const { data } = await supabaseAdmin
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .single()

  return NextResponse.json({ available: !data })
}
