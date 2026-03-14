import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
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
        'chat.expand_message': 'Expand message',
        'chat.collapse_message': 'Collapse message',
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

  it('renders tool-call drawer as right-side panel', () => {
    render(<Messages messages={messages} />)
    fireEvent.click(screen.getAllByText('TOOL CALLED 1')[0])
    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('right-0')
    expect(dialog.className).toContain('translate-x-0')
    expect(dialog.className).toContain('duration-300')
    expect(dialog.className).toContain('bg-background')
    expect(dialog.className).not.toContain('-translate-x-1/2')
    expect(dialog.className).not.toContain('-translate-y-1/2')
  })

  it('collapses long user messages and toggles expansion', async () => {
    const originalGetComputedStyle = window.getComputedStyle
    const originalScrollHeight = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'scrollHeight'
    )
    window.getComputedStyle = () =>
      ({ lineHeight: '24px' } as CSSStyleDeclaration)
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get() {
        return 24 * 8
      }
    })

    const longText = Array.from({ length: 10 }).fill('line').join('\n')
    const { container } = render(
      <Messages
        messages={[{ role: 'user', content: longText, created_at: 1 }]}
      />
    )

    const toggle = await within(container).findByLabelText('Expand message')
    const content = within(container).getByTestId('user-message-content')
    expect(content.className).toContain('text-left')
    expect(content.style.maxHeight).toBe('168px')

    fireEvent.click(toggle)
    expect(content.style.maxHeight).toBe('none')

    window.getComputedStyle = originalGetComputedStyle
    if (originalScrollHeight) {
      Object.defineProperty(
        HTMLElement.prototype,
        'scrollHeight',
        originalScrollHeight
      )
    } else {
      delete (HTMLElement.prototype as { scrollHeight?: number }).scrollHeight
    }
  })
})
