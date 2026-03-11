'use client'

import { useLocale } from '@/i18n/LocaleProvider'

const ChatBlankState = () => {
  const { t } = useLocale()
  return (
    <div className="flex w-full max-w-[560px] flex-col items-center gap-3 text-center">
      <h1 className="text-[24px] font-semibold leading-[1.25] text-primary">
        {t('chat.blank_title')}
      </h1>
      <p className="text-sm leading-5 text-secondary">
        {t('chat.blank_subtitle')}
      </p>
    </div>
  )
}

export default ChatBlankState
