import { messages } from '@/i18n/messages'
import type { Locale } from '@/i18n/LocaleProvider'

const STORAGE_KEY = 'agent-ui-locale'

const isValidLocale = (value: string | null | undefined): value is Locale =>
  value === 'zh' || value === 'en'

export const getRuntimeLocale = (): Locale => {
  try {
    const docLang = document?.documentElement?.lang
    if (isValidLocale(docLang)) return docLang
  } catch {
    // Ignore and fall back.
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (isValidLocale(stored)) return stored
  } catch {
    // Ignore and fall back.
  }

  return 'zh'
}

export const tRuntime = (key: string): string => {
  const locale = getRuntimeLocale()
  const result = messages[locale]?.[key]
  if (!result && process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(`[i18n] Missing key: ${key}`)
  }
  return result ?? key
}
