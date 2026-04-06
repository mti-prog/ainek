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

// Capture exactly what the user sees on screen (respects object-fit: cover crop).
// This ensures the sent image matches the on-screen preview 1:1.
export function captureFrame(
  videoElement: HTMLVideoElement,
  quality = 0.85
): string {
  const srcW = videoElement.videoWidth || 1280;
  const srcH = videoElement.videoHeight || 720;

  // Size of the visible container (what the user actually sees)
  const containerW = videoElement.clientWidth || srcW;
  const containerH = videoElement.clientHeight || srcH;

  // object-fit: cover scale factor — the video is scaled so it fully covers the container
  const scale = Math.max(containerW / srcW, containerH / srcH);

  // The rendered video dimensions (larger than container on at least one axis)
  const renderedW = srcW * scale;
  const renderedH = srcH * scale;

  // Crop offsets in rendered-video space (centered)
  const cropX = (renderedW - containerW) / 2;
  const cropY = (renderedH - containerH) / 2;

  // Convert back to source-video coordinates for drawImage source rect
  const srcCropX = cropX / scale;
  const srcCropY = cropY / scale;
  const srcCropW = containerW / scale;
  const srcCropH = containerH / scale;

  // Output canvas matches exactly what was visible
  const canvas = document.createElement("canvas");
  canvas.width = containerW;
  canvas.height = containerH;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  // Mirror horizontally for front camera (selfie-mode) — matches the CSS scaleX(-1)
  ctx.translate(containerW, 0);
  ctx.scale(-1, 1);

  // Draw only the visible crop of the video
  ctx.drawImage(
    videoElement,
    srcCropX, srcCropY, srcCropW, srcCropH,  // source rect (what's visible)
    0, 0, containerW, containerH              // destination (full canvas)
  );

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

