'use client'

import { useTheme } from 'next-themes'
import { useLocale } from '@/i18n/LocaleProvider'

const THEMES = ['light', 'night', 'system'] as const

type ThemeOption = (typeof THEMES)[number]

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const { t } = useLocale()
  const currentTheme = (theme ?? 'system') as ThemeOption

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="text-xs font-medium uppercase text-primary">
        {t('sidebar.theme')}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {THEMES.map((value) => {
          const isActive = currentTheme === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className={
                isActive
                  ? 'h-9 rounded-xl border border-border bg-background text-xs font-medium text-primary'
                  : 'h-9 rounded-xl border border-border bg-background-secondary text-xs font-medium text-secondary hover:bg-surface-hover'
              }
            >
              {t(`sidebar.theme_${value}`)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
