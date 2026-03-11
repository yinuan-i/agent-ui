import { act, renderHook } from '@testing-library/react'
import { expect, test } from 'vitest'
import React from 'react'
import { LocaleProvider, useLocale } from '@/i18n/LocaleProvider'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LocaleProvider>{children}</LocaleProvider>
)

test('defaults to zh locale', () => {
  const { result } = renderHook(() => useLocale(), { wrapper })
  expect(result.current.locale).toBe('zh')
})

test('ignores invalid locale updates', () => {
  const { result } = renderHook(() => useLocale(), { wrapper })
  act(() => result.current.setLocale('xx' as 'zh'))
  expect(result.current.locale).toBe('zh')
})

test('t() returns key when missing', () => {
  const { result } = renderHook(() => useLocale(), { wrapper })
  expect(result.current.t('missing.key')).toBe('missing.key')
})
