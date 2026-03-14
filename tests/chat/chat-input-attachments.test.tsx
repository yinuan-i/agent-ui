import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import ChatInput from '@/components/chat/ChatArea/ChatInput/ChatInput'

;(globalThis as any).React = React

const handleStreamResponse = vi.fn()

vi.mock('@/hooks/useAIStreamHandler', () => ({
  default: () => ({ handleStreamResponse })
}))

vi.mock('nuqs', () => ({
  useQueryState: (key: string) => [key === 'agent' ? 'agent-1' : null, vi.fn()]
}))

vi.mock('@/store', () => ({
  useStore: (
    selector?: (state: { chatInputRef: { current: null }; isStreaming: boolean }) => unknown
  ) => {
    const state = { chatInputRef: { current: null }, isStreaming: false }
    return typeof selector === 'function' ? selector(state) : state
  }
}))

vi.mock('@/i18n/LocaleProvider', () => ({
  useLocale: () => ({
    t: (key: string) => key
  })
}))

describe('ChatInput attachments', () => {
  beforeEach(() => {
    handleStreamResponse.mockClear()
  })

  it('renders selected file and allows removing', async () => {
    const { container } = render(<ChatInput />)
    const input = within(container).getByLabelText('chat.add_attachments', {
      selector: 'input'
    }) as HTMLInputElement
    const file = new File(['hello'], 'avatar.png', { type: 'image/png' })

    fireEvent.change(input, { target: { files: [file] } })

    expect(screen.getByText('avatar.png')).toBeTruthy()

    fireEvent.click(within(container).getByLabelText('chat.remove_attachment'))

    await waitFor(() => {
      expect(screen.queryByText('avatar.png')).toBeNull()
    })
  })

  it('submits FormData when file attached', async () => {
    const { container } = render(<ChatInput />)
    const input = within(container).getByLabelText('chat.add_attachments', {
      selector: 'input'
    }) as HTMLInputElement
    const file = new File(['hello'], 'doc.pdf', { type: 'application/pdf' })

    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.click(within(container).getByLabelText('chat.send'))

    await waitFor(() => {
      expect(handleStreamResponse).toHaveBeenCalledTimes(1)
    })

    const arg = handleStreamResponse.mock.calls[0][0]
    expect(arg).toBeInstanceOf(FormData)
  })
})
