import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import Link from "next/link"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Load tenant info for this store owner
  const { data: tenant } = await supabaseAdmin
    .from("tenants")
    .select("id, name, slug, logo_url, plan, status, try_on_used, try_on_limit")
    .eq("email", user.email!)
    .single()

  const headersList = await headers()
  const tenantSlug = headersList.get("x-tenant-slug") ?? tenant?.slug ?? ""

  return (
    <div className="min-h-screen bg-[#06060f] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col p-6 gap-2">
        <div className="mb-6">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Магазин</p>
          <p className="font-semibold text-white">{tenant?.name ?? "—"}</p>
          <p className="text-xs text-violet-400">{tenantSlug}.ainek.kg</p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          <NavLink href="/dashboard">Обзор</NavLink>
          <NavLink href="/dashboard/wardrobe">Гардероб</NavLink>
          <NavLink href="/dashboard/orders">Заказы</NavLink>
          <NavLink href="/dashboard/analytics">Аналитика</NavLink>
          <NavLink href="/dashboard/settings">Настройки</NavLink>
        </nav>

        {/* Try-on usage meter */}
        {tenant && (
          <div className="mt-auto pt-4 border-t border-white/10">
            <p className="text-xs text-white/50 mb-1">
              Примерки: {tenant.try_on_used}/{tenant.try_on_limit}
            </p>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-600 to-blue-600 rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    (tenant.try_on_used / tenant.try_on_limit) * 100
                  )}%`,
                }}
              />
            </div>
            <p className="text-xs text-white/30 mt-1 capitalize">{tenant.plan}</p>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition text-sm"
    >
      {children}
    </Link>
  )
}
