import { GoogleGenAI, Modality } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Key rotation — add up to 5 keys in Vercel environment variables
const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
  process.env.GEMINI_API_KEY, // fallback to single key
].filter(Boolean) as string[];

let currentKeyIndex = 0;

function getAI() {
  const key = API_KEYS[currentKeyIndex] || "";
  return new GoogleGenAI({ apiKey: key });
}

function rotateKey() {
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
}

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, clothingName, clothingImageUrl } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }
    if (API_KEYS.length === 0) {
      return NextResponse.json({ error: "No API keys configured" }, { status: 500 });
    }

    const personImageData = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const parts: object[] = [];

    // Always add person photo first
    parts.push({
      inlineData: { mimeType: "image/jpeg", data: personImageData },
    });

    // Add clothing image if available
    if (clothingImageUrl && clothingImageUrl.startsWith("data:image/")) {
      const clothingData = clothingImageUrl.replace(/^data:image\/\w+;base64,/, "");
      parts.push({
        inlineData: { mimeType: "image/jpeg", data: clothingData },
      });
      parts.push({
        text: `You are a professional AI fashion photographer and colorist specializing in photorealistic virtual try-on (VTON).

INPUTS:
- Image 1: Real photo of a person — source of body, pose, lighting, background, color grading
- Image 2: Clothing product photo — source of garment design, color, print, texture

TASK: Dress the person from Image 1 in the clothing from Image 2.

PERSON (preserve exactly):
- Face, skin tone, hair, body proportions — unchanged
- Camera angle, pose, framing — unchanged
- Background and environment — unchanged

FRAMING (critical):
- Generate only the exact framing and crop shown in the input photo
- Do not extend, complete, or infer any part of the body not visible in the input
- If the photo shows head and shoulders only — output head and shoulders only
- If the photo shows waist up — output waist up only
- If the photo shows full body — output full body
- Never add legs, feet, or any body parts not present in the original image
- Output crop and aspect ratio must precisely match the input photo

CLOTHING INTEGRATION:
- Garment must conform to the body: follow shoulders, chest, waist curves naturally
- Fabric must drape with gravity: natural folds, creases, movement
- Prints, logos, graphics, text must WRAP around body contours and fabric folds — 3D distortion, not flat paste
- Pattern perspective must match the body viewing angle

LIGHTING & SHADOWS (critical for realism):
- Detect the light source direction and color temperature from Image 1
- Apply matching shading: ambient light + diffuse highlights + specular gloss on fabric
- Cast shadows: collar shadow on neck, sleeve shadow on arm, hem shadow below
- Contact shadows at all garment-skin boundaries
- The garment MUST show depth via shading — zero flat or uniformly lit areas
- Color temperature of light on garment must match Image 1 (warm/cool/neutral)

COLOR THEORY & TONE MATCHING (critical — most common failure point):
- The garment's brightness and exposure MUST match the overall exposure of Image 1
- If the scene is dark or moody, the garment must also appear darker — never overexposed
- Desaturate the garment colors to match the color grading of Image 1 — do NOT use the raw product photo colors at full saturation
- Apply the same color grade, tone curve, and film-like rendering as the rest of the image
- Bright colors (red, yellow, white) must be toned down to match ambient light level — never appear as if lit by a different light source
- The garment must look like it was photographed in the exact same conditions as the person, not composited from a studio product shot
- Check: if you removed the garment mentally, the lighting and tone should feel continuous with the skin, hair, and background

OUTPUT: One photorealistic image. Exact same framing as input. The person wearing the garment. Indistinguishable from a real photo. No compositing artifacts, no flat areas, no pasted-on prints, no color mismatch.`,
      });
    } else {
      parts.push({
        text: `You are a professional AI fashion photographer and colorist specializing in photorealistic virtual try-on (VTON).

INPUT: Real photo of a person. Clothing to apply: "${clothingName}"

TASK: Dress the person in "${clothingName}".

PERSON (preserve exactly):
- Face, skin tone, hair, body proportions — unchanged
- Camera angle, pose, framing — unchanged
- Background and environment — unchanged

FRAMING (critical):
- Generate only the exact framing and crop shown in the input photo
- Do not extend, complete, or infer any part of the body not visible in the input
- If the photo shows head and shoulders only — output head and shoulders only
- If the photo shows waist up — output waist up only
- If the photo shows full body — output full body
- Never add legs, feet, or any body parts not present in the original image
- Output crop and aspect ratio must precisely match the input photo

CLOTHING INTEGRATION:
- Garment conforms naturally to the body curves and silhouette
- Fabric drapes with gravity: natural folds, creases, movement
- Any print, logo or pattern wraps realistically around body contours — 3D distortion, never flat

LIGHTING & SHADOWS (critical for realism):
- Match the light source direction and color temperature from the original photo
- Apply diffuse shading, ambient light, and specular highlights on the fabric
- Add cast shadows and contact shadows at all garment-skin boundaries
- Garment must have depth from proper shading — never flat or uniformly lit
- Light color temperature on garment must match the scene

COLOR THEORY & TONE MATCHING (critical — most common failure point):
- The garment's brightness and exposure MUST match the overall exposure of the photo
- If the scene is dark or moody, the garment must also appear darker — never overexposed
- Desaturate the garment colors to match the color grading of the photo — do NOT use raw product colors at full saturation
- Apply the same color grade, tone curve, and film-like rendering as the rest of the image
- Bright colors (red, yellow, white) must be toned down to match ambient light level — never appear lit by a different source
- The garment must look photographed in the exact same conditions as the person, not composited from a studio product shot
- Check: the lighting and tone must feel continuous with the skin, hair, and background

OUTPUT: One photorealistic image of the same person wearing "${clothingName}". Exact same framing as input. Indistinguishable from a real photo. No artifacts, no flat areas, no color mismatch.`,
      });
    }

    const response = await getAI().models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: [{ role: "user", parts: parts as never }],
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
        temperature: 0.2,
      },
    });

    let generatedImageBase64: string | null = null;
    let textResponse: string | null = null;

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.mimeType?.startsWith("image/")) {
        generatedImageBase64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      } else if (part.text) {
        textResponse = part.text;
      }
    }

    if (!generatedImageBase64) {
      return NextResponse.json(
        { error: "Model did not return an image. Try again.", text: textResponse },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      generatedImage: generatedImageBase64,
      text: textResponse,
    });

  } catch (error) {
    console.error("Gemini API error:", error);
    const message = error instanceof Error ? error.message : String(error);
    // Auto-rotate key on rate limit
    if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) {
      rotateKey();
      console.log(`Rate limited. Rotated to key index ${currentKeyIndex}`);
    }
    return NextResponse.json(
      { error: "Failed to generate try-on image", details: message },
      { status: 500 }
    );
  }
}