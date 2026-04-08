import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import SignOutButton from "@/components/SignOutButton"

export default async function UserLayout({
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

  return (
    <div className="min-h-screen bg-[#06060f] text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-white">
          Ainek
        </Link>
        <nav className="flex items-center gap-6 text-sm text-white/60">
          <Link href="/account/orders" className="hover:text-white transition">
            Мои заказы
          </Link>
          <Link href="/account/wishlist" className="hover:text-white transition">
            Избранное
          </Link>
          <Link href="/account/profile" className="hover:text-white transition">
            Профиль
          </Link>
          <SignOutButton />
        </nav>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-10">{children}</main>
    </div>
  )
}
