import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import SignOutButton from "@/components/SignOutButton"

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <div className="min-h-screen bg-[#06060f] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/stores"
            className="flex items-center gap-1.5 text-white/40 hover:text-white transition text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Магазины
          </Link>
          <span className="text-white/20">/</span>
          <Link href="/stores" className="font-bold text-white">
            Ainek
          </Link>
        </div>

        <nav className="flex items-center gap-5 text-sm text-white/60">
          <Link href="/account/orders" className="hover:text-white transition">
            Заказы
          </Link>
          <Link href="/account/wishlist" className="hover:text-white transition">
            Избранное
          </Link>
          <Link href="/account/profile" className="hover:text-white transition">
            Профиль
          </Link>
          <SignOutButton className="text-sm text-white/40 hover:text-white/70 transition" />
        </nav>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">{children}</main>
    </div>
  )
}
