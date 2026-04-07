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
