'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'

import { useLocale } from '@/i18n/LocaleProvider'
import Icon from '@/components/ui/icon'
import Endpoint from './Endpoint'
import AuthToken from './AuthToken'
import ThemeSelector from './ThemeSelector'
import LanguageToggle from './LanguageToggle'

interface SettingsPopoverProps {
  hasEnvToken?: boolean
  envToken?: string
}

const SettingsPopover = ({ hasEnvToken, envToken }: SettingsPopoverProps) => {
  const { t } = useLocale()

  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium uppercase text-primary transition-colors hover:bg-surface-hover"
          aria-label={t('sidebar.settings')}
        >
          <span>{t('sidebar.settings')}</span>
          <Icon type="chevron-up" size="xs" className="text-secondary" />
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content className="fixed bottom-4 left-4 z-50 w-[15rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-background p-4 font-geist shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0">
          <DialogPrimitive.Title className="sr-only">
            {t('sidebar.settings')}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {t('sidebar.settings')}
          </DialogPrimitive.Description>
          <div className="flex max-h-[80vh] flex-col gap-4 overflow-auto pr-1">
            <LanguageToggle />
            <Endpoint />
            <AuthToken hasEnvToken={hasEnvToken} envToken={envToken} />
            <ThemeSelector />
          </div>
          <DialogPrimitive.Close className="absolute right-3 top-3 rounded-md opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <Icon type="x" size="xs" />
            <span className="sr-only">{t('actions.close')}</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export default SettingsPopover
