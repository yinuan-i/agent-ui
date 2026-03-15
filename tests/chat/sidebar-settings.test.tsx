import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import Sidebar from '@/components/chat/Sidebar/Sidebar'

;(globalThis as any).React = React

vi.mock('@/hooks/useChatActions', () => ({
  default: () => ({
    clearChat: vi.fn(),
    focusChatInput: vi.fn(),
    initialize: vi.fn()
  })
}))

vi.mock('@/hooks/useSessionLoader', () => ({
  default: () => ({
    getSessions: vi.fn(),
    getSession: vi.fn()
  })
}))

vi.mock('nuqs', () => ({
  useQueryState: () => [null, vi.fn()]
}))

vi.mock('@/store', () => ({
  useStore: (selector?: (state: any) => unknown) => {
    const state = {
      messages: [],
      selectedEndpoint: 'http://localhost:7777',
      isEndpointActive: true,
      selectedModel: '',
      hydrated: true,
      isEndpointLoading: false,
      mode: 'agent',
      agents: [],
      teams: [],
      sessionsData: [],
      isSessionsLoading: false,
      authToken: '',
      setAuthToken: vi.fn(),
      setSelectedEndpoint: vi.fn(),
      setAgents: vi.fn(),
      setSessionsData: vi.fn(),
      setMessages: vi.fn(),
      setSelectedModel: vi.fn()
    }
    return typeof selector === 'function' ? selector(state) : state
  }
}))

vi.mock('@/i18n/LocaleProvider', () => ({
  useLocale: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'sidebar.settings': 'Settings',
        'sidebar.agentos': 'AgentOS',
        'sidebar.auth_token': 'Auth Token',
        'sidebar.mode': 'Mode',
        'sidebar.theme': 'Theme',
        'sidebar.new_chat': 'New Chat',
        'sidebar.mode_agent': 'Agent',
        'sidebar.mode_team': 'Team',
        'sidebar.endpoint_placeholder': 'No endpoint added',
        'sidebar.sessions': 'Sessions'
      }
      return map[key] ?? key
    },
    locale: 'en',
    setLocale: vi.fn()
  })
}))

describe('sidebar settings', () => {
  it('opens settings popover and shows settings sections', async () => {
    render(<Sidebar />)

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))

    expect(await screen.findByText('AgentOS')).toBeTruthy()
    expect(screen.getByText('Auth Token')).toBeTruthy()
    expect(screen.queryByText('Mode')).toBeNull()
    expect(screen.getByText('Theme')).toBeTruthy()
  })
})
