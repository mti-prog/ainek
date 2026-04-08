import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import Link from "next/link"
import { getOwnedTenantForUser } from "@/lib/tenant"
import SignOutButton from "@/components/SignOutButton"

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

  const tenant = await getOwnedTenantForUser(user)

  if (!tenant) {
    redirect("/login")
  }

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
          {tenant.onboarding_status && tenant.onboarding_status !== "ready" && (
            <p className="text-[11px] text-yellow-300 mt-1">Настройка: {tenant.onboarding_status}</p>
          )}
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          <NavLink href="/dashboard" icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          }>Обзор</NavLink>
          <NavLink href="/dashboard/wardrobe" icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
          }>Гардероб</NavLink>
          <NavLink href="/dashboard/orders" icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6m-6 4h3" /></svg>
          }>Заказы</NavLink>
          <NavLink href="/dashboard/analytics" icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          }>Аналитика</NavLink>
          <NavLink href="/dashboard/settings" icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          }>Настройки</NavLink>
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

        <div className="pt-3 border-t border-white/10">
          <SignOutButton className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition" />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

function NavLink({ href, children, icon }: { href: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition text-sm"
    >
      {icon && <span className="text-white/50">{icon}</span>}
      {children}
    </Link>
  )
}
