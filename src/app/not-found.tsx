import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#06060f] flex flex-col items-center justify-center gap-4 text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-2xl font-bold text-white mb-2">
        A
      </div>
      <h1 className="text-4xl font-bold text-white">404</h1>
      <p className="text-white/50">Страница не найдена</p>
      <Link
        href="/"
        className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:opacity-90 transition"
      >
        На главную
      </Link>
    </div>
  )
}
