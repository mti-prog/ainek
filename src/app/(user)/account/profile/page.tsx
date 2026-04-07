"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "")
      setLoading(false)
    })
  }, [])

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    setMessage("")
    setError("")

    if (newPassword !== confirmPassword) {
      setError("Пароли не совпадают")
      return
    }
    if (newPassword.length < 6) {
      setError("Минимум 6 символов")
      return
    }

    setSaving(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password: newPassword })

    if (err) {
      setError(err.message)
    } else {
      setMessage("Пароль успешно обновлён")
      setNewPassword("")
      setConfirmPassword("")
    }
    setSaving(false)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-white mb-8">Профиль</h1>

      {/* Account info */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-8">
        <p className="text-white/40 text-sm mb-1">Email</p>
        <p className="text-white font-medium">{email}</p>
      </div>

      {/* Change password */}
      <form onSubmit={handleUpdatePassword} className="space-y-4 mb-8">
        <h2 className="text-lg font-semibold text-white">Сменить пароль</h2>

        <div>
          <label className="block text-sm text-white/70 mb-1">Новый пароль</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-1">Повторите пароль</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-violet-500"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {message && <p className="text-green-400 text-sm">{message}</p>}

        <button
          type="submit"
          disabled={saving || !newPassword}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {saving ? "Сохранение..." : "Обновить пароль"}
        </button>
      </form>

      {/* Sign out */}
      <div className="border-t border-white/10 pt-6">
        <button
          onClick={handleSignOut}
          className="w-full py-3 rounded-xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition"
        >
          Выйти из аккаунта
        </button>
      </div>
    </div>
  )
}
