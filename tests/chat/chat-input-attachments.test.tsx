import { describe, expect, it, vi } from vitest
import { fireEvent, render, screen, waitFor } from @testing-library/react
import ChatInput from @/components/chat/ChatArea/ChatInput/ChatInput

const handleStreamResponse = vi.fn()

vi.mock(@/hooks/useAIStreamHandler, () => ({
  default: () => ({ handleStreamResponse })
}))

vi.mock(nuqs, () => ({
  useQueryState: (key: string) => [key === agent ? agent-1 : null, vi.fn()]
}))

vi.mock(@/store, () => ({
  useStore: (selector: any) =>
    selector({
      chatInputRef: { current: null },
      isStreaming: false
    })
}))

vi.mock(@/i18n/LocaleProvider, () => ({
  useLocale: () => ({
    t: (key: string) => key
  })
}))

describe(ChatInput