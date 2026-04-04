// CameraHandler.ts — utility functions for webcam and canvas operations

export interface CameraConstraints {
  width?: number;
  height?: number;
  facingMode?: "user" | "environment";
}

export async function startCamera(
  videoElement: HTMLVideoElement,
  constraints: CameraConstraints = {}
): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: constraints.width || 1280 },
      height: { ideal: constraints.height || 720 },
      facingMode: constraints.facingMode || "user",
    },
    audio: false,
  });
  videoElement.srcObject = stream;
  videoElement.setAttribute("playsinline", "true");
  await videoElement.play();
  return stream;
}

export function stopCamera(stream: MediaStream | null): void {
  if (!stream) return;
  stream.getTracks().forEach((track) => track.stop());
}

// Optimized capture: resize to max 1024px wide, JPEG quality 0.7
export function captureFrame(
  videoElement: HTMLVideoElement,
  maxWidth = 1024,
  quality = 0.7
): string {
  const srcW = videoElement.videoWidth || 1280;
  const srcH = videoElement.videoHeight || 720;

  const scale = Math.min(1, maxWidth / srcW);
  const w = Math.round(srcW * scale);
  const h = Math.round(srcH * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  // Mirror horizontally (selfie-mode)
  ctx.translate(w, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(videoElement, 0, 0, w, h);

  return canvas.toDataURL("image/jpeg", quality);
}

export async function tryOnOutfit(
  imageBase64: string,
  clothingName: string,
  clothingImageUrl: string
): Promise<{ generatedImage: string | null; text: string | null }> {
  const response = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64, clothingName, clothingImageUrl }),
  });

  if (!response.ok) {
    const error = await response.json();
    const err = new Error(error.error || "Failed to generate try-on") as Error & { status: number };
    err.status = response.status;
    throw err;
  }

  return response.json();
}

export function isCameraSupported(): boolean {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

export async function generateVideoTryOn(
  personPhotoBase64: string,
  clothingName: string,
  clothingImageBase64: string,
  motionType: string
): Promise<{
  referenceImage: string | null;
  video: string | null;
  veoError: string | null;
}> {
  const response = await fetch("/api/generate-video", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      personPhotoBase64,
      clothingName,
      clothingImageBase64,
      motionType,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    const err = new Error(error.error || "Failed to generate video") as Error & { status: number };
    err.status = response.status;
    throw err;
  }

  return response.json();
}