import { NextRequest } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { GoogleGenAI, Modality } from "@google/genai"
import { apiError, apiOk } from "@/lib/api"
import { logEvent } from "@/lib/logging"

const MODEL = "gemini-3.1-flash-image-preview"

const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY,
].filter(Boolean) as string[]

function getAI() {
  return new GoogleGenAI({ apiKey: API_KEYS[0] || "" })
}

interface StyleRecommendationResult {
  rationale: string
  stylingTips: string[]
  recommendedItemIds: string[]
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError("Unauthorized", 401, "UNAUTHORIZED")

  const body = await request.json()
  const { selectedItems, catalogItems } = body

  if (!Array.isArray(selectedItems) || selectedItems.length === 0) {
    return apiError("No selected items provided", 400, "SELECTED_ITEMS_REQUIRED")
  }

  if (!Array.isArray(catalogItems) || catalogItems.length === 0) {
    return apiError("No catalog items provided", 400, "CATALOG_ITEMS_REQUIRED")
  }

  const selectedIds = new Set(
    selectedItems
      .map((item: { id?: string }) => item.id)
      .filter((id: unknown): id is string => typeof id === "string" && id.length > 0)
  )

  const candidateCatalog = catalogItems.filter(
    (item: { id?: string }) => typeof item.id === "string" && !selectedIds.has(item.id)
  )

  if (candidateCatalog.length === 0) {
    return apiOk({
      recommendations: {
        rationale: "В каталоге нет дополнительных товаров для рекомендации.",
        stylingTips: [],
        recommendedItemIds: [],
      },
    })
  }

  const selectedText = selectedItems
    .map((item: { id: string; name: string; category?: string; brand?: string }) =>
      `id="${item.id}" | ${item.name} | категория: ${item.category ?? "unknown"} | бренд: ${item.brand ?? "unknown"}`
    )
    .join("\n")

  const catalogText = candidateCatalog
    .map((item: { id: string; name: string; category?: string; brand?: string; price?: number | string }) =>
      `id="${item.id}" | ${item.name} | категория: ${item.category ?? "unknown"} | бренд: ${item.brand ?? "unknown"} | цена: ${item.price ?? "unknown"}`
    )
    .join("\n")

  const prompt = `Ты — AI-стилист в fashion e-commerce. Твоя задача: предложить товары из каталога, которые лучше всего дополнят уже выбранные вещи.

УЖЕ ВЫБРАННЫЕ ВЕЩИ:
${selectedText}

ДОСТУПНЫЕ ТОВАРЫ КАТАЛОГА ДЛЯ РЕКОМЕНДАЦИИ:
${catalogText}

ПРАВИЛА:
- Рекомендуй только товары из доступного каталога по их id.
- Не возвращай уже выбранные товары.
- Подбирай вещи, которые дополняют образ по стилю, цвету, сезону и назначению.
- Старайся делать образ более полным: верх + низ + обувь + аксессуар, где уместно.
- Если уже выбран полноценный образ, предложи 2-4 наиболее уместных дополнения, а не случайные товары.
- Не выдумывай товары вне каталога.

ОТВЕТЬ ТОЛЬКО валидным JSON без markdown и пояснений.
Формат:
{
  "rationale": "короткое объяснение, почему эти вещи подходят к выбранному образу",
  "stylingTips": ["совет 1", "совет 2", "совет 3"],
  "recommendedItemIds": ["id1", "id2", "id3"]
}`

  try {
    const ai = getAI()
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{
        role: "user",
        parts: [{ text: prompt }],
      }],
      config: {
        responseModalities: [Modality.TEXT],
        temperature: 0.35,
      },
    })

    const rawText = response.candidates?.[0]?.content?.parts?.find((part) => part.text)?.text ?? ""
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error(`Model returned no JSON. Raw: ${rawText.slice(0, 200)}`)
    }

    const parsed = JSON.parse(jsonMatch[0]) as StyleRecommendationResult
    const validIds = new Set(candidateCatalog.map((item: { id: string }) => item.id))
    const recommendedItemIds = Array.isArray(parsed.recommendedItemIds)
      ? parsed.recommendedItemIds.filter((id) => typeof id === "string" && validIds.has(id)).slice(0, 8)
      : []

    const recommendations: StyleRecommendationResult = {
      rationale: typeof parsed.rationale === "string"
        ? parsed.rationale
        : "ИИ подобрал вещи, которые лучше всего сочетаются с выбранным образом.",
      stylingTips: Array.isArray(parsed.stylingTips)
        ? parsed.stylingTips.filter((tip) => typeof tip === "string").slice(0, 4)
        : [],
      recommendedItemIds,
    }

    logEvent({
      event: "style_recommendations.generated",
      userId: user.id,
      selectedCount: selectedItems.length,
      recommendedCount: recommendations.recommendedItemIds.length,
    })

    return apiOk({ recommendations })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    logEvent({ event: "style_recommendations.failed", level: "error", userId: user.id, message: msg })
    return apiError("Не удалось подобрать рекомендации: " + msg, 500, "STYLE_RECOMMENDATIONS_FAILED")
  }
}
