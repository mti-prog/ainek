"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

export default function StoreSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    startTransition(() => {
      const url = val.trim() ? `/stores?q=${encodeURIComponent(val.trim())}` : "/stores"
      router.replace(url)
    })
  }

  return (
    <div className="relative mb-8">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        {isPending ? (
          <span className="w-4 h-4 border-2 border-violet-500/50 border-t-violet-500 rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
      </div>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Поиск магазина по названию или городу..."
        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition"
      />
      {query && (
        <button
          onClick={() => { setQuery(""); router.replace("/stores") }}
          className="absolute inset-y-0 right-4 flex items-center text-white/30 hover:text-white/60 transition"
        >
          ✕
        </button>
      )}
    </div>
  )
}
