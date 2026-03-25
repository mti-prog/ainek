import { GoogleGenAI, Modality } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, clothingName, clothingImageUrl } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
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
        text: `You are a professional AI fashion photographer specializing in virtual try-on (VTON).

INPUTS:
- Image 1: Real photo of a person — source of body, pose, lighting, background
- Image 2: Clothing product photo — source of garment design, color, print, texture

TASK: Dress the person from Image 1 in the clothing from Image 2.

PERSON (preserve exactly):
- Face, skin tone, hair, body proportions — unchanged
- Camera angle, pose, framing — unchanged  
- Background and environment — unchanged

CLOTHING INTEGRATION:
- Garment must conform to the body: follow shoulders, chest, waist curves naturally
- Fabric must drape with gravity: natural folds, creases, movement
- Prints, logos, graphics, text must WRAP around body contours and fabric folds — 3D distortion, not flat paste
- Pattern perspective must match the body viewing angle

LIGHTING & SHADOWS (most important for realism):
- Detect the light source direction and color temperature from Image 1
- Apply matching shading: ambient light + diffuse highlights + specular gloss on fabric
- Cast shadows: collar shadow on neck, sleeve shadow on arm, hem shadow below
- Contact shadows at all garment-skin boundaries
- The garment MUST show depth via shading — zero flat or uniformly lit areas
- Color temperature of light on garment must match Image 1 (warm/cool/neutral)

OUTPUT: One photorealistic image. The person wearing the garment. Indistinguishable from a real photo taken in the same location. No compositing artifacts, no flat areas, no pasted-on prints.`,
      });
    } else {
      parts.push({
        text: `You are a professional AI fashion photographer specializing in virtual try-on (VTON).

INPUT: Real photo of a person. Clothing to apply: "${clothingName}"

TASK: Dress the person in "${clothingName}".

PERSON (preserve exactly):
- Face, skin tone, hair, body proportions — unchanged
- Camera angle, pose, framing — unchanged
- Background and environment — unchanged

CLOTHING INTEGRATION:
- Garment conforms naturally to the body curves and silhouette
- Fabric drapes with gravity: natural folds, creases, movement
- Any print, logo or pattern wraps realistically around body contours — 3D distortion, never flat

LIGHTING & SHADOWS (most important for realism):
- Match the light source direction and color temperature from the original photo
- Apply diffuse shading, ambient light, and specular highlights on the fabric
- Add cast shadows and contact shadows at all garment-skin boundaries
- Garment must have depth from proper shading — never flat or uniformly lit
- Light color temperature on garment must match the scene

OUTPUT: One photorealistic image of the same person wearing "${clothingName}". Indistinguishable from a real photo. No artifacts, no flat areas.`,
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
    return NextResponse.json(
      { error: "Failed to generate try-on image", details: message },
      { status: 500 }
    );
  }
}