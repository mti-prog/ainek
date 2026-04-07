"use client"

import { useState, useRef } from "react"

interface ParsedProduct {
  rowNumber: number
  name: string
  description: string
  price: string
  category: string
  brand: string
  sizes: string
  stock: string
  imageUrl: string
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

const EXPECTED_HEADERS = ["name", "description", "price", "category", "brand", "sizes", "stock", "image_url"]

export default function ImportPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<ParsedProduct[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [importErrors, setImportErrors] = useState<string[]>([])
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState(0)
  const [parseError, setParseError] = useState("")

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setParseError("")
    setErrors([])
    setImportErrors([])
    setPreview([])
    setImported(0)

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text.split(/\r?\n/).filter((l) => l.trim())
      if (lines.length < 2) {
        setParseError("Файл пустой или содержит только заголовок")
        return
      }

      const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase())
      const missing = EXPECTED_HEADERS.filter((h) => !headers.includes(h))
      if (missing.length > 0) {
        setParseError(`Отсутствуют колонки: ${missing.join(", ")}`)
        return
      }

      const idx = Object.fromEntries(EXPECTED_HEADERS.map((h) => [h, headers.indexOf(h)]))

      const products: ParsedProduct[] = []
      const errs: string[] = []

      for (let i = 1; i < lines.length; i++) {
        const cols = parseCsvLine(lines[i])
        const name = cols[idx.name] ?? ""
        const price = cols[idx.price] ?? ""

        if (!name) { errs.push(`Строка ${i + 1}: пустое название`); continue }
        if (!price || isNaN(Number(price))) { errs.push(`Строка ${i + 1}: некорректная цена "${price}"`); continue }

        products.push({
          rowNumber: i + 1,
          name,
          description: cols[idx.description] ?? "",
          price,
          category: cols[idx.category] ?? "",
          brand: cols[idx.brand] ?? "",
          sizes: cols[idx.sizes] ?? "",
          stock: cols[idx.stock] ?? "0",
          imageUrl: cols[idx.image_url] ?? "",
        })
      }

      setPreview(products)
      setErrors(errs)
    }
    reader.readAsText(file, "UTF-8")
  }

  async function handleImport() {
    if (preview.length === 0) return
    setImporting(true)
    setImportErrors([])
    let count = 0
    const failedRows: string[] = []

    for (const p of preview) {
      const sizes = p.sizes
        ? p.sizes.split("|").map((s) => ({
            size: s.trim(),
            stockQty: parseInt(p.stock) || 0,
          }))
        : []

      const body = {
        name: p.name,
        description: p.description || undefined,
        price: p.price,
        currency: "KGS",
        category: p.category || undefined,
        brand: p.brand || undefined,
        sizes,
        images: p.imageUrl ? [{ url: p.imageUrl, isPrimary: true }] : [],
        is_active: true,
        is_virtual_try_on_enabled: false,
      }

      const res = await fetch("/api/tenant/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        count++
        continue
      }

      const data = await res.json().catch(() => null)
      failedRows.push(`Строка ${p.rowNumber}: ${data?.error ?? "ошибка импорта"}`)
    }

    setImported(count)
    setImportErrors(failedRows)
    setPreview(failedRows.length > 0 ? preview : [])
    setImporting(false)
    if (failedRows.length === 0 && fileRef.current) fileRef.current.value = ""
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Импорт товаров из CSV</h1>
        <p className="text-white/50 text-sm mt-1">
          Загрузите файл CSV для массового добавления товаров
        </p>
      </div>

      {/* Template download hint */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-6">
        <p className="text-blue-300 text-sm font-medium mb-1">Формат файла CSV</p>
        <p className="text-blue-300/70 text-xs font-mono">
          name, description, price, category, brand, sizes, stock, image_url
        </p>
        <p className="text-blue-300/50 text-xs mt-1">
          Для нескольких размеров используйте | в колонке sizes: S|M|L|XL
        </p>
      </div>

      {/* File upload */}
      <label className="flex flex-col items-center justify-center w-full h-36 rounded-xl border-2 border-dashed border-white/20 cursor-pointer hover:border-violet-500/50 transition bg-white/5 hover:bg-white/[0.07] mb-6">
        <svg className="w-8 h-8 text-white/30 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-white/50 text-sm">Нажмите или перетащите CSV файл</p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      {parseError && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-4">
          {parseError}
        </div>
      )}

      {errors.length > 0 && (
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mb-4">
          <p className="text-yellow-400 text-sm font-medium mb-2">
            Пропущено строк: {errors.length}
          </p>
          <ul className="space-y-1">
            {errors.slice(0, 5).map((e, i) => (
              <li key={i} className="text-yellow-400/70 text-xs">{e}</li>
            ))}
            {errors.length > 5 && (
              <li className="text-yellow-400/50 text-xs">…и ещё {errors.length - 5}</li>
            )}
          </ul>
        </div>
      )}

      {imported > 0 && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 mb-6">
          <p className="text-green-400 font-medium">
            Успешно импортировано: {imported} товара(ов)
          </p>
        </div>
      )}

      {importErrors.length > 0 && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
          <p className="text-red-400 text-sm font-medium mb-2">
            Не удалось импортировать: {importErrors.length}
          </p>
          <ul className="space-y-1">
            {importErrors.slice(0, 8).map((e, i) => (
              <li key={i} className="text-red-300/80 text-xs">{e}</li>
            ))}
            {importErrors.length > 8 && (
              <li className="text-red-300/60 text-xs">…и ещё {importErrors.length - 8}</li>
            )}
          </ul>
        </div>
      )}

      {preview.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">
              Предпросмотр — {preview.length} товара(ов)
            </h2>
            <button
              onClick={handleImport}
              disabled={importing}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {importing ? "Импорт..." : "Импортировать всё"}
            </button>
          </div>

          <div className="rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-4 py-3 text-white/50 font-medium">Название</th>
                  <th className="text-left px-4 py-3 text-white/50 font-medium">Цена</th>
                  <th className="text-left px-4 py-3 text-white/50 font-medium">Категория</th>
                  <th className="text-left px-4 py-3 text-white/50 font-medium">Размеры</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 20).map((p, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 text-white">{p.name}</td>
                    <td className="px-4 py-3 text-violet-400 font-medium">
                      {Number(p.price).toLocaleString("ru-RU")} сом
                    </td>
                    <td className="px-4 py-3 text-white/50">{p.category || "—"}</td>
                    <td className="px-4 py-3 text-white/50">{p.sizes || "—"}</td>
                  </tr>
                ))}
                {preview.length > 20 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-center text-white/30 text-xs">
                      …и ещё {preview.length - 20} товара(ов)
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
