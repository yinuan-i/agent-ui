import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Messages from '@/components/chat/ChatArea/Messages/Messages'
import type { ChatMessage } from '@/types/os'

vi.mock('@/store', () => ({
  useStore: (selector: (state: { isStreaming: boolean }) => unknown) =>
    selector({ isStreaming: true })
}))

vi.mock('@/i18n/LocaleProvider', () => ({
  useLocale: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'chat.working': 'Working...',
        'chat.tool_call_started': 'Tool Call Started: {tool}',
        'chat.tool': 'Tool',
        'chat.worked_for': 'Worked for',
        'chat.run_started': 'Run Started',
        'chat.run_in_progress': 'Run In Progress',
        'chat.run_completed': 'Run Completed',
        'chat.tool_call_completed': 'Tool call completed: ',
        'chat.tool_calls': 'Tool Calls',
        'time.seconds_short': 's'
      }
      return map[key] ?? key
    }
  })
}))

describe('Messages working indicator', () => {
  const baseMessages: ChatMessage[] = [
    {
      role: 'user',
      content: 'hello',
      created_at: 1
    },
    {
      role: 'agent',
      content: '',
      created_at: 2,
      tool_calls: [],
      extra_data: {
        streaming_status: { status: 'working' }
      }
    }
  ]

  it('shows Working... when streaming_status is working', () => {
    render(<Messages messages={baseMessages} />)
    expect(screen.getByText('Working...')).toBeInTheDocument()
  })

  it('shows Tool Call Started label with tool name', () => {
    const messages: ChatMessage[] = [
      baseMessages[0],
      {
        ...baseMessages[1],
        extra_data: {
          streaming_status: { status: 'tool_started', tool_name: 'search_faq' }
        }
      }
    ]
    render(<Messages messages={messages} />)
    expect(
      screen.getByText('Tool Call Started: search_faq')
    ).toBeInTheDocument()
  })
})
