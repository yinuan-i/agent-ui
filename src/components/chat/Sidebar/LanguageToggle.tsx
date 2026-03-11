'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import { cn } from '@/lib/utils'

const LanguageToggle = () => {
  const { locale, setLocale, t } = useLocale()

  const options = [
    { value: 'zh' as const, label: t('language.zh') },
    { value: 'en' as const, label: t('language.en') }
  ]

  return (
    <div className="flex w-full items-center rounded-xl border border-border bg-background p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setLocale(option.value)}
          className={cn(
            'flex-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors',
            locale === option.value
              ? 'bg-primary text-primary-foreground'
              : 'text-secondary hover:bg-surface-hover'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default LanguageToggle
