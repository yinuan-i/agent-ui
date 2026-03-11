'use client'

import * as React from 'react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { useStore } from '@/store'
import { useQueryState } from 'nuqs'
import useChatActions from '@/hooks/useChatActions'
import { useLocale } from '@/i18n/LocaleProvider'

export function ModeSelector() {
  const { t } = useLocale()
  const { mode, setMode, setMessages, setSelectedModel } = useStore()
  const { clearChat } = useChatActions()
  const [, setAgentId] = useQueryState('agent')
  const [, setTeamId] = useQueryState('team')
  const [, setSessionId] = useQueryState('session')

  const handleModeChange = (newMode: 'agent' | 'team') => {
    if (newMode === mode) return

    setMode(newMode)

    setAgentId(null)
    setTeamId(null)
    setSelectedModel('')
    setMessages([])
    setSessionId(null)
    clearChat()
  }

  return (
    <>
      <Select
        defaultValue={mode}
        value={mode}
        onValueChange={(value) => handleModeChange(value as 'agent' | 'team')}
      >
        <SelectTrigger className="h-9 w-full rounded-xl border border-border bg-background text-xs font-medium uppercase text-secondary">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border border-border bg-background font-geist shadow-lg">
          <SelectItem value="agent" className="cursor-pointer">
            <div className="text-xs font-medium uppercase">
              {t('sidebar.mode_agent')}
            </div>
          </SelectItem>

          <SelectItem value="team" className="cursor-pointer">
            <div className="text-xs font-medium uppercase">
              {t('sidebar.mode_team')}
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </>
  )
}
