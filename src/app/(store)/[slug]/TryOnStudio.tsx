"use client"

import { useState, useRef, useEffect, useCallback } from "react"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StudioProduct {
  id: string
  name: string
  price: number | string
  currency?: string
  images?: Array<{ url: string; isPrimary?: boolean }>
  category?: string
  sizes?: string[]
  colors?: string[]
}

interface Props {
  products: StudioProduct[]
  tenant: { id: string; slug: string; name: string }
  /** Pre-selected items (loaded from a saved outfit) */
  preloadedItems?: StudioProduct[]
}

const CATEGORIES = [
  { key: "all",         label: "Все" },
  { key: "tops",        label: "Верх" },
  { key: "bottoms",     label: "Низ" },
  { key: "dresses",     label: "Платья" },
  { key: "shoes",       label: "Обувь" },
  { key: "accessories", label: "Акс." },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function getProductImage(product: StudioProduct): string | undefined {
  const imgs = product.images ?? []
  return (imgs.find((i) => i.isPrimary) ?? imgs[0])?.url
}

function formatPrice(price: number | string, currency?: string) {
  const num = typeof price === "string" ? parseFloat(price) : price
  return `${isNaN(num) ? price : num.toLocaleString("ru-RU")} ${currency ?? "сом"}`
}

// Resize base64 image to thumbnail (200×300, jpeg 0.65) — reduces stored size ~10×
function makeThumbnail(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = 200
      canvas.height = 300
      const ctx = canvas.getContext("2d")!
      // Cover-fit
      const scale = Math.max(200 / img.width, 300 / img.height)
      const w = img.width * scale
      const h = img.height * scale
      ctx.drawImage(img, (200 - w) / 2, (300 - h) / 2, w, h)
      resolve(canvas.toDataURL("image/jpeg", 0.65))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TryOnStudio({ products, tenant, preloadedItems }: Props) {

  // ── Step & photo ──────────────────────────────────────────────────────────
  const [step, setStep] = useState<"camera" | "studio">(
    preloadedItems && preloadedItems.length > 0 ? "camera" : "camera"
  )
  const [userPhoto, setUserPhoto] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [isMirrored, setIsMirrored] = useState(true)

  // ── Try-on ────────────────────────────────────────────────────────────────
  const [selectedItems, setSelectedItems] = useState<StudioProduct[]>(preloadedItems ?? [])
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // ── Wardrobe ──────────────────────────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState("all")
  const [wardrobeSearch, setWardrobeSearch] = useState("")

  // ── Refs ──────────────────────────────────────────────────────────────────
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const genTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevItemKeysRef = useRef<string>("")

  // ── Toast helper ──────────────────────────────────────────────────────────
  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  // ── Camera lifecycle ──────────────────────────────────────────────────────
  useEffect(() => {
    if (step !== "camera") return
    setCameraReady(false)
    setCameraError(null)

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        setCameraError(
          msg.includes("Permission") || msg.includes("NotAllowed")
            ? "Разрешите доступ к камере в настройках браузера"
            : "Не удалось открыть камеру"
        )
      }
    }

    startCamera()

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [step])

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")!
    if (isMirrored) {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85)
    setUserPhoto(dataUrl)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    setStep("studio")
  }

  // ── Auto-generate when selected items change ───────────────────────────────
  const generateOutfit = useCallback(async (photo: string, items: StudioProduct[]) => {
    if (!photo || items.length === 0) return
    setIsGenerating(true)
    setGenerateError(null)

    try {
      const res = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: photo,
          clothingItems: items.map((item) => ({
            productId: item.id,
            name: item.name,
            imageUrl: getProductImage(item),
          })),
          tenantId: tenant.id,
          tenantSlug: tenant.slug,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        const codeMsg: Record<string, string> = {
          USER_DAILY_LIMIT_REACHED: "Дневной лимит примерок исчерпан (5/день)",
          TENANT_QUOTA_EXCEEDED: "Магазин исчерпал месячный лимит примерок",
          UNAUTHORIZED: "Войдите, чтобы примерять",
        }
        setGenerateError(codeMsg[data.code] ?? data.message ?? "Ошибка генерации")
      } else {
        setGeneratedImage(data.generatedImage)
      }
    } catch {
      setGenerateError("Ошибка соединения. Проверьте интернет.")
    } finally {
      setIsGenerating(false)
    }
  }, [tenant.id, tenant.slug])

  useEffect(() => {
    if (step !== "studio" || !userPhoto) return

    const keys = selectedItems.map((i) => i.id).sort().join(",")
    if (keys === prevItemKeysRef.current) return
    prevItemKeysRef.current = keys

    if (selectedItems.length === 0) {
      setGeneratedImage(null)
      return
    }

    if (genTimeoutRef.current) clearTimeout(genTimeoutRef.current)
    genTimeoutRef.current = setTimeout(() => {
      generateOutfit(userPhoto, selectedItems)
    }, 400)

    return () => { if (genTimeoutRef.current) clearTimeout(genTimeoutRef.current) }
  }, [selectedItems, step, userPhoto, generateOutfit])

  // ── Item toggle ───────────────────────────────────────────────────────────
  function toggleItem(product: StudioProduct) {
    setSelectedItems((prev) => {
      if (prev.find((p) => p.id === product.id)) {
        return prev.filter((p) => p.id !== product.id)
      }
      return [...prev, product]
    })
  }

  function removeItem(productId: string) {
    setSelectedItems((prev) => prev.filter((p) => p.id !== productId))
  }

  // ── Cart ──────────────────────────────────────────────────────────────────
  async function addAllToCart() {
    if (selectedItems.length === 0) return
    await Promise.all(
      selectedItems.map((item) =>
        fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantId: tenant.id,
            tenantSlug: tenant.slug,
            productId: item.id,
            quantity: 1,
          }),
        })
      )
    )
    showToast(`${selectedItems.length} товар(а) добавлено в корзину`)
  }

  // ── Save outfit ───────────────────────────────────────────────────────────
  async function saveOutfit() {
    if (selectedItems.length === 0) return
    const thumbnail = generatedImage ? await makeThumbnail(generatedImage) : null

    const res = await fetch("/api/saved-outfits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId: tenant.id,
        storeSlug: tenant.slug,
        items: selectedItems,
        previewImageBase64: thumbnail,
      }),
    })

    if (res.ok) {
      showToast("Стиль сохранён в избранном ❤️")
    } else {
      const d = await res.json()
      showToast(d.message ?? "Не удалось сохранить стиль")
    }
  }

  // ── Filtered wardrobe ─────────────────────────────────────────────────────
  const filteredProducts = products.filter((p) => {
    const matchCat = activeCategory === "all" || p.category === activeCategory
    const matchSearch = wardrobeSearch === "" ||
      p.name.toLowerCase().includes(wardrobeSearch.toLowerCase())
    return matchCat && matchSearch
  })

  // ═════════════════════════════════════════════════════════════════════════════
  // RENDER — CAMERA STEP
  // ═════════════════════════════════════════════════════════════════════════════
  if (step === "camera") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-130px)] px-4 py-8">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-white mb-1">Сделайте фото</h2>
          <p className="text-white/50 text-sm">Встаньте прямо, руки вдоль тела. Лучше полный рост.</p>
        </div>

        {/* Camera preview */}
        <div className="relative w-full max-w-sm rounded-2xl overflow-hidden bg-black mb-6"
          style={{ aspectRatio: "3/4" }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onCanPlay={() => setCameraReady(true)}
            className={`w-full h-full object-cover ${isMirrored ? "[transform:scaleX(-1)]" : ""}`}
          />

          {/* Loading spinner */}
          {!cameraReady && !cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error state */}
          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black p-6 text-center">
              <div>
                <svg className="w-12 h-12 text-white/20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-white/60 text-sm">{cameraError}</p>
              </div>
            </div>
          )}

          {/* Silhouette guide */}
          {cameraReady && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <svg className="w-32 h-56 text-white/15" viewBox="0 0 80 140" fill="none" stroke="currentColor">
                <ellipse cx="40" cy="18" rx="14" ry="16" strokeWidth="1.5" />
                <path d="M26 34 C18 50 14 80 16 110 H64 C66 80 62 50 54 34" strokeWidth="1.5" />
                <path d="M26 34 C20 46 16 56 14 70" strokeWidth="1.5" />
                <path d="M54 34 C60 46 64 56 66 70" strokeWidth="1.5" />
                <path d="M28 110 L26 138" strokeWidth="1.5" />
                <path d="M52 110 L54 138" strokeWidth="1.5" />
              </svg>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Controls */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={capturePhoto}
            disabled={!cameraReady || !!cameraError}
            className="w-18 h-18 rounded-full border-4 border-white/30 flex items-center justify-center disabled:opacity-40 hover:border-white/60 transition active:scale-95"
            style={{ width: 72, height: 72 }}
          >
            <div className="w-14 h-14 rounded-full bg-white" />
          </button>

          <button
            onClick={() => setIsMirrored((m) => !m)}
            className="flex items-center gap-1.5 text-white/40 text-xs hover:text-white/60 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            {isMirrored ? "Зеркало вкл" : "Зеркало выкл"}
          </button>
        </div>
      </div>
    )
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // RENDER — STUDIO STEP
  // ═════════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex overflow-hidden" style={{ height: "calc(100vh - 65px)" }}>

      {/* ── LEFT PANEL: Try-on result ───────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-3 min-w-0 gap-2">

        {/* Result image area */}
        <div className="relative flex-1 rounded-2xl overflow-hidden bg-black/50 min-h-0">
          {(generatedImage || userPhoto) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={generatedImage ?? userPhoto ?? ""}
              alt="Примерка"
              className="w-full h-full object-contain"
              style={{ opacity: generatedImage ? 1 : 0.65 }}
            />
          )}

          {/* Generating overlay */}
          {isGenerating && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm gap-3">
              <div className="relative">
                <div className="w-14 h-14 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                <div className="absolute inset-2 border-2 border-blue-500/30 border-b-blue-500 rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
              </div>
              <p className="text-white/70 text-sm font-medium">Примеряем наряд…</p>
              <p className="text-white/40 text-xs">Gemini AI обрабатывает</p>
            </div>
          )}

          {/* Error */}
          {generateError && !isGenerating && (
            <div className="absolute bottom-3 left-3 right-3 bg-red-900/80 backdrop-blur-sm border border-red-500/40 rounded-xl px-4 py-2.5 text-red-300 text-sm text-center">
              {generateError}
            </div>
          )}

          {/* Empty hint */}
          {!isGenerating && !generatedImage && selectedItems.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center px-6">
                <svg className="w-10 h-10 text-white/10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <p className="text-white/20 text-sm">Выберите одежду →</p>
              </div>
            </div>
          )}

          {/* Retake */}
          <button
            onClick={() => { setStep("camera"); setGeneratedImage(null); prevItemKeysRef.current = "" }}
            className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white/60 text-xs hover:text-white transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Переснять
          </button>
        </div>

        {/* Selected items strip */}
        {selectedItems.length > 0 && (
          <div className="flex gap-2 overflow-x-auto py-0.5 flex-shrink-0">
            {selectedItems.map((item) => (
              <div key={item.id} className="relative flex-shrink-0 group/chip">
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-violet-500/50 bg-white/10">
                  {getProductImage(item) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getProductImage(item)} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 text-xs font-bold">
                      {item.name[0]}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center transition shadow-md"
                >
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={saveOutfit}
            disabled={selectedItems.length === 0}
            className="flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl border border-violet-500/40 text-violet-400 text-sm font-medium hover:bg-violet-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Сохранить стиль
          </button>
          <button
            onClick={addAllToCart}
            disabled={selectedItems.length === 0}
            className="flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            В корзину {selectedItems.length > 0 && `(${selectedItems.length})`}
          </button>
        </div>
      </div>

      {/* ── RIGHT PANEL: Wardrobe ───────────────────────────────────────────── */}
      <div className="w-64 lg:w-72 border-l border-white/10 flex flex-col flex-shrink-0 overflow-hidden">

        {/* Header */}
        <div className="px-3 py-2.5 border-b border-white/10 flex-shrink-0">
          <p className="text-white/50 text-[11px] font-semibold uppercase tracking-widest mb-2">Гардероб</p>
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={wardrobeSearch}
              onChange={(e) => setWardrobeSearch(e.target.value)}
              placeholder="Поиск..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 px-2 py-2 overflow-x-auto flex-shrink-0 border-b border-white/10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap font-medium transition ${
                activeCategory === cat.key
                  ? "bg-violet-600 text-white"
                  : "bg-white/10 text-white/60 hover:bg-white/15"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products grid */}
        <div className="flex-1 overflow-y-auto p-2 grid grid-cols-2 gap-2 content-start">
          {filteredProducts.length === 0 ? (
            <div className="col-span-2 py-10 text-center text-white/30 text-xs">
              Нет товаров
            </div>
          ) : (
            filteredProducts.map((product) => {
              const isSelected = selectedItems.some((p) => p.id === product.id)
              const imgUrl = getProductImage(product)

              return (
                <button
                  key={product.id}
                  onClick={() => toggleItem(product)}
                  className={`relative rounded-xl overflow-hidden transition-all text-left ${
                    isSelected
                      ? "ring-2 ring-violet-500 scale-[0.96]"
                      : "ring-1 ring-white/10 hover:ring-white/25 hover:scale-[0.98]"
                  }`}
                  style={{ aspectRatio: "3/4" }}
                >
                  {/* Product image */}
                  {imgUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imgUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <span className="text-white/20 text-xl font-bold">{product.name[0]}</span>
                    </div>
                  )}

                  {/* Info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2">
                    <p className="text-white text-[11px] font-semibold leading-tight truncate">{product.name}</p>
                    <p className="text-violet-300 text-[10px] mt-0.5">{formatPrice(product.price, product.currency)}</p>
                  </div>

                  {/* Selection checkmark */}
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center shadow">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              )
            })
          )}
        </div>

        {/* Footer: selected count */}
        {selectedItems.length > 0 && (
          <div className="border-t border-white/10 px-3 py-2 text-center flex-shrink-0">
            <p className="text-white/40 text-xs">
              Выбрано: <span className="text-violet-400 font-semibold">{selectedItems.length}</span>
            </p>
          </div>
        )}
      </div>

      {/* ── Toast notification ──────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium shadow-2xl animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  )
}
