'use client'

import ChatInput from './ChatInput'
import MessageArea from './MessageArea'
import ChatBlankState from './Messages/ChatBlankState'
import { useStore } from '@/store'
import { useLocale } from '@/i18n/LocaleProvider'
import { EntitySelector } from '@/components/chat/Sidebar/EntitySelector'
import { useQueryState } from 'nuqs'
import useChatActions from '@/hooks/useChatActions'

const ChatTopBar = () => {
  const { t } = useLocale()
  const { mode, setMode, setMessages, setSelectedModel } = useStore()
  const { clearChat } = useChatActions()
  const [, setAgentId] = useQueryState('agent')
  const [, setTeamId] = useQueryState('team')
  const [, setSessionId] = useQueryState('session')

  const handleModeToggle = () => {
    const newMode = mode === 'agent' ? 'team' : 'agent'
    setMode(newMode)
    setAgentId(null)
    setTeamId(null)
    setSelectedModel('')
    setMessages([])
    setSessionId(null)
    clearChat()
  }

  return (
    <div className="flex h-14 items-center justify-between px-6">
      <div className="flex items-center gap-2 text-sm font-medium text-primary">
        <button
          type="button"
          onClick={handleModeToggle}
          className="rounded-full border border-border bg-background-secondary px-3 py-1 text-xs font-medium uppercase text-primary hover:bg-surface-hover"
        >
          {mode === 'agent' ? t('sidebar.mode_agent') : t('sidebar.mode_team')}
        </button>
        <EntitySelector variant="topbar" />
      </div>
      <div className="flex items-center gap-2">
        <div className="rounded-full px-3 py-2 text-[13px] font-medium leading-4 text-primary hover:bg-surface-hover">
          {t('chat.login')}
        </div>
        <div className="night-outline-strong rounded-full bg-primary px-3 py-2 text-[13px] font-medium leading-4 text-primary-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]">
          {t('chat.signup')}
        </div>
      </div>
    </div>
  )
}

const ChatArea = () => {
  const { messages } = useStore()
  const isEmpty = messages.length === 0

  return (
    <main className="relative flex min-w-0 flex-1 flex-col bg-background">
      <ChatTopBar />
      {isEmpty ? (
        <div className="-mt-8 flex flex-1 flex-col items-center justify-center gap-6 px-4 pb-24 pt-8">
          <ChatBlankState />
          <div className="w-full max-w-[768px]">
            <ChatInput />
          </div>
        </div>
      ) : (
        <div className="relative flex min-h-0 flex-1 flex-col">
          <MessageArea />
          <div className="sticky bottom-0 mx-auto w-full max-w-[768px] px-4 pb-6">
            <ChatInput />
          </div>
        </div>
      )}
    </main>
  )
}

export default ChatArea
