"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface SavedOutfit {
  id: string
  store_id: string
  store_slug: string
  items: Array<{
    id: string
    name: string
    price: number | string
    currency?: string
    images?: Array<{ url: string; isPrimary?: boolean }>
    category?: string
  }>
  preview_image: string | null
  created_at: string
}

function getProductImage(product: SavedOutfit["items"][number]) {
  const imgs = product.images ?? []
  return (imgs.find((i) => i.isPrimary) ?? imgs[0])?.url
}

export default function WishlistPage() {
  const [outfits, setOutfits] = useState<SavedOutfit[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/saved-outfits")
      .then((r) => r.json())
      .then((d) => {
        setOutfits(d.outfits ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function deleteOutfit(id: string) {
    setDeletingId(id)
    await fetch(`/api/saved-outfits?id=${id}`, { method: "DELETE" })
    setOutfits((prev) => prev.filter((o) => o.id !== id))
    setDeletingId(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Сохранённые стили</h1>
          <p className="text-white/40 text-sm mt-0.5">Ваши любимые комбинации одежды</p>
        </div>
        {outfits.length > 0 && (
          <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 text-sm font-medium">
            {outfits.length} {outfits.length === 1 ? "стиль" : outfits.length < 5 ? "стиля" : "стилей"}
          </span>
        )}
      </div>

      {outfits.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-white/40 text-lg font-medium mb-2">Нет сохранённых стилей</p>
          <p className="text-white/25 text-sm mb-6">
            Выберите одежду в магазине и нажмите «Сохранить стиль»
          </p>
          <Link
            href="/stores"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold hover:opacity-90 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H7m0 0l5-5m-5 5l5 5" />
            </svg>
            Перейти к магазинам
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {outfits.map((outfit) => (
            <div
              key={outfit.id}
              className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden group"
            >
              {/* Preview + items mosaic */}
              <div className="relative h-52 bg-black/40 overflow-hidden">
                {outfit.preview_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={outfit.preview_image}
                    alt="Стиль"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  /* Mosaic of product images if no generated preview */
                  <div className={`grid h-full gap-0.5 ${
                    outfit.items.length === 1 ? "grid-cols-1" :
                    outfit.items.length === 2 ? "grid-cols-2" : "grid-cols-3"
                  }`}>
                    {outfit.items.slice(0, 3).map((item, i) => {
                      const imgUrl = getProductImage(item)
                      return (
                        <div key={i} className="relative overflow-hidden bg-white/5">
                          {imgUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={imgUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20 font-bold text-lg">
                              {item.name[0]}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#06060f] via-transparent to-transparent" />

                {/* Item count badge */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white/70 text-xs font-medium border border-white/10">
                  {outfit.items.length} {outfit.items.length === 1 ? "вещь" : outfit.items.length < 5 ? "вещи" : "вещей"}
                </div>

                {/* Store badge */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-violet-600/80 backdrop-blur-sm text-white text-xs font-medium">
                  {outfit.store_slug}
                </div>
              </div>

              {/* Item chips */}
              <div className="px-3 pt-2 pb-1">
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {outfit.items.map((item) => {
                    const imgUrl = getProductImage(item)
                    return (
                      <div
                        key={item.id}
                        className="flex-shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/10 border border-white/10 max-w-[120px]"
                      >
                        {imgUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={imgUrl} alt="" className="w-5 h-5 rounded object-cover flex-shrink-0" />
                        )}
                        <span className="text-white/70 text-xs truncate">{item.name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="px-3 pb-3 pt-1 flex gap-2">
                {/* Re-try-on this outfit */}
                <Link
                  href={`/${outfit.store_slug}?preload=${outfit.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-xs font-semibold hover:opacity-90 transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                  </svg>
                  Примерить снова
                </Link>

                {/* Date */}
                <div className="flex items-center text-white/25 text-[10px] px-2">
                  {new Date(outfit.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                </div>

                {/* Delete */}
                <button
                  onClick={() => deleteOutfit(outfit.id)}
                  disabled={deletingId === outfit.id}
                  className="flex items-center justify-center w-9 h-9 rounded-xl border border-white/10 text-white/30 hover:text-red-400 hover:border-red-500/30 transition disabled:opacity-40"
                >
                  {deletingId === outfit.id ? (
                    <div className="w-3.5 h-3.5 border border-white/40 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
