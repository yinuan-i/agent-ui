'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useEffect, useMemo, useState } from 'react'
import { useQueryState } from 'nuqs'

import { useStore } from '@/store'
import { useLocale } from '@/i18n/LocaleProvider'
import useChatActions from '@/hooks/useChatActions'
import Icon from '@/components/ui/icon'

const TopbarEntityMenu = () => {
  const { t } = useLocale()
  const { clearChat, focusChatInput } = useChatActions()
  const {
    mode,
    agents,
    teams,
    setMode,
    setMessages,
    setSelectedModel
  } = useStore()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'root' | 'entities'>('root')
  const [pendingMode, setPendingMode] = useState<'agent' | 'team'>(mode)

  const [agentId, setAgentId] = useQueryState('agent', {
    parse: (value) => value || undefined,
    history: 'push'
  })
  const [teamId, setTeamId] = useQueryState('team', {
    parse: (value) => value || undefined,
    history: 'push'
  })
  const [, setSessionId] = useQueryState('session')

  const currentEntity = useMemo(() => {
    if (mode === 'team') {
      return teams.find((team) => team.id === teamId)
    }
    return agents.find((agent) => agent.id === agentId)
  }, [agents, teams, agentId, teamId, mode])

  useEffect(() => {
    const currentValue = mode === 'team' ? teamId : agentId
    const currentEntities = mode === 'team' ? teams : agents

    if (currentValue && currentEntities.length > 0) {
      const entity = currentEntities.find((item) => item.id === currentValue)
      if (entity) {
        setSelectedModel(entity.model?.model || '')
        if (mode === 'team') {
          setTeamId(entity.id)
        }
        if (entity.model?.model) {
          focusChatInput()
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId, teamId, agents, teams, mode])

  const triggerLabel = currentEntity?.name || currentEntity?.id
  const placeholder =
    mode === 'team' ? t('sidebar.select_team') : t('sidebar.select_agent')

  const entities = pendingMode === 'team' ? teams : agents
  const emptyPlaceholder =
    pendingMode === 'team'
      ? t('sidebar.no_teams_available')
      : t('sidebar.no_agents_available')

  const resetSelection = () => {
    setAgentId(null)
    setTeamId(null)
    setSelectedModel('')
    setMessages([])
    setSessionId(null)
  }

  const handleModeSelect = (newMode: 'agent' | 'team') => {
    if (newMode !== mode) {
      setMode(newMode)
      resetSelection()
      clearChat()
    }
    setPendingMode(newMode)
    setStep('entities')
  }

  const handleEntitySelect = (entityId: string) => {
    const selectedEntity = entities.find((entity) => entity.id === entityId)

    setSelectedModel(selectedEntity?.model?.provider || '')

    if (pendingMode === 'team') {
      setTeamId(entityId)
      setAgentId(null)
    } else {
      setAgentId(entityId)
      setTeamId(null)
    }

    setMessages([])
    setSessionId(null)

    if (selectedEntity?.model?.provider) {
      focusChatInput()
    }

    setOpen(false)
    setStep('root')
  }

  return (
    <DropdownMenu.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        setStep('root')
        if (nextOpen) {
          setPendingMode(mode)
        }
      }}
    >
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-border bg-background-secondary px-3 py-1 text-xs font-medium text-primary"
        >
          <span className="max-w-[200px] truncate">
            {triggerLabel || placeholder}
          </span>
          <Icon type="chevron-down" size="xs" className="text-secondary" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[220px] rounded-xl border border-border bg-background p-1 text-secondary shadow-lg"
          sideOffset={6}
        >
          {step === 'root' ? (
            <>
              <DropdownMenu.Item
                onSelect={(event) => {
                  event.preventDefault()
                  handleModeSelect('agent')
                }}
                className="cursor-pointer rounded-lg px-3 py-2 text-xs font-medium uppercase text-primary outline-none hover:bg-surface-hover"
              >
                {t('sidebar.mode_agent')}
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={(event) => {
                  event.preventDefault()
                  handleModeSelect('team')
                }}
                className="cursor-pointer rounded-lg px-3 py-2 text-xs font-medium uppercase text-primary outline-none hover:bg-surface-hover"
              >
                {t('sidebar.mode_team')}
              </DropdownMenu.Item>
            </>
          ) : (
            <>
              <DropdownMenu.Item
                onSelect={(event) => {
                  event.preventDefault()
                  setStep('root')
                }}
                className="cursor-pointer rounded-lg px-3 py-2 text-xs font-medium uppercase text-secondary outline-none hover:bg-surface-hover"
              >
                {t('actions.back')}
              </DropdownMenu.Item>
              <div className="my-1 h-px bg-border" />
              {entities.length === 0 ? (
                <DropdownMenu.Item
                  disabled
                  className="cursor-not-allowed rounded-lg px-3 py-2 text-xs font-medium text-muted"
                >
                  {emptyPlaceholder}
                </DropdownMenu.Item>
              ) : (
                entities.map((entity) => (
                  <DropdownMenu.Item
                    key={entity.id}
                    onSelect={() => handleEntitySelect(entity.id)}
                    className="cursor-pointer rounded-lg px-3 py-2 text-xs font-medium text-primary outline-none hover:bg-surface-hover"
                  >
                    {entity.name || entity.id}
                  </DropdownMenu.Item>
                ))
              )}
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export default TopbarEntityMenu
