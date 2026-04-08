import { GoogleGenAI, Modality } from "@google/genai"

// Key rotation — supports up to 5 keys
const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
  process.env.GEMINI_API_KEY, // single-key fallback
].filter(Boolean) as string[]

let currentKeyIndex = 0

function getAI(): GoogleGenAI {
  const key = API_KEYS[currentKeyIndex] || ""
  return new GoogleGenAI({ apiKey: key })
}

function rotateKey() {
  currentKeyIndex = (currentKeyIndex + 1) % Math.max(API_KEYS.length, 1)
}

// Note: model ID in the existing MVP is "gemini-3.1-flash-image-preview".
// Verify against Google AI console — SKILL.md references "gemini-2.0-flash-preview-image-generation".
const MODEL = "gemini-3.1-flash-image-preview"

interface TryOnInput {
  userPhotoBase64: string          // full data-URL or raw base64
  clothingName: string
  clothingImageBase64?: string     // optional data-URL
}

export interface OutfitItem {
  name: string
  imageBase64?: string             // data-URL of product image
}

interface TryOnResult {
  imageBase64: string              // data-URL ready for <img> src
  textResponse: string | null
}

const SHARED_PERSON_RULES = `
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
- Each garment must conform to the body: follow shoulders, chest, waist curves naturally
- Fabric drapes with gravity: natural folds, creases, movement
- Prints, logos, graphics, text WRAP around body contours — 3D distortion, not flat paste
- Pattern perspective must match the body viewing angle

LIGHTING & SHADOWS (critical for realism):
- Detect the light source direction and color temperature from Image 1
- Apply matching shading: ambient light + diffuse highlights + specular gloss on fabric
- Cast shadows at collar, sleeves, hem boundaries
- Contact shadows at all garment-skin boundaries
- Every garment MUST show depth via shading — zero flat or uniformly lit areas
- Color temperature of light on all garments must match Image 1

COLOR THEORY & TONE MATCHING (critical):
- All garments' brightness and exposure MUST match the overall exposure of Image 1
- If the scene is dark or moody, garments must also appear darker — never overexposed
- Desaturate garment colors to match the color grading of Image 1
- Apply the same color grade, tone curve, and film-like rendering as the rest of the image
- Bright colors must be toned down to match ambient light level
- All garments must look photographed in the exact same conditions as the person

OUTPUT: One photorealistic image. Exact same framing as input. Indistinguishable from a real photo. No compositing artifacts.`

async function runGemini(parts: object[]): Promise<TryOnResult> {
  if (API_KEYS.length === 0) {
    throw new Error("No Gemini API keys configured")
  }

  let lastError: Error | null = null

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await getAI().models.generateContent({
        model: MODEL,
        contents: [{ role: "user", parts: parts as never }],
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
          temperature: 0.2,
        },
      })

      let imageBase64: string | null = null
      let textResponse: string | null = null

      for (const part of response.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData?.mimeType?.startsWith("image/")) {
          imageBase64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
        } else if (part.text) {
          textResponse = part.text
        }
      }

      if (!imageBase64) {
        throw new Error("Model did not return an image")
      }

      return { imageBase64, textResponse }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      const msg = lastError.message

      if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
        rotateKey()
        continue
      }

      throw lastError
    }
  }

  throw lastError ?? new Error("Try-on generation failed")
}

/**
 * Single-item virtual try-on (legacy / single product page).
 */
export async function generateTryOn(input: TryOnInput): Promise<TryOnResult> {
  const { userPhotoBase64, clothingName, clothingImageBase64 } = input

  const personImageData = userPhotoBase64.replace(/^data:image\/\w+;base64,/, "")
  const parts: object[] = [
    { inlineData: { mimeType: "image/jpeg", data: personImageData } },
  ]

  if (clothingImageBase64?.startsWith("data:image/")) {
    const clothingData = clothingImageBase64.replace(/^data:image\/\w+;base64,/, "")
    parts.push({ inlineData: { mimeType: "image/jpeg", data: clothingData } })
    parts.push({
      text: `You are a professional AI fashion photographer specializing in photorealistic virtual try-on (VTON).

INPUTS:
- Image 1: Real photo of a person — source of body, pose, lighting, background
- Image 2: Clothing product photo — source of garment design, color, print, texture

TASK: Dress the person from Image 1 in the clothing from Image 2.
${SHARED_PERSON_RULES}`,
    })
  } else {
    parts.push({
      text: `You are a professional AI fashion photographer specializing in photorealistic virtual try-on (VTON).

INPUT: Real photo of a person. Clothing to apply: "${clothingName}"

TASK: Dress the person in "${clothingName}".
${SHARED_PERSON_RULES}`,
    })
  }

  return runGemini(parts)
}

/**
 * Multi-item outfit try-on — dresses the person in a complete outfit (multiple garments).
 * Used by the TryOn Studio when the user selects several clothing items.
 */
export async function generateOutfitTryOn(
  userPhotoBase64: string,
  items: OutfitItem[]
): Promise<TryOnResult> {
  if (items.length === 0) {
    throw new Error("No clothing items provided")
  }

  const personImageData = userPhotoBase64.replace(/^data:image\/\w+;base64,/, "")
  const parts: object[] = [
    { inlineData: { mimeType: "image/jpeg", data: personImageData } },
  ]

  // Add product images
  const itemsWithImages = items.filter(i => i.imageBase64?.startsWith("data:image/"))
  const itemsTextOnly = items.filter(i => !i.imageBase64?.startsWith("data:image/"))

  for (const item of itemsWithImages) {
    const data = item.imageBase64!.replace(/^data:image\/\w+;base64,/, "")
    parts.push({ inlineData: { mimeType: "image/jpeg", data } })
  }

  const itemCount = itemsWithImages.length
  const imageLabels = itemsWithImages
    .map((item, i) => `  - Image ${i + 2}: ${item.name}`)
    .join("\n")
  const textOnlyItems = itemsTextOnly.length > 0
    ? `\nAdditional items (no image — integrate by description): ${itemsTextOnly.map(i => i.name).join(", ")}`
    : ""

  const outfitDescription = items.map(i => i.name).join(" + ")

  parts.push({
    text: `You are a professional AI fashion photographer and stylist specializing in photorealistic virtual try-on (VTON).

INPUTS:
- Image 1: Real photo of a person — source of body, pose, lighting, background, color grading
${imageLabels}${textOnlyItems}

TASK: Dress the person from Image 1 in a COMPLETE OUTFIT consisting of ALL ${items.length} clothing item${items.length > 1 ? "s" : ""}: ${outfitDescription}.

OUTFIT LAYERING RULES:
- Apply ALL garments simultaneously as a coordinated outfit — never just one
- Layer correctly: underwear/tops first, then outerwear; shirt under jacket, etc.
- ${itemCount > 1 ? "Each garment occupies its correct body region — tops cover torso, bottoms cover legs (if visible), shoes on feet (if visible)" : ""}
- If body parts for a garment are not visible in the photo, skip that garment — do not invent body parts
- Ensure garments coordinate visually and don't clash in an unrealistic way
${SHARED_PERSON_RULES}`,
  })

  return runGemini(parts)
}
