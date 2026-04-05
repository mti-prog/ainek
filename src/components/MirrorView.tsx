"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Camera, CameraOff, Zap, RefreshCw, ShoppingBag, X, AlertCircle, Download, Wand2, FlipHorizontal, Video, ImageIcon } from "lucide-react";
import { startCamera, stopCamera, captureFrame, tryOnOutfit, generateVideoTryOn } from "@/lib/CameraHandler";
import { MOTION_LABELS } from "@/lib/motionTypes";
import Sidebar, { type UserProduct } from "./Sidebar";

type FittingState = "idle" | "countdown" | "capturing" | "processing" | "processing_video" | "result" | "result_video" | "error" | "style_picking";

export default function MirrorView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const countdownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const [selectedProducts, setSelectedProducts] = useState<UserProduct[]>([]);
  const [fittingState, setFittingState] = useState<FittingState>("idle");
  const [countdown, setCountdown] = useState(5);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [resultVisible, setResultVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [styleResult, setStyleResult] = useState<string | null>(null);
  const [videoMode, setVideoMode] = useState(false);
  const [motionType, setMotionType] = useState("turn360");

  useEffect(() => {
    initCamera(facingMode);
    return () => {
      stopCamera(streamRef.current);
      if (countdownRef.current) clearTimeout(countdownRef.current);
    };
  }, []);

  const initCamera = async (mode: "user" | "environment") => {
    if (!videoRef.current) return;
    stopCamera(streamRef.current);
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      videoRef.current.srcObject = stream;
      videoRef.current.setAttribute("playsinline", "true");
      await videoRef.current.play();
      streamRef.current = stream;
      setCameraActive(true);
    } catch (err) {
      setCameraError("Не удалось получить доступ к камере.");
      console.error("Camera error:", err);
    }
  };

  const handleFlipCamera = () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
    initCamera(newMode);
  };

  const startCountdownAndShoot = useCallback((products: UserProduct[], mode: "tryon" | "style" | "video") => {
    if (!videoRef.current || !cameraActive) return;
    setGeneratedImage(null);
    setGeneratedVideo(null);
    setResultVisible(false);
    setErrorMessage(null);
    setFittingState("countdown");
    setCountdown(5);

    let current = 5;
    const tick = () => {
      current -= 1;
      if (current > 0) {
        setCountdown(current);
        countdownRef.current = setTimeout(tick, 1000);
      } else {
        setFittingState("capturing");
        setTimeout(async () => {
          try {
            const snapshot = captureFrame(videoRef.current!);
            setFittingState("processing");

            if (mode === "video") {
              setFittingState("processing");
              const outfitNames = products.map(p => p.name).join(", ");
              // After ~5s the reference frame is done; show video-specific loading
              setTimeout(() => setFittingState("processing_video"), 5000);
              const result = await generateVideoTryOn(
                snapshot,
                outfitNames,
                products[0].imageUrl,
                motionType
              );
              if (result.video) {
                setGeneratedVideo(result.video);
                if (result.referenceImage) setGeneratedImage(result.referenceImage);
                setFittingState("result_video");
                setTimeout(() => setResultVisible(true), 50);
              } else if (result.referenceImage) {
                setGeneratedImage(result.referenceImage);
                setFittingState("result");
                setTimeout(() => setResultVisible(true), 50);
                if (result.veoError) {
                  setErrorMessage(`Video unavailable: ${result.veoError}. Showing try-on image instead.`);
                }
              } else {
                throw new Error("Не удалось сгенерировать видео или изображение");
              }
            } else if (mode === "style") {
              setFittingState("style_picking");
              // Build outfit description from all wardrobe items
              const categories = ["hat", "top", "bottom", "shoes", "glasses", "suit", "dress"];
              const byCategory: Record<string, UserProduct[]> = {};
              products.forEach(p => {
                if (!byCategory[p.category]) byCategory[p.category] = [];
                byCategory[p.category].push(p);
              });

              // Pick one random from each category
              const chosen: UserProduct[] = [];
              categories.forEach(cat => {
                const items = byCategory[cat];
                if (items && items.length > 0) {
                  chosen.push(items[Math.floor(Math.random() * items.length)]);
                }
              });

              if (chosen.length === 0) throw new Error("Добавьте одежду в гардероб");

              const result = await tryOnOutfit(snapshot, chosen.map(p => p.name).join(", "), chosen[0].imageUrl);
              if (result.generatedImage) {
                setGeneratedImage(result.generatedImage);
                setSelectedProducts(chosen);
                setFittingState("result");
                setTimeout(() => setResultVisible(true), 50);
              } else {
                throw new Error("Изображение не сгенерировано");
              }
            } else {
              // Multi try-on (image)
              const outfitNames = products.map(p => p.name).join(", ");
              const result = await tryOnOutfit(snapshot, outfitNames, products[0].imageUrl);
              if (result.generatedImage) {
                setGeneratedImage(result.generatedImage);
                setFittingState("result");
                setTimeout(() => setResultVisible(true), 50);
              } else {
                throw new Error("Изображение не сгенерировано");
              }
            }
          } catch (err) {
            setFittingState("error");
            setErrorMessage(err instanceof Error ? err.message : "Ошибка генерации");
          }
        }, 200);
      }
    };
    countdownRef.current = setTimeout(tick, 1000);
  }, [cameraActive, motionType]);

  // Single product select
  const handleSelectProduct = useCallback((product: UserProduct) => {
    setSelectedProducts([product]);
    startCountdownAndShoot([product], videoMode ? "video" : "tryon");
  }, [startCountdownAndShoot, videoMode]);

  // Multi product select
  const handleMultiSelect = useCallback((products: UserProduct[]) => {
    setSelectedProducts(products);
    startCountdownAndShoot(products, videoMode ? "video" : "tryon");
  }, [startCountdownAndShoot, videoMode]);

  // AI style picker
  const handleStylePick = useCallback((allProducts: UserProduct[]) => {
    setSelectedProducts([]);
    startCountdownAndShoot(allProducts, "style");
  }, [startCountdownAndShoot]);

  const handleReset = () => {
    if (countdownRef.current) clearTimeout(countdownRef.current);
    setResultVisible(false);
    setTimeout(() => {
      setGeneratedImage(null);
      setGeneratedVideo(null);
      setFittingState("idle");
      setSelectedProducts([]);
      setErrorMessage(null);
      setCountdown(5);
      setStyleResult(null);
    }, 400);
  };

  const handleDownload = () => {
    if (generatedVideo) {
      const a = document.createElement("a");
      a.href = generatedVideo;
      a.download = `ainek_video_${Date.now()}.mp4`;
      a.click();
    } else if (generatedImage) {
      const a = document.createElement("a");
      a.href = generatedImage;
      a.download = `ainek_${Date.now()}.jpg`;
      a.click();
    }
  };

  const isProcessing = fittingState === "capturing" || fittingState === "processing" || fittingState === "processing_video" || fittingState === "style_picking";
  const isCountdown = fittingState === "countdown";
  const isVideoResult = fittingState === "result_video";
  const hasResult = fittingState === "result" || fittingState === "result_video";

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: "#06060f" }}>
      {/* AMBIENT GLOW */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full opacity-8"
          style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      {/* VIDEO */}
      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full"
        style={{
          objectFit: "cover",
          transform: facingMode === "user" ? "scaleX(-1)" : "none",
          filter: cameraActive ? "brightness(0.85) contrast(1.05)" : "none",
        }} />

      {/* NO CAMERA */}
      {!cameraActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
          <div className="w-32 h-32 rounded-full flex items-center justify-center"
            style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <CameraOff size={48} className="text-violet-400/60" />
          </div>
          <p className="text-white/60 text-lg">{cameraError || "Инициализация камеры..."}</p>
          {cameraError && (
            <button onClick={() => initCamera(facingMode)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)" }}>
              <RefreshCw size={16} /> Повторить
            </button>
          )}
        </div>
      )}

      {/* RESULT OVERLAY — image */}
      {generatedImage && !isVideoResult && (
        <div className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: resultVisible ? 1 : 0 }}>
          <Image src={generatedImage} alt="Try-on result" fill className="object-cover" sizes="100vw" priority unoptimized />
          <div className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)" }} />
        </div>
      )}

      {/* RESULT OVERLAY — video */}
      {generatedVideo && isVideoResult && (
        <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-in-out"
          style={{ opacity: resultVisible ? 1 : 0, background: "#06060f" }}>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src={generatedVideo}
            autoPlay
            loop
            playsInline
            muted
            className="h-full w-auto max-w-full"
            style={{ objectFit: "contain" }}
          />
          {/* Video badge */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full z-10"
            style={{ background: "rgba(139,92,246,0.3)", border: "1px solid rgba(139,92,246,0.5)", backdropFilter: "blur(8px)" }}>
            <Video size={11} className="text-violet-300" />
            <span className="text-violet-200 text-[10px] font-medium tracking-wider uppercase">
              {MOTION_LABELS[motionType]?.icon} {MOTION_LABELS[motionType]?.label}
            </span>
          </div>
        </div>
      )}

      {/* COUNTDOWN */}
      {isCountdown && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 z-10"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}>
          <div className="relative flex items-center justify-center">
            <svg className="absolute" width="200" height="200" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(139,92,246,0.2)" strokeWidth="4" />
              <circle cx="100" cy="100" r="90" fill="none" stroke="#8b5cf6" strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - countdown / 5)}`}
                strokeLinecap="round" transform="rotate(-90 100 100)"
                style={{ transition: "stroke-dashoffset 0.8s ease-in-out", filter: "drop-shadow(0 0 8px #8b5cf6)" }} />
            </svg>
            <span className="text-white font-bold"
              style={{ fontSize: "96px", lineHeight: 1, fontFamily: "'Playfair Display', serif",
                textShadow: "0 0 40px rgba(139,92,246,0.8)" }}>{countdown}</span>
          </div>
          <div className="text-center">
            <p className="text-white text-2xl font-medium mb-2">Примите позу!</p>
            {selectedProducts.length > 0 && (
              <p className="text-violet-300/80 text-sm">
                {selectedProducts.length === 1
                  ? selectedProducts[0].name
                  : `${selectedProducts.length} вещей для примерки`}
              </p>
            )}
          </div>
          <button onClick={handleReset}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-white/60 text-sm"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <X size={16} /> Отмена
          </button>
        </div>
      )}

      {/* PROCESSING */}
      {isProcessing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="relative w-56 h-56">
            <div className="absolute inset-0 rounded-full border-2 animate-spin"
              style={{ borderColor: "rgba(139,92,246,0.3) rgba(139,92,246,0.3) #8b5cf6 rgba(139,92,246,0.3)" }} />
            <div className="absolute inset-6 rounded-full border animate-spin"
              style={{ borderColor: "rgba(59,130,246,0.3) #3b82f6 rgba(59,130,246,0.3) rgba(59,130,246,0.3)",
                animationDirection: "reverse", animationDuration: "1.5s" }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              {fittingState === "style_picking"
                ? <Wand2 size={32} className="text-violet-400" style={{ filter: "drop-shadow(0 0 8px #8b5cf6)" }} />
                : fittingState === "processing_video"
                ? <Video size={32} className="text-violet-400" style={{ filter: "drop-shadow(0 0 8px #8b5cf6)" }} />
                : <Zap size={32} className="text-violet-400" style={{ filter: "drop-shadow(0 0 8px #8b5cf6)" }} />}
              <p className="text-white text-xs tracking-widest uppercase">
                {fittingState === "style_picking" ? "AI Стилист"
                  : fittingState === "processing_video" ? "Veo Video"
                  : "AI Примерка"}
              </p>
            </div>
            <div className="absolute left-0 right-0 h-0.5 animate-scan"
              style={{ background: "linear-gradient(90deg, transparent, #8b5cf6, transparent)",
                boxShadow: "0 0 12px #8b5cf6" }} />
          </div>
          <div className="text-center">
            <p className="text-white font-medium text-lg">
              {fittingState === "capturing" ? "Захват кадра..."
                : fittingState === "style_picking" ? "Подбираем образ..."
                : fittingState === "processing_video" ? "Генерация видео..."
                : "Генерация образа..."}
            </p>
            {fittingState === "processing_video" && (
              <p className="text-violet-300/70 text-sm mt-1">~20–30 секунд</p>
            )}
            {selectedProducts.length > 1 && fittingState !== "processing_video" && (
              <p className="text-violet-300/70 text-sm mt-1">{selectedProducts.length} вещей</p>
            )}
          </div>
        </div>
      )}

      {/* ERROR */}
      {(fittingState === "error" || (hasResult && errorMessage)) && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl max-w-sm"
            style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
              backdropFilter: "blur(12px)" }}>
            <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">{errorMessage || "Ошибка генерации."}</p>
            <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-300 ml-2"><X size={16} /></button>
          </div>
        </div>
      )}

      {/* MIRROR FRAME */}
      {cameraActive && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {["top-6 left-6 border-t border-l","top-6 right-6 border-t border-r",
            "bottom-6 left-6 border-b border-l","bottom-6 right-6 border-b border-r"].map((cls, i) => (
            <div key={i} className={`absolute w-10 h-10 ${cls}`}
              style={{ borderColor: "rgba(139,92,246,0.4)" }} />
          ))}
        </div>
      )}

      {/* TOP BAR */}
      <div className="absolute top-0 left-0 right-0 z-20"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.75), transparent)" }}>
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)" }}>
              <span className="text-white font-bold text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>A</span>
            </div>
            <span className="text-white text-xl font-semibold hidden sm:block"
              style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "0.2em" }}>AINEK</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Video / Image mode toggle */}
            <button
              onClick={() => { setVideoMode(!videoMode); handleReset(); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-medium transition-all"
              style={{
                background: videoMode
                  ? "linear-gradient(135deg, rgba(139,92,246,0.9), rgba(59,130,246,0.9))"
                  : "rgba(255,255,255,0.08)",
                border: videoMode ? "1px solid rgba(139,92,246,0.6)" : "1px solid rgba(255,255,255,0.1)",
                boxShadow: videoMode ? "0 0 12px rgba(139,92,246,0.4)" : "none",
              }}>
              {videoMode ? <Video size={13} /> : <ImageIcon size={13} />}
              <span className="hidden sm:inline">{videoMode ? "Video" : "Photo"}</span>
            </button>
            {/* Flip camera button */}
            <button onClick={handleFlipCamera}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white/70 text-xs"
              style={{ background: "rgba(255,255,255,0.08)" }}>
              <FlipHorizontal size={14} />
              <span className="hidden sm:inline">{facingMode === "user" ? "Задняя" : "Передняя"}</span>
            </button>
            {cameraActive && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.08)" }}>
                <Camera size={12} className="text-emerald-400" />
                <span className="text-white/60 text-xs hidden sm:inline">Камера активна</span>
              </div>
            )}
          </div>
        </div>

        {/* MOTION TYPE SELECTOR — shown only in video mode when idle/result */}
        {videoMode && (fittingState === "idle" || hasResult) && (
          <div className="flex items-center gap-1.5 px-5 pb-3 overflow-x-auto scrollbar-hide">
            {Object.entries(MOTION_LABELS).map(([key, { label, icon }]) => (
              <button
                key={key}
                onClick={() => setMotionType(key)}
                className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: motionType === key
                    ? "linear-gradient(135deg, rgba(139,92,246,0.8), rgba(59,130,246,0.8))"
                    : "rgba(255,255,255,0.07)",
                  color: motionType === key ? "#fff" : "rgba(255,255,255,0.45)",
                  border: motionType === key ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.08)",
                }}>
                {icon} {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM BAR */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-5 pb-20 md:pb-6 pt-4"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)" }}>
        {fittingState === "idle" && (
          <p className="text-white/30 text-sm tracking-wider hidden md:block">
            {videoMode ? `🎬 Video mode — select outfit to generate video` : "Выберите одежду в панели справа →"}
          </p>
        )}
        {hasResult && (
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handleReset}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-white/80 text-sm font-medium"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <RefreshCw size={15} /> Другой образ
            </button>
            <button onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-medium"
              style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.3)" }}>
              <Download size={15} /> {isVideoResult ? "Скачать MP4" : "Скачать"}
            </button>
            {selectedProducts.length > 0 && selectedProducts[0].price && (
              <button className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-medium ml-auto"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                  boxShadow: "0 4px 20px rgba(139,92,246,0.4)" }}>
                <ShoppingBag size={15} /> {selectedProducts[0].price}
              </button>
            )}
          </div>
        )}
      </div>

      {/* SIDEBAR */}
      <Sidebar
        onSelectProduct={handleSelectProduct}
        onMultiSelect={handleMultiSelect}
        onStylePick={handleStylePick}
        selectedProducts={selectedProducts}
        isLoading={isProcessing || isCountdown}
        generatedImage={generatedImage}
      />

      <style jsx global>{`
        @keyframes scan {
          0% { top: 10%; } 50% { top: 90%; } 100% { top: 10%; }
        }
        .animate-scan { animation: scan 2s ease-in-out infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}