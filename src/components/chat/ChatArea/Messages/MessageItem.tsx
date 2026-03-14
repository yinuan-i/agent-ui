import Icon from '@/components/ui/icon'
import MarkdownRenderer from '@/components/ui/typography/MarkdownRenderer'
import { useStore } from '@/store'
import type { ChatMessage } from '@/types/os'
import Videos from './Multimedia/Videos'
import Images from './Multimedia/Images'
import Audios from './Multimedia/Audios'
import { memo, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import AgentThinkingLoader from './AgentThinkingLoader'
import { useLocale } from '@/i18n/LocaleProvider'

interface MessageProps {
  message: ChatMessage
  header?: ReactNode
}

const AgentMessage = ({ message, header }: MessageProps) => {
  const { t } = useLocale()
  const { streamingErrorMessage } = useStore()
  let messageContent
  if (message.streamingError) {
    messageContent = (
      <p className="text-destructive">
        {t('chat.streaming_error_title')}{' '}
        {streamingErrorMessage ? (
          <>{streamingErrorMessage}</>
        ) : (
          t('chat.streaming_error_retry')
        )}
      </p>
    )
  } else if (message.content) {
    messageContent = (
      <div className="flex w-full flex-col gap-4">
        <MarkdownRenderer>{message.content}</MarkdownRenderer>
        {message.videos && message.videos.length > 0 && (
          <Videos videos={message.videos} />
        )}
        {message.images && message.images.length > 0 && (
          <Images images={message.images} />
        )}
        {message.audio && message.audio.length > 0 && (
          <Audios audio={message.audio} />
        )}
      </div>
    )
  } else if (message.response_audio) {
    if (!message.response_audio.transcript) {
      messageContent = (
        <div className="mt-2 flex items-start">
          <AgentThinkingLoader />
        </div>
      )
    } else {
      messageContent = (
        <div className="flex w-full flex-col gap-4">
          <MarkdownRenderer>
            {message.response_audio.transcript}
          </MarkdownRenderer>
          {message.response_audio.content && message.response_audio && (
            <Audios audio={[message.response_audio]} />
          )}
        </div>
      )
    }
  } else {
    messageContent = (
      <div className="mt-2">
        <AgentThinkingLoader />
      </div>
    )
  }

  return (
    <div className="flex flex-row items-start gap-4 font-geist text-primary">
      <div className="flex-shrink-0">
        <Icon type="agent" size="sm" />
      </div>
      <div className="flex w-full flex-col gap-4">
        {header}
        {messageContent}
      </div>
    </div>
  )
}

const UserMessage = memo(({ message }: MessageProps) => {
  const { t } = useLocale()
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [isCollapsible, setIsCollapsible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [collapsedHeight, setCollapsedHeight] = useState<number | null>(null)

  useLayoutEffect(() => {
    const el = contentRef.current
    if (!el || typeof window === 'undefined') return
    const computed = window.getComputedStyle(el)
    const lineHeight = parseFloat(computed.lineHeight)
    if (!Number.isFinite(lineHeight) || lineHeight <= 0) {
      setIsCollapsible(false)
      setCollapsedHeight(null)
      return
    }
    const totalLines = Math.round(el.scrollHeight / lineHeight)
    if (totalLines > 7) {
      setIsCollapsible(true)
      setCollapsedHeight(lineHeight * 7)
    } else {
      setIsCollapsible(false)
      setCollapsedHeight(null)
      setIsExpanded(false)
    }
  }, [message.content])

  const shouldClamp = isCollapsible && !isExpanded && collapsedHeight
  const contentStyle = shouldClamp
    ? { maxHeight: `${collapsedHeight}px`, overflow: 'hidden' }
    : isCollapsible
      ? { maxHeight: 'none' }
      : undefined

  return (
    <div className="flex items-start justify-end gap-4 pt-4 max-md:break-words">
      <div className="flex max-w-xl flex-col items-end gap-1">
        <div
          ref={contentRef}
          data-testid="user-message-content"
          className="whitespace-pre-wrap break-words rounded-2xl border border-border bg-background-secondary px-4 py-2 text-base leading-6 text-left text-primary transition-[max-height] duration-200 ease-out"
          style={contentStyle}
        >
          {message.content}
        </div>
        {isCollapsible && (
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-label={
              isExpanded ? t('chat.collapse_message') : t('chat.expand_message')
            }
            className="flex items-center justify-center rounded-full border border-border bg-background-secondary p-1 text-secondary transition-colors hover:bg-surface-hover"
          >
            <Icon
              type="chevron-down"
              size="xs"
              className={`text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>
      <div className="flex-shrink-0">
        <Icon type="user" size="sm" className="text-secondary" />
      </div>
    </div>
  )
})

AgentMessage.displayName = 'AgentMessage'
UserMessage.displayName = 'UserMessage'
export { AgentMessage, UserMessage }
