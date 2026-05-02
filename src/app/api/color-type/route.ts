import { NextRequest } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { GoogleGenAI, Modality } from "@google/genai"
import { apiError, apiOk } from "@/lib/api"
import { logEvent } from "@/lib/logging"

// Same model as try-on — user has access to this model
const MODEL = "gemini-3.1-flash-image-preview"

// Key rotation (same as try-on)
const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY,
].filter(Boolean) as string[]

function getAI() {
  return new GoogleGenAI({ apiKey: API_KEYS[0] || "" })
}

export interface ColorTypeResult {
  colorSeason: "Зима" | "Весна" | "Лето" | "Осень"
  eyeColor: string
  hairColor: string
  skinTone: string
  faceShape: string
  features: string
  recommendedColors: string[]
  avoidColors: string[]
  styleRecommendation: string
  fitRecommendation: string
  recommendedItemIds: string[]
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError("Unauthorized", 401, "UNAUTHORIZED")

  const body = await request.json()
  const { facePhotoBase64, catalogItems } = body

  if (!facePhotoBase64) return apiError("No face photo provided", 400, "PHOTO_REQUIRED")

  const photoData = facePhotoBase64.replace(/^data:image\/\w+;base64,/, "")

  // Build catalog context so AI can recommend specific items
  const catalogText =
    Array.isArray(catalogItems) && catalogItems.length > 0
      ? `\n\nАссортимент магазина (можешь рекомендовать по id):\n${
          catalogItems
            .map((item: { id: string; name: string; category: string }) =>
              `id="${item.id}" | ${item.name} | категория: ${item.category}`
            )
            .join("\n")
        }\n\nВыбери из этого списка 1–3 товара, которые идеально подойдут этому цветотипу. Верни их id в поле recommendedItemIds.`
      : "\nМагазин не предоставил каталог. Верни пустой массив в recommendedItemIds."

  const prompt = `Ты — эксперт по цветотипу, имидж-консультант и стилист. Проанализируй фото лица человека максимально точно.

АНАЛИЗИРУЙ:
1. Цвет глаз — точный оттенок (карие, зелёные, серые, голубые, тёмно-карие и т.д.)
2. Цвет волос — натуральный оттенок (тёмный, светлый, рыжий, пепельный, каштановый и т.д.)
3. Тон кожи:
   • Температура: тёплый (золотистый/персиковый подтон) / холодный (розоватый/голубоватый подтон) / нейтральный
   • Глубина: светлый / средний / тёмный / очень тёмный
4. Форма лица — одна из: овальное, круглое, квадратное, сердечко, прямоугольное, треугольное, ромбовидное
5. Черты лица — мягкие / острые / смешанные (влияет на выбор принтов и фасонов)

ОПРЕДЕЛИ сезонный цветотип одной строкой:
• Зима — холодный, контрастный (тёмные волосы + светлая/тёмная кожа + яркие глаза)
• Весна — тёплый, светлый (светлые волосы/рыжие + тёплая кожа + яркие глаза)
• Лето — холодный, мягкий (светлые/пепельные волосы + светлая кожа + серые/голубые глаза)
• Осень — тёплый, глубокий (тёмно-рыжие/каштановые + тёплая кожа + тёмные глаза)

РЕКОМЕНДАЦИИ ПО ОДЕЖДЕ:
• Идеальные цвета (6–8 конкретных оттенков с названием, например "бургундский", "оливковый", "пудровый розовый")
• Цвета под запретом (3–5 оттенков которые старят или делают вид болезненным)
• Стиль который идёт этому человеку (классика / casual / спортивный / романтический / бохо и т.д.)
• Фасоны и силуэты которые подчёркивают достоинства формы лица и фигуры
${catalogText}

ВАЖНО: Ответь ТОЛЬКО валидным JSON без markdown-обёртки, без \`\`\`json, без пояснений до/после.
Формат:
{
  "colorSeason": "Зима|Весна|Лето|Осень",
  "eyeColor": "...",
  "hairColor": "...",
  "skinTone": "...",
  "faceShape": "...",
  "features": "мягкие|острые|смешанные",
  "recommendedColors": ["цвет1", "цвет2", "цвет3", "цвет4", "цвет5", "цвет6"],
  "avoidColors": ["цвет1", "цвет2", "цвет3"],
  "styleRecommendation": "краткое описание подходящего стиля одним абзацем",
  "fitRecommendation": "рекомендации по фасонам и силуэтам одним абзацем",
  "recommendedItemIds": []
}`

  try {
    const ai = getAI()
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{
        role: "user",
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: photoData } },
          { text: prompt },
        ],
      }],
      config: {
        responseModalities: [Modality.TEXT],
        temperature: 0.25,
      },
    })

    const rawText = response.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text ?? ""

    // Extract JSON — model sometimes wraps in backticks
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error(`Model returned no JSON. Raw: ${rawText.slice(0, 200)}`)
    }

    const analysis: ColorTypeResult = JSON.parse(jsonMatch[0])

    logEvent({ event: "color_type.analyzed", userId: user.id, colorSeason: analysis.colorSeason })

    return apiOk({ analysis })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    logEvent({ event: "color_type.failed", level: "error", userId: user.id, message: msg })
    return apiError("Не удалось проанализировать фото: " + msg, 500, "COLOR_TYPE_FAILED")
  }
}
