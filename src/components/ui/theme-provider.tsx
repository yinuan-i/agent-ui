'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      enableColorScheme={false}
      themes={['light', 'night']}
      value={{ light: 'light', night: 'night', dark: 'night' }}
    >
      {children}
    </NextThemesProvider>
  )
}
