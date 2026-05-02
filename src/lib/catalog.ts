import { z } from "zod"

const imageSchema = z.object({
  url: z.string().min(1),
  isPrimary: z.boolean().optional(),
  is_primary: z.boolean().optional(),
  color: z.string().optional(),
})

const sizeSchema = z.object({
  size: z.string().min(1),
  stockQty: z.coerce.number().int().min(0).default(0),
  stock_qty: z.coerce.number().int().min(0).optional(),
})

const colorSchema = z.object({
  name: z.string().min(1),
  hex: z.string().min(1),
  images: z.array(z.string()).default([]),
})

export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().optional(),
  category: z.string().trim().optional(),
  subcategory: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  price: z.coerce.number().positive(),
  currency: z.string().trim().default("KGS"),
  sku: z.string().trim().optional(),
  images: z.array(imageSchema).default([]),
  sizes: z.array(sizeSchema).default([]),
  colors: z.array(colorSchema).default([]),
  isVirtualTryOnEnabled: z.boolean().optional(),
  is_virtual_try_on_enabled: z.boolean().optional(),
  is_active: z.boolean().optional(),
})

export type ProductPayload = z.infer<typeof createProductSchema>

const importImageSchema = z.union([
  z.string().trim().min(1),
  imageSchema,
])

const importSizeSchema = z.union([
  z.string().trim().min(1),
  sizeSchema,
])

const importColorSchema = z.union([
  z.string().trim().min(1),
  colorSchema,
])

export const importProductSchema = z.object({
  name: z.string().trim().optional(),
  title: z.string().trim().optional(),
  description: z.string().trim().optional(),
  category: z.string().trim().optional(),
  subcategory: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  price: z.union([z.number(), z.string()]).optional(),
  currency: z.string().trim().optional(),
  sku: z.string().trim().optional(),
  stock: z.union([z.number(), z.string()]).optional(),
  imageUrl: z.string().trim().optional(),
  image_url: z.string().trim().optional(),
  thumbnail: z.string().trim().optional(),
  images: z.array(importImageSchema).optional(),
  sizes: z.array(importSizeSchema).optional(),
  colors: z.array(importColorSchema).optional(),
  isVirtualTryOnEnabled: z.boolean().optional(),
  is_virtual_try_on_enabled: z.boolean().optional(),
  is_active: z.boolean().optional(),
}).passthrough()

export type ImportProductPayload = z.infer<typeof importProductSchema>

export function normalizeProductPayload(input: ProductPayload) {
  return {
    name: input.name,
    description: input.description,
    category: input.category,
    subcategory: input.subcategory,
    brand: input.brand,
    price: input.price,
    currency: input.currency,
    sku: input.sku,
    images: input.images.map((image) => ({
      url: image.url,
      isPrimary: image.isPrimary ?? image.is_primary ?? false,
      color: image.color,
    })),
    sizes: input.sizes.map((size) => ({
      size: size.size,
      stockQty: size.stockQty ?? size.stock_qty ?? 0,
    })),
    colors: input.colors,
    isActive: input.is_active ?? true,
    isVirtualTryOnEnabled:
      input.isVirtualTryOnEnabled ?? input.is_virtual_try_on_enabled ?? true,
  }
}

function normalizeImportedImages(input: ImportProductPayload) {
  const images = [...(input.images ?? [])]
  const fallbackImages = [input.imageUrl, input.image_url, input.thumbnail].filter(Boolean) as string[]

  if (images.length === 0 && fallbackImages.length > 0) {
    images.push(...fallbackImages)
  }

  return images
    .map((image, index) => {
      if (typeof image === "string") {
        return {
          url: image,
          isPrimary: index === 0,
        }
      }

      return {
        url: image.url,
        isPrimary: image.isPrimary ?? image.is_primary ?? index === 0,
        color: image.color,
      }
    })
    .filter((image) => image.url.trim().length > 0)
}

function normalizeImportedSizes(input: ImportProductPayload) {
  const stockQty = Number(input.stock ?? 0)

  return (input.sizes ?? [])
    .map((size) => {
      if (typeof size === "string") {
        return {
          size,
          stockQty: Number.isFinite(stockQty) ? Math.max(0, stockQty) : 0,
        }
      }

      return {
        size: size.size,
        stockQty: size.stockQty ?? size.stock_qty ?? (Number.isFinite(stockQty) ? Math.max(0, stockQty) : 0),
      }
    })
    .filter((size) => size.size.trim().length > 0)
}

function normalizeImportedColors(input: ImportProductPayload) {
  return (input.colors ?? [])
    .map((color) => {
      if (typeof color === "string") {
        return {
          name: color,
          hex: "#000000",
          images: [],
        }
      }

      return color
    })
    .filter((color) => color.name.trim().length > 0)
}

export function normalizeImportedProduct(input: unknown) {
  const parsed = importProductSchema.parse(input)
  const name = parsed.name ?? parsed.title

  if (!name) {
    throw new Error("Product is missing name/title")
  }

  const price = Number(parsed.price ?? 0)

  return normalizeProductPayload({
    name,
    description: parsed.description,
    category: parsed.category,
    subcategory: parsed.subcategory,
    brand: parsed.brand,
    price,
    currency: parsed.currency ?? "KGS",
    sku: parsed.sku,
    images: normalizeImportedImages(parsed),
    sizes: normalizeImportedSizes(parsed),
    colors: normalizeImportedColors(parsed),
    isVirtualTryOnEnabled: parsed.isVirtualTryOnEnabled ?? parsed.is_virtual_try_on_enabled,
    is_active: parsed.is_active,
  })
}
