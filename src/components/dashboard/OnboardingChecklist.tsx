"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

interface ChecklistItem {
  label: string
  done: boolean
  hint: string
}

interface Props {
  items: ChecklistItem[]
  onboardingStatus: string
  onboardingError?: string | null
}

export default function OnboardingChecklist({
  items,
  onboardingStatus,
  onboardingError,
}: Props) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState("")

  async function retryProvisioning() {
    setError("")
    setSuccess("")

    const response = await fetch("/api/tenant/reprovision", { method: "POST" })
    const data = await response.json()

    if (!response.ok) {
      setError(data.error ?? "Не удалось повторить настройку")
      return
    }

    setSuccess("Настройка магазина завершена. Обновляем данные…")
    startTransition(() => router.refresh())
  }

  return (
    <section className="p-6 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-white font-semibold">Чеклист запуска магазина</h2>
          <p className="text-white/50 text-sm mt-1">
            Следим, чтобы пилот можно было запустить без ручных исправлений
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs bg-white/10 text-white/70 capitalize">
          {onboardingStatus}
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-start justify-between gap-4 rounded-lg border border-white/10 bg-black/10 px-4 py-3"
          >
            <div>
              <p className="text-white text-sm">{item.label}</p>
              <p className="text-white/40 text-xs mt-1">{item.hint}</p>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                item.done
                  ? "bg-green-500/20 text-green-400"
                  : "bg-yellow-500/20 text-yellow-300"
              }`}
            >
              {item.done ? "Готово" : "Нужно действие"}
            </span>
          </div>
        ))}
      </div>

      {onboardingStatus !== "ready" && (
        <div className={`mt-4 rounded-lg border p-4 ${
          onboardingStatus === "failed"
            ? "border-red-500/30 bg-red-500/10"
            : "border-yellow-500/30 bg-yellow-500/10"
        }`}>
          <p className={`text-sm font-medium ${onboardingStatus === "failed" ? "text-red-300" : "text-yellow-300"}`}>
            {onboardingStatus === "failed"
              ? "Автонастройка не завершилась"
              : onboardingStatus === "provisioning_store"
              ? "Настройка схемы магазина не завершена"
              : "Магазин ещё не настроен — нажмите кнопку ниже"}
          </p>
          {onboardingError && (
            <p className="text-red-300/80 text-xs mt-1 break-words">{onboardingError}</p>
          )}
          <button
            type="button"
            onClick={retryProvisioning}
            disabled={isPending}
            className={`mt-3 px-4 py-2 rounded-lg text-sm transition disabled:opacity-50 ${
              onboardingStatus === "failed"
                ? "bg-red-500/20 text-red-200 hover:bg-red-500/30"
                : "bg-yellow-500/20 text-yellow-200 hover:bg-yellow-500/30"
            }`}
          >
            {isPending ? "Настраиваем..." : "Настроить магазин"}
          </button>
        </div>
      )}

      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      {success && <p className="text-green-400 text-sm mt-3">{success}</p>}
    </section>
  )
}
