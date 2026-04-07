"use client"

import Link from "next/link"

interface Product {
  id: string
  name: string
  price: number | string
  currency?: string
  images?: Array<{ url: string; isPrimary?: boolean }>
  category?: string
  is_virtual_try_on_enabled?: boolean
}

interface Props {
  product: Product
  slug: string
}

export default function ProductCard({ product, slug }: Props) {
  const primaryImage = product.images?.find((i) => i.isPrimary) ?? product.images?.[0]
  const price = typeof product.price === "string"
    ? parseFloat(product.price)
    : product.price

  return (
    <Link
      href={`/store/${slug}/product/${product.id}`}
      className="group rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-violet-500/50 transition-all"
    >
      {/* Product image */}
      <div className="aspect-[3/4] bg-white/5 relative overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600/30 to-blue-600/30" />
          </div>
        )}

        {/* Try-on badge */}
        {product.is_virtual_try_on_enabled && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-violet-600/90 text-white text-xs font-medium backdrop-blur-sm">
            Примерка
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-white text-sm font-medium line-clamp-2 mb-1">{product.name}</p>
        <p className="text-violet-400 font-semibold text-sm">
          {price.toLocaleString("ru-RU")} {product.currency ?? "сом"}
        </p>
      </div>
    </Link>
  )
}
