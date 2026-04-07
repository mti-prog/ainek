import { supabaseAdmin } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import TryOnModal from "@/components/try-on/TryOnModal"
import AddToCartButton from "@/components/store/AddToCartButton"

interface Props {
  params: Promise<{ slug: string; id: string }>
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug, id } = await params

  const { data: tenant } = await supabaseAdmin
    .from("tenants")
    .select("id, name")
    .eq("slug", slug)
    .single()

  if (!tenant) notFound()

  const schemaName = `store_${tenant.id.replace(/-/g, "_")}`

  const { data: product } = await supabaseAdmin
    .schema(schemaName)
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (!product) notFound()

  const images: Array<{ url: string; isPrimary?: boolean }> = product.images ?? []
  const sizes: Array<{ size: string; stockQty: number }> = product.sizes ?? []
  const colors: Array<{ name: string; hex: string }> = product.colors ?? []
  const primaryImage = images.find((i) => i.isPrimary) ?? images[0]
  const price = parseFloat(product.price)

  // Increment view count (fire-and-forget)
  supabaseAdmin
    .schema(schemaName)
    .from("products")
    .update({ view_count: (product.view_count ?? 0) + 1 })
    .eq("id", id)
    .then(() => {})

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="grid md:grid-cols-2 gap-10">
        {/* Image gallery */}
        <div className="space-y-3">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-white/5">
            {primaryImage ? (
              <img
                src={primaryImage.url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20">
                Нет фото
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden bg-white/5"
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-6">
          {product.brand && (
            <p className="text-white/40 text-sm uppercase tracking-widest">{product.brand}</p>
          )}
          <h1 className="text-2xl font-bold text-white">{product.name}</h1>
          <p className="text-3xl font-bold text-violet-400">
            {price.toLocaleString("ru-RU")} {product.currency ?? "сом"}
          </p>

          {product.description && (
            <p className="text-white/60 text-sm leading-relaxed">{product.description}</p>
          )}

          {/* Size selector */}
          {sizes.length > 0 && (
            <div>
              <p className="text-white/50 text-sm mb-2">Размер</p>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((s) => (
                  <button
                    key={s.size}
                    disabled={s.stockQty === 0}
                    className="px-3 py-1.5 rounded-lg border border-white/20 text-sm text-white hover:border-violet-500 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color selector */}
          {colors.length > 0 && (
            <div>
              <p className="text-white/50 text-sm mb-2">Цвет</p>
              <div className="flex gap-2">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    title={c.name}
                    className="w-7 h-7 rounded-full border-2 border-transparent hover:border-white transition"
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-3 mt-auto">
            {product.is_virtual_try_on_enabled && (
              <TryOnModal
                product={{
                  id: product.id,
                  name: product.name,
                  imageUrl: primaryImage?.url,
                }}
              />
            )}
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                imageUrl: primaryImage?.url,
              }}
              tenantId={tenant.id}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
