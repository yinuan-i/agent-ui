'use client'

import { Button } from '@/components/ui/button'
import Icon from '@/components/ui/icon'
import useChatActions from '@/hooks/useChatActions'
import { useStore } from '@/store'
import { useLocale } from '@/i18n/LocaleProvider'

function NewChatButton() {
  const { t } = useLocale()
  const { clearChat } = useChatActions()
  const { messages } = useStore()
  return (
    <Button
      className="z-10 cursor-pointer rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-primary shadow-none hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
      onClick={clearChat}
      disabled={messages.length === 0}
    >
      <div className="flex items-center gap-2">
        <p>{t('sidebar.new_chat')}</p>{' '}
        <Icon type="plus-icon" size="xs" className="text-primary" />
      </div>
    </Button>
  )
}

export default NewChatButton
