"use client"

import { useMemo, useRef, useState } from "react"

interface PreviewProduct {
  rowNumber: number
  name: string
  description: string
  price: string
  category: string
  brand: string
  sizes: string
  stock: string
  imageUrl: string
  raw: Record<string, unknown>
}

type ImportSummary = {
  imported: number
  failed: number
  total: number
  errors: string[]
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === "\"") {
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

function normalizePreviewProduct(raw: Record<string, unknown>, rowNumber: number): PreviewProduct {
  const name = String(raw.name ?? raw.title ?? "").trim()
  const description = String(raw.description ?? "").trim()
  const price = String(raw.price ?? "").trim()
  const category = String(raw.category ?? "").trim()
  const brand = String(raw.brand ?? "").trim()
  const stock = String(raw.stock ?? "").trim()

  const rawSizes = Array.isArray(raw.sizes)
    ? raw.sizes
    : typeof raw.sizes === "string"
    ? raw.sizes.split("|").map((size) => size.trim()).filter(Boolean)
    : []

  const sizes = rawSizes
    .map((size) => {
      if (typeof size === "string") return size
      if (typeof size === "object" && size && "size" in size) return String(size.size)
      return ""
    })
    .filter(Boolean)
    .join(" | ")

  const rawImages = Array.isArray(raw.images) ? raw.images : []
  const imageUrl = String(
    raw.imageUrl ??
    raw.image_url ??
    raw.thumbnail ??
    (typeof rawImages[0] === "string"
      ? rawImages[0]
      : typeof rawImages[0] === "object" && rawImages[0] && "url" in rawImages[0]
      ? String(rawImages[0].url)
      : "")
  ).trim()

  return {
    rowNumber,
    name,
    description,
    price,
    category,
    brand,
    sizes,
    stock,
    imageUrl,
    raw,
  }
}

const EXPECTED_HEADERS = ["name", "description", "price", "category", "brand", "sizes", "stock", "image_url"]
const DEMO_SOURCE = "dummyjson-fashion"
const JSON_TEMPLATE = `[
  {
    "name": "Classic White Oversized T-Shirt",
    "description": "Cotton oversized t-shirt for daily wear",
    "price": 1290,
    "currency": "KGS",
    "category": "tops",
    "brand": "Ainek Demo",
    "sku": "TOP-1001",
    "stock": 12,
    "sizes": ["S", "M", "L", "XL"],
    "images": [
      "https://example.com/images/white-tee.jpg"
    ]
  },
  {
    "title": "Wide Leg Denim Pants",
    "description": "Relaxed fit jeans",
    "price": 2490,
    "currency": "KGS",
    "category": "bottoms",
    "brand": "Ainek Demo",
    "sku": "BOT-1002",
    "stock": 7,
    "sizes": [
      { "size": "M", "stockQty": 3 },
      { "size": "L", "stockQty": 4 }
    ],
    "thumbnail": "https://example.com/images/denim-pants.jpg"
  }
]`

export default function ImportPage() {
  const csvFileRef = useRef<HTMLInputElement>(null)
  const jsonFileRef = useRef<HTMLInputElement>(null)

  const [csvPreview, setCsvPreview] = useState<PreviewProduct[]>([])
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const [csvParseError, setCsvParseError] = useState("")

  const [jsonText, setJsonText] = useState(JSON_TEMPLATE)
  const [jsonPreview, setJsonPreview] = useState<PreviewProduct[]>([])
  const [jsonErrors, setJsonErrors] = useState<string[]>([])
  const [jsonParseError, setJsonParseError] = useState("")

  const [importingCsv, setImportingCsv] = useState(false)
  const [importingJson, setImportingJson] = useState(false)
  const [importingDemo, setImportingDemo] = useState(false)
  const [summary, setSummary] = useState<ImportSummary | null>(null)

  const csvCountLabel = useMemo(() => `${csvPreview.length} товара(ов)`, [csvPreview.length])
  const jsonCountLabel = useMemo(() => `${jsonPreview.length} товара(ов)`, [jsonPreview.length])

  function resetSummary() {
    setSummary(null)
  }

  function handleCsvFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    resetSummary()
    setCsvParseError("")
    setCsvErrors([])
    setCsvPreview([])

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text.split(/\r?\n/).filter((line) => line.trim())
      if (lines.length < 2) {
        setCsvParseError("Файл пустой или содержит только заголовок")
        return
      }

      const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase())
      const missing = EXPECTED_HEADERS.filter((header) => !headers.includes(header))
      if (missing.length > 0) {
        setCsvParseError(`Отсутствуют колонки: ${missing.join(", ")}`)
        return
      }

      const idx = Object.fromEntries(EXPECTED_HEADERS.map((header) => [header, headers.indexOf(header)]))
      const preview: PreviewProduct[] = []
      const errors: string[] = []

      for (let i = 1; i < lines.length; i++) {
        const cols = parseCsvLine(lines[i])
        const name = cols[idx.name] ?? ""
        const price = cols[idx.price] ?? ""

        if (!name) {
          errors.push(`Строка ${i + 1}: пустое название`)
          continue
        }

        if (!price || Number.isNaN(Number(price)) || Number(price) <= 0) {
          errors.push(`Строка ${i + 1}: некорректная цена "${price}"`)
          continue
        }

        const raw = {
          name,
          description: cols[idx.description] ?? "",
          price,
          category: cols[idx.category] ?? "",
          brand: cols[idx.brand] ?? "",
          stock: cols[idx.stock] ?? "0",
          sizes: (cols[idx.sizes] ?? "")
            .split("|")
            .map((size) => size.trim())
            .filter(Boolean),
          images: (cols[idx.image_url] ?? "").trim()
            ? [{ url: cols[idx.image_url].trim(), isPrimary: true }]
            : [],
          currency: "KGS",
          is_active: true,
          is_virtual_try_on_enabled: true,
        }

        preview.push(normalizePreviewProduct(raw, i + 1))
      }

      setCsvPreview(preview)
      setCsvErrors(errors)
    }

    reader.readAsText(file, "UTF-8")
  }

  function handleJsonTextChange(value: string) {
    resetSummary()
    setJsonText(value)
    setJsonParseError("")
    setJsonErrors([])
    setJsonPreview([])
  }

  function parseJsonInput(rawText: string) {
    resetSummary()
    setJsonParseError("")
    setJsonErrors([])
    setJsonPreview([])

    try {
      const parsed = JSON.parse(rawText)
      const items = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.products)
        ? parsed.products
        : Array.isArray(parsed?.items)
        ? parsed.items
        : null

      if (!items) {
        setJsonParseError("JSON должен быть массивом товаров или объектом с полем products/items")
        return
      }

      const preview: PreviewProduct[] = []
      const errors: string[] = []

      items.forEach((item: unknown, index: number) => {
        if (!item || typeof item !== "object") {
          errors.push(`Элемент ${index + 1}: ожидался объект товара`)
          return
        }

        const previewItem = normalizePreviewProduct(item as Record<string, unknown>, index + 1)
        if (!previewItem.name) {
          errors.push(`Элемент ${index + 1}: нет поля name или title`)
          return
        }

        if (!previewItem.price || Number.isNaN(Number(previewItem.price)) || Number(previewItem.price) <= 0) {
          errors.push(`Элемент ${index + 1}: некорректная цена "${previewItem.price}"`)
          return
        }

        preview.push(previewItem)
      })

      setJsonPreview(preview)
      setJsonErrors(errors)
    } catch (error) {
      setJsonParseError(error instanceof Error ? error.message : "Не удалось распарсить JSON")
    }
  }

  function handleJsonFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      setJsonText(text)
      parseJsonInput(text)
    }
    reader.readAsText(file, "UTF-8")
  }

  async function submitImport(products: Record<string, unknown>[]) {
    const response = await fetch("/api/tenant/products/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products }),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error ?? "Ошибка импорта")
    }

    setSummary(data as ImportSummary)
  }

  async function handleCsvImport() {
    if (csvPreview.length === 0) return
    setImportingCsv(true)

    try {
      await submitImport(csvPreview.map((item) => item.raw))
      setCsvPreview([])
      setCsvErrors([])
      setCsvParseError("")
      if (csvFileRef.current) csvFileRef.current.value = ""
    } catch (error) {
      setSummary({
        imported: 0,
        failed: csvPreview.length,
        total: csvPreview.length,
        errors: [error instanceof Error ? error.message : "Ошибка импорта"],
      })
    } finally {
      setImportingCsv(false)
    }
  }

  async function handleJsonImport() {
    if (jsonPreview.length === 0) return
    setImportingJson(true)

    try {
      await submitImport(jsonPreview.map((item) => item.raw))
    } catch (error) {
      setSummary({
        imported: 0,
        failed: jsonPreview.length,
        total: jsonPreview.length,
        errors: [error instanceof Error ? error.message : "Ошибка импорта"],
      })
    } finally {
      setImportingJson(false)
    }
  }

  async function handleDemoImport() {
    resetSummary()
    setImportingDemo(true)

    try {
      const response = await fetch("/api/tenant/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: DEMO_SOURCE }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "Не удалось загрузить демо-каталог")
      }

      setSummary(data as ImportSummary)
    } catch (error) {
      setSummary({
        imported: 0,
        failed: 1,
        total: 1,
        errors: [error instanceof Error ? error.message : "Не удалось загрузить демо-каталог"],
      })
    } finally {
      setImportingDemo(false)
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Импорт гардероба</h1>
        <p className="text-white/50 text-sm mt-1">
          Добавляйте товары из CSV, собственного JSON или загрузите демо-каталог одежды в один клик
        </p>
      </div>

      <section className="p-5 rounded-2xl bg-white/5 border border-white/10 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-white font-semibold">Быстрый старт из интернета</h2>
            <p className="text-white/50 text-sm mt-1">
              Загружает демонстрационный JSON-каталог одежды и аксессуаров из публичного источника `DummyJSON`
            </p>
          </div>
          <button
            onClick={handleDemoImport}
            disabled={importingDemo}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {importingDemo ? "Загружаем..." : "Импортировать demo JSON"}
          </button>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-white font-semibold">Импорт JSON</h2>
              <p className="text-white/50 text-sm mt-1">
                Вставьте JSON-массив товаров или объект с `products/items`
              </p>
            </div>
            <button
              onClick={() => parseJsonInput(jsonText)}
              className="px-3 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/15 transition"
            >
              Проверить JSON
            </button>
          </div>

          <div className="flex gap-3 mb-3">
            <button
              onClick={() => setJsonText(JSON_TEMPLATE)}
              className="px-3 py-2 rounded-xl bg-white/10 text-white/80 text-sm hover:bg-white/15 transition"
            >
              Вставить шаблон
            </button>
            <label className="px-3 py-2 rounded-xl bg-white/10 text-white/80 text-sm hover:bg-white/15 transition cursor-pointer">
              Загрузить `.json`
              <input
                ref={jsonFileRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleJsonFileChange}
              />
            </label>
          </div>

          <textarea
            value={jsonText}
            onChange={(e) => handleJsonTextChange(e.target.value)}
            className="w-full min-h-[280px] rounded-2xl bg-black/30 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500 font-mono"
            spellCheck={false}
            placeholder='[{"name":"White Tee","price":1290}]'
          />

          {jsonParseError && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              {jsonParseError}
            </div>
          )}

          {jsonErrors.length > 0 && (
            <ErrorList
              className="mt-4"
              title={`Пропущено записей: ${jsonErrors.length}`}
              errors={jsonErrors}
              tone="yellow"
            />
          )}

          {jsonPreview.length > 0 && (
            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-white/60 text-sm">Готово к импорту: {jsonCountLabel}</p>
              <button
                onClick={handleJsonImport}
                disabled={importingJson}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {importingJson ? "Импорт..." : "Импортировать JSON"}
              </button>
            </div>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
          <h2 className="text-white font-semibold mb-1">Импорт CSV</h2>
          <p className="text-white/50 text-sm mb-4">
            Подходит для простых таблиц и массового ввода
          </p>

          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-4">
            <p className="text-blue-300 text-sm font-medium mb-1">Формат CSV</p>
            <p className="text-blue-300/70 text-xs font-mono">
              name, description, price, category, brand, sizes, stock, image_url
            </p>
            <p className="text-blue-300/50 text-xs mt-1">
              Для нескольких размеров используйте `|` в колонке `sizes`: `S|M|L|XL`
            </p>
          </div>

          <label className="flex flex-col items-center justify-center w-full h-36 rounded-2xl border-2 border-dashed border-white/20 cursor-pointer hover:border-violet-500/50 transition bg-white/5 hover:bg-white/[0.07]">
            <svg className="w-8 h-8 text-white/30 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-white/50 text-sm">Нажмите или перетащите CSV файл</p>
            <input
              ref={csvFileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleCsvFileChange}
            />
          </label>

          {csvParseError && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              {csvParseError}
            </div>
          )}

          {csvErrors.length > 0 && (
            <ErrorList
              className="mt-4"
              title={`Пропущено строк: ${csvErrors.length}`}
              errors={csvErrors}
              tone="yellow"
            />
          )}

          {csvPreview.length > 0 && (
            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-white/60 text-sm">Готово к импорту: {csvCountLabel}</p>
              <button
                onClick={handleCsvImport}
                disabled={importingCsv}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {importingCsv ? "Импорт..." : "Импортировать CSV"}
              </button>
            </div>
          )}
        </div>
      </section>

      {summary && (
        <section className={`p-5 rounded-2xl border mb-6 ${
          summary.imported > 0
            ? "bg-green-500/10 border-green-500/20"
            : "bg-red-500/10 border-red-500/20"
        }`}>
          <p className={`font-medium ${summary.imported > 0 ? "text-green-300" : "text-red-300"}`}>
            Импортировано: {summary.imported} из {summary.total}
          </p>
          <p className="text-white/60 text-sm mt-1">
            Ошибок: {summary.failed}
          </p>
          {summary.errors.length > 0 && (
            <ErrorList
              className="mt-4"
              title="Детали"
              errors={summary.errors}
              tone={summary.imported > 0 ? "yellow" : "red"}
            />
          )}
        </section>
      )}

      {jsonPreview.length > 0 && (
        <PreviewTable title={`Предпросмотр JSON — ${jsonCountLabel}`} items={jsonPreview} />
      )}

      {jsonPreview.length === 0 && csvPreview.length > 0 && (
        <PreviewTable title={`Предпросмотр CSV — ${csvCountLabel}`} items={csvPreview} />
      )}
    </div>
  )
}

