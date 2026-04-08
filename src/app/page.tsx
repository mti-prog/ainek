import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function Home() {
  // If already logged in — send to the right place
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: tenant } = await supabaseAdmin
      .from("tenants")
      .select("id")
      .eq("owner_user_id", user.id)
      .maybeSingle()

    redirect(tenant ? "/dashboard" : "/stores")
  }

  return (
    <div className="min-h-screen bg-[#06060f] text-white flex flex-col">
      {/* Nav */}
      <header className="px-8 py-5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-xs font-bold">
            A
          </div>
          <span className="font-bold text-lg">Ainek</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/stores" className="text-sm text-white/60 hover:text-white transition">
            Магазины
          </Link>
          <Link href="/login" className="text-sm text-white/60 hover:text-white transition">
            Войти
          </Link>
          <Link
            href="/signup"
            className="text-sm px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 font-semibold hover:opacity-90 transition"
          >
            Открыть магазин
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center py-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-8">
          ✦ Виртуальная примерка на базе Gemini AI
        </div>

        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 max-w-3xl">
          Ваши покупатели{" "}
          <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
            примеряют одежду
          </span>{" "}
          не выходя из дома
        </h1>

        <p className="text-lg text-white/50 max-w-xl mb-10">
          Подключите виртуальную примерку к своему магазину за 2 минуты.
          Покупатели фотографируются — AI показывает как сидит одежда.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/signup"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 font-semibold text-lg hover:opacity-90 transition"
          >
            Начать бесплатно — 14 дней
          </Link>
          <Link
            href="/stores"
            className="px-8 py-4 rounded-xl border border-white/20 font-semibold text-lg hover:border-white/40 transition"
          >
            Посмотреть магазины
          </Link>
        </div>

        <p className="text-white/30 text-sm mt-4">
          Без кредитной карты · 50 примерок бесплатно
        </p>
      </main>

      {/* How it works */}
      <section className="px-6 py-20 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Как это работает</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Регистрируйте магазин", desc: "Создайте аккаунт, загрузите товары через CSV или вручную" },
              { step: "2", title: "Покупатель фотографируется", desc: "Прямо на странице товара через камеру телефона или ноутбука" },
              { step: "3", title: "AI показывает результат", desc: "Gemini генерирует реалистичное фото покупателя в вашей одежде за секунды" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-white/50 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-20 border-t border-white/10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Цены</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Trial", price: "Бесплатно", sub: "14 дней", features: ["50 примерок", "1 магазин", "Базовая аналитика"], cta: "Начать", href: "/signup", highlight: false },
              { name: "Starter", price: "2 900 сом", sub: "в месяц", features: ["500 примерок", "1 магазин", "Полная аналитика", "Поддержка"], cta: "Выбрать", href: "/signup", highlight: true },
              { name: "Business", price: "5 900 сом", sub: "в месяц", features: ["2 000 примерок", "3 магазина", "API доступ", "Белый лейбл"], cta: "Выбрать", href: "/signup", highlight: false },
            ].map((plan) => (
              <div key={plan.name} className={`p-6 rounded-2xl border ${plan.highlight ? "border-violet-500 bg-violet-500/10" : "border-white/10 bg-white/5"}`}>
                {plan.highlight && <div className="text-xs text-violet-400 font-semibold mb-3 uppercase tracking-widest">Популярный</div>}
                <h3 className="font-bold text-xl mb-1">{plan.name}</h3>
                <div className="mb-1">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-white/40 text-sm ml-1">{plan.sub}</span>
                </div>
                <ul className="space-y-2 my-6">
                  {plan.features.map((f) => (
                    <li key={f} className="text-sm text-white/70 flex items-center gap-2">
                      <span className="text-green-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={`block text-center py-2.5 rounded-xl font-semibold text-sm transition ${plan.highlight ? "bg-gradient-to-r from-violet-600 to-blue-600 hover:opacity-90" : "border border-white/20 hover:border-white/40"}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-8 py-6 text-center text-white/30 text-xs">
        © 2026 Ainek · Бишкек, Кыргызстан
      </footer>
    </div>
  )
}
