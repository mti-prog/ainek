export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#06060f] flex items-center justify-center">
      {children}
    </div>
  )
}
