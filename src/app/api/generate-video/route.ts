import { GoogleGenAI, Modality } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { MOTION_PROMPTS } from "@/lib/motionTypes";

// Allow up to 5 minutes for video generation polling
export const maxDuration = 300;

const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
  process.env.GEMINI_API_KEY,
].filter(Boolean) as string[];

let currentKeyIndex = 0;
function getAI() {
  return new GoogleGenAI({ apiKey: API_KEYS[currentKeyIndex] || "" });
}
function getCurrentKey() {
  return API_KEYS[currentKeyIndex] || "";
}
function rotateKey() {
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
}


async function generateReferenceFrame(
  ai: GoogleGenAI,
  personData: string,
  clothingImageBase64: string | null,
  clothingName: string
): Promise<string> {
  const parts: object[] = [
    { inlineData: { mimeType: "image/jpeg", data: personData } },
  ];

  if (clothingImageBase64 && clothingImageBase64.startsWith("data:image/")) {
    const clothingData = clothingImageBase64.replace(/^data:image\/\w+;base64,/, "");
    parts.push({ inlineData: { mimeType: "image/jpeg", data: clothingData } });
    parts.push({
      text: `You are a professional AI fashion photographer specializing in photorealistic virtual try-on (VTON).

INPUTS:
- Image 1: Real photo of a person — source of body, pose, lighting, background
- Image 2: Clothing product photo — source of garment design, color, texture

TASK: Dress the person from Image 1 in the clothing from Image 2.

PERSON (preserve exactly):
- Face, skin tone, hair, body proportions — unchanged
- Camera angle, pose, framing — unchanged
- Background and environment — unchanged

CLOTHING INTEGRATION:
- Garment must conform to the body naturally
- Fabric drapes with gravity: natural folds, creases
- Prints and logos wrap around body contours — 3D distortion, not flat paste

LIGHTING & SHADOWS:
- Match light source direction and color temperature from Image 1
- Apply diffuse shading, highlights, and contact shadows
- The garment must have depth — never flat or uniformly lit

COLOR TONE MATCHING:
- Match garment brightness/exposure to Image 1
- Apply same color grade and tone curve as the rest of the image
- The garment must look photographed in the same conditions

OUTPUT: One photorealistic portrait image. Full body visible. Person wearing the garment. Indistinguishable from a real photo.`,
    });
  } else {
    parts.push({
      text: `You are a professional AI fashion photographer specializing in photorealistic virtual try-on (VTON).

INPUT: Real photo of a person. Clothing to apply: "${clothingName}"

TASK: Dress the person in "${clothingName}".

PERSON (preserve exactly):
- Face, skin tone, hair, body proportions — unchanged
- Camera angle, pose, framing — unchanged
- Background and environment — unchanged

CLOTHING INTEGRATION:
- Garment conforms naturally to the body
- Fabric drapes with gravity: natural folds and creases
- Full body visible in the output

LIGHTING & SHADOWS:
- Match the light source direction and color temperature from the photo
- Apply proper shading, highlights, and contact shadows
- Garment must have depth — never flat

COLOR TONE MATCHING:
- Match garment brightness to the overall photo exposure
- Apply same color grade as the rest of the image

OUTPUT: One photorealistic portrait image, full body visible. Person wearing "${clothingName}". Indistinguishable from a real photo.`,
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: [{ role: "user", parts: parts as never }],
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
      temperature: 0.2,
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData?.mimeType?.startsWith("image/") && part.inlineData.data) {
      return part.inlineData.data; // raw base64, no prefix
    }
  }
  throw new Error("Gemini did not return a reference frame image");
}

async function generateVeoVideo(
  ai: GoogleGenAI,
  referenceFrameBase64: string,
  clothingName: string,
  motionType: string
): Promise<string> {
  const motionDescription = MOTION_PROMPTS[motionType] || MOTION_PROMPTS.turn360;
  const outfitDescription = clothingName || "the outfit";

  const prompt = `Fashion virtual try-on video. The person is wearing ${outfitDescription}. ${motionDescription} The outfit fits naturally with realistic fabric physics and gravity. The person's face and identity remain 100% consistent throughout. Photorealistic, fashion editorial quality. Lighting is consistent with the reference frame.`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let operation = await (ai.models as any).generateVideo({
    model: "veo-2.0-generate-001",
    prompt,
    image: {
      imageBytes: referenceFrameBase64,
      mimeType: "image/jpeg",
    },
    config: {
      aspectRatio: "9:16",
      numberOfVideos: 1,
      durationSeconds: 8,
    },
  });

  // Poll until complete (max 4 minutes)
  const maxWait = 240_000;
  const pollInterval = 10_000;
  const startTime = Date.now();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  while (!(operation as any).done) {
    if (Date.now() - startTime > maxWait) {
      throw new Error("Video generation timed out after 4 minutes");
    }
    await new Promise((r) => setTimeout(r, pollInterval));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    operation = await (ai.operations as any).getVideosOperation({ operation });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const op = operation as any;
  const generatedVideos = op.response?.generatedVideos as Array<{
    video?: { uri?: string; videoBytes?: string };
  }> | undefined;

  if (!generatedVideos?.length) {
    throw new Error("Veo returned no videos");
  }

  const video = generatedVideos[0].video;

  // Case 1: inline bytes (base64 string)
  if (video?.videoBytes) {
    return `data:video/mp4;base64,${video.videoBytes}`;
  }

  // Case 2: URI — fetch and proxy back
  if (video?.uri) {
    const apiKey = getCurrentKey();
    const separator = video.uri.includes("?") ? "&" : "?";
    const fetchUrl = `${video.uri}${separator}key=${apiKey}`;
    const videoFetch = await fetch(fetchUrl);
    if (!videoFetch.ok) {
      throw new Error(`Failed to fetch video from URI: ${videoFetch.status}`);
    }
    const buffer = await videoFetch.arrayBuffer();
    const b64 = Buffer.from(buffer).toString("base64");
    return `data:video/mp4;base64,${b64}`;
  }

  throw new Error("Veo video has neither URI nor inline bytes");
}

export async function POST(req: NextRequest) {
  try {
    const {
      personPhotoBase64,
      clothingName,
      clothingImageBase64,
      motionType = "turn360",
    } = await req.json();

    if (!personPhotoBase64) {
      return NextResponse.json({ error: "No person photo provided" }, { status: 400 });
    }
    if (API_KEYS.length === 0) {
      return NextResponse.json({ error: "No API keys configured" }, { status: 500 });
    }

    const ai = getAI();
    const personData = personPhotoBase64.replace(/^data:image\/\w+;base64,/, "");

    // ── STEP 1: Generate reference frame via Gemini ──
    let referenceFrameBase64: string;
    try {
      referenceFrameBase64 = await generateReferenceFrame(
        ai,
        personData,
        clothingImageBase64 || null,
        clothingName || ""
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) rotateKey();
      return NextResponse.json(
        { error: "Failed to generate reference frame", details: msg },
        { status: 500 }
      );
    }

    // ── STEP 2: Generate video via Veo ──
    let videoDataUrl: string | null = null;
    let veoError: string | null = null;

    try {
      videoDataUrl = await generateVeoVideo(
        ai,
        referenceFrameBase64,
        clothingName || "",
        motionType
      );
    } catch (err) {
      veoError = err instanceof Error ? err.message : String(err);
      console.warn("Veo generation failed, falling back to image:", veoError);
    }

    return NextResponse.json({
      success: true,
      referenceImage: `data:image/jpeg;base64,${referenceFrameBase64}`,
      video: videoDataUrl,
      veoError,
    });
  } catch (error) {
    console.error("generate-video error:", error);
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) rotateKey();
    return NextResponse.json(
      { error: "Failed to generate video", details: message },
      { status: 500 }
    );
  }
}
