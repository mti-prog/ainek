import { notFound } from "next/navigation"
import { supabaseAdmin } from "@/lib/supabase/admin"
import Link from "next/link"
import Image from "next/image"

interface Props {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default async function StoreLayout({ children, params }: Props) {
  const { slug } = await params

  const { data: tenant } = await supabaseAdmin
    .from("tenants")
    .select("id, name, slug, logo_url, status")
    .eq("slug", slug)
    .single()

  if (!tenant || tenant.status === "suspended") {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#06060f] text-white">
      {/* Store header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/stores"
            className="flex items-center gap-1 text-white/30 hover:text-white/60 transition text-xs mr-1"
            title="Все магазины"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <Link href={`/${slug}`} className="flex items-center gap-3">
          {tenant.logo_url ? (
            <div className="relative h-8 w-8 overflow-hidden rounded-lg">
              <Image
                src={tenant.logo_url}
                alt={tenant.name}
                fill
                sizes="32px"
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-xs font-bold">
              {tenant.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="font-semibold">{tenant.name}</span>
          </Link>
        </div>

        <nav className="flex items-center gap-6 text-sm text-white/70">
          <Link href={`/${slug}`} className="hover:text-white transition">
            Каталог
          </Link>
          <Link href={`/${slug}/cart`} className="hover:text-white transition">
            Корзина
          </Link>
          <Link href={`/${slug}/orders`} className="hover:text-white transition">
            Заказы
          </Link>
        </nav>
      </header>

      <main>{children}</main>

      <footer className="border-t border-white/10 px-6 py-4 text-center text-xs text-white/30">
        Работает на <span className="text-violet-400">Ainek</span> — виртуальная примерка
      </footer>
    </div>
  )
}
