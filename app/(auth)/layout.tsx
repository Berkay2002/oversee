import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verkstads Insikt - Logga in',
  description: 'Logga in till Verkstads Insikt',
}

/**
 * Auth layout - Centered layout for authentication pages
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
