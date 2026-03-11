import { expect, test } from 'vitest'
import { messages } from '@/i18n/messages'

test('messages define zh and en locales', () => {
  expect(messages.zh).toBeTruthy()
  expect(messages.en).toBeTruthy()
})
