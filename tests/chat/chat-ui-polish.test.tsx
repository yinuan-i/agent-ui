import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import Messages from '@/components/chat/ChatArea/Messages/Messages'
import type { ChatMessage } from '@/types/os'

;(globalThis as any).React = React

vi.mock('@/store', () => ({
  useStore: (selector?: (state: { isStreaming: boolean; streamingErrorMessage: string | null }) => unknown) => {
    const state = { isStreaming: false, streamingErrorMessage: null }
    return typeof selector === 'function' ? selector(state) : state
  }
}))

vi.mock('@/i18n/LocaleProvider', () => ({
  useLocale: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'chat.tool_call_bar': 'TOOL CALLED {count}',
        'chat.tool_calls': 'Tool Calls',
        'chat.tool_name': 'Tool Name',
        'chat.tool_args': 'Tool Args',
        'chat.tool_metrics': 'Tool Metrics',
        'chat.tool_result': 'Tool Result',
        'chat.tool': 'Tool',
        'chat.tool_call_completed': 'Tool call completed: ',
        'chat.run_started': 'Run Started',
        'chat.run_in_progress': 'Run In Progress',
        'chat.run_completed': 'Run Completed',
        'chat.worked_for': 'Worked for',
        'time.seconds_short': 's'
      }
      return map[key] ?? key
    }
  })
}))

describe('chat ui polish', () => {
  const messages: ChatMessage[] = [
    { role: 'user', content: 'hi', created_at: 1 },
    {
      role: 'agent',
      content: 'hello',
      created_at: 2,
      tool_calls: [
        {
          role: 'tool',
          content: null,
          tool_call_id: 'call_1',
          tool_name: 'search_faq',
          tool_args: { query: 'x' },
          tool_call_error: false,
          created_at: 3
        }
      ]
    }
  ]

  it('renders tool-call bar between user and assistant', () => {
    render(<Messages messages={messages} />)
    expect(screen.getByText('TOOL CALLED 1')).toBeTruthy()
  })

  it('opens tool-call drawer on bar click', () => {
    render(<Messages messages={messages} />)
    fireEvent.click(screen.getAllByText('TOOL CALLED 1')[0])
    expect(screen.getByText('Tool Calls')).toBeTruthy()
    expect(screen.getAllByText('search_faq')[0]).toBeTruthy()
  })
})
