import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shared Documents',
  description: 'Access shared booking documents',
}

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}