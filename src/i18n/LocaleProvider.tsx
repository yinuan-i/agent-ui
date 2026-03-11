'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { messages } from '@/i18n/messages'

export type Locale = 'zh' | 'en'

type LocaleContextValue = {
  locale: Locale
  setLocale: (next: Locale) => void
  t: (key: string) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

const STORAGE_KEY = 'agent-ui-locale'

const isValidLocale = (value: string | null): value is Locale =>
  value === 'zh' || value === 'en'

export const LocaleProvider = ({
  children
}: {
  children: React.ReactNode
}) => {
  const [locale, setLocaleState] = useState<Locale>('zh')

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (isValidLocale(stored)) {
        setLocaleState(stored)
      }
    } catch {
      // Keep current locale if storage access fails.
    }
  }, [])

  useEffect(() => {
    try {
      document.documentElement.lang = locale
      document.title = messages[locale]?.['app.title'] ?? document.title
      localStorage.setItem(STORAGE_KEY, locale)
    } catch {
      // Keep current locale if browser APIs fail.
    }
  }, [locale])

  const value = useMemo<LocaleContextValue>(() => {
    const t = (key: string) => {
      const current = messages[locale]
      const result = current?.[key]
      if (!result && process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn(`[i18n] Missing key: ${key}`)
      }
      return result ?? key
    }

    const setLocale = (next: Locale) => {
      if (isValidLocale(next)) {
        setLocaleState(next)
      }
    }

    return { locale, setLocale, t }
  }, [locale])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export const useLocale = () => {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return ctx
}