function PreviewTable({ title, items }: { title: string; items: PreviewProduct[] }) {
  return (
    <section>
      <h2 className="text-white font-semibold mb-3">{title}</h2>
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left px-4 py-3 text-white/50 font-medium">Название</th>
              <th className="text-left px-4 py-3 text-white/50 font-medium">Цена</th>
              <th className="text-left px-4 py-3 text-white/50 font-medium">Категория</th>
              <th className="text-left px-4 py-3 text-white/50 font-medium">Бренд</th>
              <th className="text-left px-4 py-3 text-white/50 font-medium">Размеры</th>
            </tr>
          </thead>
          <tbody>
            {items.slice(0, 25).map((item) => (
              <tr key={`${item.rowNumber}-${item.name}`} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 text-white">{item.name}</td>
                <td className="px-4 py-3 text-violet-400 font-medium">
                  {Number(item.price).toLocaleString("ru-RU")}
                </td>
                <td className="px-4 py-3 text-white/50">{item.category || "—"}</td>
                <td className="px-4 py-3 text-white/50">{item.brand || "—"}</td>
                <td className="px-4 py-3 text-white/50">{item.sizes || "—"}</td>
              </tr>
            ))}
            {items.length > 25 && (
              <tr>
                <td colSpan={5} className="px-4 py-3 text-center text-white/30 text-xs">
                  …и ещё {items.length - 25} товара(ов)
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function ErrorList({
  title,
  errors,
  tone,
  className = "",
}: {
  title: string
  errors: string[]
  tone: "yellow" | "red"
  className?: string
}) {
  const styles = tone === "red"
    ? "bg-red-500/10 border-red-500/20 text-red-300"
    : "bg-yellow-500/10 border-yellow-500/20 text-yellow-300"

  return (
    <div className={`p-4 rounded-xl border ${styles} ${className}`.trim()}>
      <p className="text-sm font-medium mb-2">{title}</p>
      <ul className="space-y-1">
        {errors.slice(0, 8).map((error, index) => (
          <li key={`${error}-${index}`} className="text-xs opacity-80">
            {error}
          </li>
        ))}
        {errors.length > 8 && (
          <li className="text-xs opacity-60">…и ещё {errors.length - 8}</li>
        )}
      </ul>
    </div>
  )
}
