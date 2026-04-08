"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // `next` only used if explicitly passed (e.g. from a store page)
  const next = searchParams.get("next") ?? ""

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "Неверный email или пароль"
          : signInError.message
      )
      setLoading(false)
      return
    }

    // If a specific next URL was given, use it
    if (next) {
      router.push(next)
      router.refresh()
      return
    }

    // Otherwise detect role: owner → dashboard, buyer → stores
    try {
      const res = await fetch("/api/me/role")
      const { role } = await res.json()
      router.push(role === "owner" ? "/dashboard" : "/stores")
    } catch {
      router.push("/stores")
    }
    router.refresh()
  }

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
      <div className="mb-8 text-center">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white font-bold mx-auto mb-3">
          A
        </div>
        <h1 className="text-2xl font-bold text-white">Войти в Ainek</h1>
        <p className="text-white/50 text-sm mt-1">Магазины, примерки, заказы</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-white/70 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-violet-500 transition"
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
            autoComplete="current-password"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-violet-500 transition"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Входим...
            </>
          ) : "Войти"}
        </button>
      </form>

      <p className="text-center text-white/50 text-sm mt-6">
        Нет аккаунта?{" "}
        <Link href="/register" className="text-violet-400 hover:underline">
          Зарегистрироваться
        </Link>
      </p>

      <div className="mt-4 pt-4 border-t border-white/10 text-center">
        <p className="text-white/30 text-xs mb-2">Владелец магазина?</p>
        <Link href="/signup" className="text-violet-400 text-xs hover:underline">
          Подключить магазин к Ainek →
        </Link>
      </div>
    </div>
  )
}
