"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { X, Camera, RotateCcw, Download } from "lucide-react"

interface Product {
  id: string
  name: string
  imageUrl?: string
}

interface Props {
  product: Product
}

type Step = "idle" | "camera" | "countdown" | "generating" | "result" | "error"

export default function TryOnModal({ product }: Props) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>("idle")
  const [countdown, setCountdown] = useState(5)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState("")

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const close = useCallback(() => {
    stopCamera()
    setOpen(false)
    setStep("idle")
    setResultImage(null)
    setErrorMsg("")
    setCountdown(5)
  }, [stopCamera])

  async function startCamera() {
    setStep("camera")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 720, height: 960 },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch {
      setErrorMsg("Нет доступа к камере. Разрешите в настройках браузера.")
      setStep("error")
    }
  }

  function startCountdown() {
    setCountdown(5)
    setStep("countdown")
    let c = 5
    timerRef.current = setInterval(() => {
      c -= 1
      setCountdown(c)
      if (c <= 0) {
        if (timerRef.current) clearInterval(timerRef.current)
        captureAndGenerate()
      }
    }, 1000)
  }

  async function captureAndGenerate() {
    setStep("generating")
    stopCamera()

    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth || 720
    canvas.height = video.videoHeight || 960
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.scale(-1, 1)
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
    ctx.setTransform(1, 0, 0, 1, 0, 0)

    const imageBase64 = canvas.toDataURL("image/jpeg", 0.9)

    // Fetch clothing image as base64 if available
    let clothingImageUrl: string | undefined
    if (product.imageUrl) {
      try {
        const resp = await fetch(product.imageUrl)
        const blob = await resp.blob()
        clothingImageUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(blob)
        })
      } catch {
        // Use name-only fallback
      }
    }

    try {
      const res = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          clothingName: product.name,
          clothingImageUrl,
          productId: product.id,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.generatedImage) {
        throw new Error(data.error ?? "Не удалось сгенерировать примерку")
      }

      setResultImage(data.generatedImage)
      setStep("result")
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Ошибка генерации")
      setStep("error")
    }
  }

  function download() {
    if (!resultImage) return
    const a = document.createElement("a")
    a.href = resultImage
    a.download = `ainek-tryon-${product.id}.jpg`
    a.click()
  }

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [close])

  return (
    <>
      <button
        onClick={() => { setOpen(true); startCamera() }}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
      >
        <Camera size={18} />
        Примерить
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm bg-[#0e0e1a] rounded-2xl overflow-hidden border border-white/10">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <p className="text-sm font-medium text-white/80 truncate max-w-[240px]">
                {product.name}
              </p>
              <button onClick={close} className="text-white/40 hover:text-white transition">
                <X size={18} />
              </button>
            </div>

            {/* Camera / Result area */}
            <div className="relative aspect-[3/4] bg-black">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)", display: step === "camera" || step === "countdown" ? "block" : "none" }}
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />

              {step === "result" && resultImage && (
                <img src={resultImage} alt="Try-on result" className="w-full h-full object-cover" />
              )}

              {step === "generating" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60">
                  <div className="w-12 h-12 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                  <p className="text-white/70 text-sm">Генерируем примерку…</p>
                </div>
              )}

              {step === "countdown" && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-8xl font-bold text-white drop-shadow-2xl">{countdown}</span>
                </div>
              )}

              {step === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 bg-black/80">
                  <p className="text-red-400 text-sm text-center">{errorMsg}</p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/15 transition"
                  >
                    Попробовать снова
                  </button>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="p-4 flex gap-3">
              {(step === "camera") && (
                <button
                  onClick={startCountdown}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <Camera size={16} />
                  Сфотографироваться
                </button>
              )}

              {step === "result" && (
                <>
                  <button
                    onClick={() => { setResultImage(null); startCamera() }}
                    className="flex-1 py-3 rounded-xl bg-white/10 text-white hover:bg-white/15 transition flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={16} />
                    Ещё раз
                  </button>
                  <button
                    onClick={download}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:opacity-90 transition flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    Сохранить
                  </button>
                </>
              )}

              {(step === "generating" || step === "countdown") && (
                <button
                  onClick={close}
                  className="flex-1 py-3 rounded-xl bg-white/10 text-white/60 hover:bg-white/15 transition text-sm"
                >
                  Отмена
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
