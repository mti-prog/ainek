"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/account/orders"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [needsConfirm, setNeedsConfirm] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })

    if (signUpError) {
      setError(
        signUpError.message === "User already registered"
          ? "Этот email уже зарегистрирован. Войдите в аккаунт."
          : signUpError.message
      )
      setLoading(false)
      return
    }

    // If session is set immediately — email confirmation is disabled in Supabase
    if (data.session) {
      router.push(next)
      router.refresh()
      return
    }

    // Email confirmation is required
    setNeedsConfirm(true)
    setLoading(false)
  }

  if (needsConfirm) {
    return (
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
        <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Проверьте почту</h2>
        <p className="text-white/60 text-sm mb-2">
          Мы отправили письмо на <span className="text-violet-400">{email}</span>
        </p>
        <p className="text-white/40 text-xs mb-6">
          Нажмите на ссылку в письме чтобы подтвердить аккаунт и войти.
        </p>
        <button
          onClick={() => setNeedsConfirm(false)}
          className="text-violet-400 text-sm hover:underline"
        >
          Изменить email
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Ainek</h1>
        <p className="text-white/60">Создайте аккаунт покупателя</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-white/70 mb-1">Имя</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-violet-500"
            placeholder="Айгерим"
          />
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-violet-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-1">Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-violet-500"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Создаём аккаунт..." : "Зарегистрироваться"}
        </button>
      </form>

      <p className="text-center text-white/50 text-sm mt-6">
        Уже есть аккаунт?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-violet-400 hover:underline">
          Войти
        </Link>
      </p>

      <div className="mt-4 pt-4 border-t border-white/10 text-center">
        <p className="text-white/30 text-xs mb-1">Владелец магазина?</p>
        <Link href="/signup" className="text-violet-400 text-xs hover:underline">
          Подключить магазин →
        </Link>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
