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

        <nav className="flex items-center gap-1 text-white/60">
          <Link href="/account/orders" className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition" title="Заказы">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6m-6 4h3" />
            </svg>
            <span className="text-[10px]">Заказы</span>
          </Link>
          <Link href="/account/wishlist" className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition" title="Избранное">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-[10px]">Избранное</span>
          </Link>
          <Link href="/account/profile" className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition" title="Профиль">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[10px]">Профиль</span>
          </Link>
          <SignOutButton iconOnly className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-white/70 transition text-white/40" />
        </nav>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">{children}</main>
    </div>
  )
}
