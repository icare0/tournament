'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/query-client'
import './globals.css'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <title>Bloom | Plateforme de Gestion de Tournois</title>
        <meta
          name="description"
          content="Créez et gérez des tournois esports professionnels avec Bloom. L'architecture du tournoi moderne."
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  )
}
