'use client'
import { Button } from '@/components/ui/button'
import useChatActions from '@/hooks/useChatActions'
import { useStore } from '@/store'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Icon from '@/components/ui/icon'
import Sessions from './Sessions'
import { useQueryState } from 'nuqs'
import { useLocale } from '@/i18n/LocaleProvider'
import SettingsPopover from './SettingsPopover'

const SidebarHeader = () => {
  const { t } = useLocale()
  return (
    <div className="flex items-center gap-2">
      <img
        src="/favicon.ico"
        alt={t('app.title')}
        className="h-4 w-4 rounded-sm"
      />
      <span className="text-xs font-medium uppercase text-primary">
        {t('app.title')}
      </span>
    </div>
  )
}

const NewChatButton = ({
  disabled,
  onClick
}: {
  disabled: boolean
  onClick: () => void
}) => {
  const { t } = useLocale()
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size="lg"
      className="h-9 w-full rounded-xl border border-border bg-background text-xs font-medium text-primary shadow-none hover:bg-surface-hover"
    >
      <Icon type="plus-icon" size="xs" className="text-primary" />
      <span className="uppercase">{t('sidebar.new_chat')}</span>
    </Button>
  )
}


const Sidebar = ({
  hasEnvToken,
  envToken
}: {
  hasEnvToken?: boolean
  envToken?: string
}) => {
  const { t } = useLocale()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { clearChat, focusChatInput, initialize } = useChatActions()
  const {
    messages,
    selectedEndpoint,
    isEndpointActive,
    selectedModel,
    hydrated,
    isEndpointLoading,
    mode
  } = useStore()
  const [isMounted, setIsMounted] = useState(false)
  const [agentId] = useQueryState('agent')
  const [teamId] = useQueryState('team')

  useEffect(() => {
    setIsMounted(true)

    if (hydrated) initialize()
  }, [selectedEndpoint, initialize, hydrated, mode])

  const handleNewChat = () => {
    clearChat()
    focusChatInput()
  }

  return (
    <motion.aside
      className="relative flex h-screen shrink-0 grow-0 flex-col overflow-hidden border-r border-border bg-background-secondary px-2 py-3 font-geist"
      initial={{ width: '16rem' }}
      animate={{ width: isCollapsed ? '2.5rem' : '16rem' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <motion.button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute right-2 top-2 z-10 p-1"
        aria-label={
          isCollapsed ? t('sidebar.expand') : t('sidebar.collapse')
        }
        type="button"
        whileTap={{ scale: 0.95 }}
      >
        <Icon
          type="sheet"
          size="xs"
          className={`transform ${isCollapsed ? 'rotate-180' : 'rotate-0'}`}
        />
      </motion.button>
      <motion.div
        className="flex h-full w-60 flex-col"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: isCollapsed ? 0 : 1, x: isCollapsed ? -20 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{
          pointerEvents: isCollapsed ? 'none' : 'auto'
        }}
      >
        <div className="space-y-5">
          <SidebarHeader />
          <NewChatButton
            disabled={messages.length === 0}
            onClick={handleNewChat}
          />
        </div>
        {isMounted && (
          <div className="mt-5 flex min-h-0 flex-1 flex-col gap-4">
            {isEndpointActive && <Sessions />}
            <div className="mt-auto">
              <SettingsPopover
                hasEnvToken={hasEnvToken}
                envToken={envToken}
                isEndpointActive={isEndpointActive}
                isEndpointLoading={isEndpointLoading}
                selectedModel={selectedModel}
                agentId={agentId}
                teamId={teamId}
              />
            </div>
          </div>
        )}
      </motion.div>
    </motion.aside>
  )
}

export default Sidebar
