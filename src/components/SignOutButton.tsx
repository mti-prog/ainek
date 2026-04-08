"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function SignOutButton({ className }: { className?: string }) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className={className ?? "text-sm text-white/40 hover:text-white/70 transition"}
    >
      Выйти
    </button>
  )
}
