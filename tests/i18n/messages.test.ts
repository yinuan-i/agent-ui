import { expect, test } from 'vitest'
import { messages } from '@/i18n/messages'

test('messages define zh and en locales', () => {
  expect(messages.zh).toBeTruthy()
  expect(messages.en).toBeTruthy()
})

test('messages define tool call started label', () => {
  expect(messages.zh['chat.tool_call_started']).toBeTruthy()
  expect(messages.en['chat.tool_call_started']).toBeTruthy()
})
