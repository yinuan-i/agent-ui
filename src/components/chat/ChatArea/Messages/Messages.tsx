import type { ChatMessage } from '@/types/os'

import { AgentMessage, UserMessage } from './MessageItem'
import React, { useEffect, useMemo, useState } from 'react'
import Tooltip from '@/components/ui/tooltip'
import {
  type ToolCall,
  ReasoningStepProps,
  ReasoningProps,
  ReferenceData,
  Reference,
  StreamingStatus
} from '@/types/os'
import type { FC } from 'react'

import Icon from '@/components/ui/icon'
import ChatBlankState from './ChatBlankState'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '@/components/ui/dialog'
import { useLocale } from '@/i18n/LocaleProvider'

interface MessageListProps {
  messages: ChatMessage[]
}

interface MessageWrapperProps {
  message: ChatMessage
  isLastMessage: boolean
}

interface ReferenceProps {
  references: ReferenceData[]
}

interface ReferenceItemProps {
  reference: Reference
}

interface ToolCallSummaryProps {
  toolCalls: ToolCall[]
  isStreaming: boolean
  runStartedAt?: number
  runCompletedAt?: number
  streamingStatus?: StreamingStatus
}

interface ToolCallsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  toolCalls: ToolCall[]
}

const ReferenceItem: FC<ReferenceItemProps> = ({ reference }) => (
  <div className="relative flex h-[63px] w-[190px] cursor-default flex-col justify-between overflow-hidden rounded-md border border-border bg-background-secondary p-3 transition-colors hover:bg-surface-hover">
    <p className="text-sm font-medium text-primary">{reference.name}</p>
    <p className="truncate text-xs text-secondary">{reference.content}</p>
  </div>
)

const References: FC<ReferenceProps> = ({ references }) => (
  <div className="flex flex-col gap-4">
    {references.map((referenceData, index) => (
      <div
        key={`${referenceData.query}-${index}`}
        className="flex flex-col gap-3"
      >
        <div className="flex flex-wrap gap-3">
          {referenceData.references.map((reference, refIndex) => (
            <ReferenceItem
              key={`${reference.name}-${reference.meta_data.chunk}-${refIndex}`}
              reference={reference}
            />
          ))}
        </div>
      </div>
    ))}
  </div>
)

const ToolCallSummary: FC<ToolCallSummaryProps> = ({
  toolCalls,
  isStreaming,
  runStartedAt,
  runCompletedAt,
  streamingStatus
}) => {
  const { t } = useLocale()
  const [open, setOpen] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [selectedTool, setSelectedTool] = useState<ToolCall | null>(null)

  const orderedTools = useMemo(
    () =>
      [...toolCalls].sort(
        (a, b) => (a.created_at ?? 0) - (b.created_at ?? 0)
      ),
    [toolCalls]
  )

  const totalSeconds = useMemo(
    () =>
      Math.round(
        orderedTools.reduce((sum, tool) => {
          const duration =
            tool.metrics?.duration ??
            tool.metrics?.time ??
            (tool.metrics?.start_time && tool.metrics?.end_time
              ? tool.metrics.end_time - tool.metrics.start_time
              : 0)
          return sum + (typeof duration === 'number' ? duration : 0)
        }, 0)
      ),
    [orderedTools]
  )

  const startTimestamp =
    runStartedAt ??
    orderedTools[0]?.metrics?.start_time ??
    orderedTools[0]?.created_at ??
    0
  const endTimestamp =
    runCompletedAt ??
    orderedTools[orderedTools.length - 1]?.metrics?.end_time ??
    orderedTools[orderedTools.length - 1]?.created_at ??
    startTimestamp
  const elapsedSeconds = useMemo(() => {
    if (!startTimestamp) return 0
    return Math.max(1, Math.round(now / 1000 - startTimestamp))
  }, [now, startTimestamp])
  const completedSeconds = useMemo(() => {
    if (!startTimestamp) return 0
    return Math.max(1, Math.round(endTimestamp - startTimestamp))
  }, [endTimestamp, startTimestamp])

  useEffect(() => {
    if (!isStreaming) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [isStreaming])

  const isToolCompleted = (tool: ToolCall) =>
    Boolean(
      tool.tool_call_error ||
        tool.result !== undefined ||
        (tool.content !== null && tool.content !== undefined) ||
        (tool.metrics?.duration ?? tool.metrics?.time ?? 0) > 0 ||
        (tool.metrics?.start_time && tool.metrics?.end_time)
    )

  const hasInProgressTools =
    isStreaming && orderedTools.some((tool) => !isToolCompleted(tool))

  const fallbackSeconds = isStreaming ? elapsedSeconds : completedSeconds
  const displaySeconds = totalSeconds > 0 ? totalSeconds : fallbackSeconds
  const formatDuration = (seconds: number) => {
    const unit = t('time.seconds_short')
    if (!Number.isFinite(seconds) || seconds <= 0) return `1 ${unit}`
    if (seconds < 1) return `${seconds.toFixed(2)} ${unit}`
    if (seconds < 10) return `${seconds.toFixed(1)} ${unit}`
    return `${Math.round(seconds)} ${unit}`
  }
  const toolLabel = streamingStatus?.tool_name || t('chat.tool')
  const toolCallStartedLabel = t('chat.tool_call_started').replace(
    '{tool}',
    toolLabel
  )
  const timeLabel = isStreaming
    ? streamingStatus?.status === 'tool_started'
      ? toolCallStartedLabel
      : t('chat.working')
    : `${t('chat.worked_for')} ${formatDuration(displaySeconds)}`

  const activeToolName = useMemo(() => {
    for (let i = orderedTools.length - 1; i >= 0; i -= 1) {
      if (!isToolCompleted(orderedTools[i])) {
        return orderedTools[i].tool_name || t('chat.tool')
      }
    }
    return null
  }, [orderedTools, isToolCompleted])

  const items = [
    { type: 'run' as const, label: t('chat.run_started') },
    ...orderedTools.map((tool) => ({
      type: 'tool' as const,
      label: isToolCompleted(tool)
        ? `${t('chat.tool_call_completed')}${tool.tool_name || t('chat.tool')}`
        : `${tool.tool_name || t('chat.tool')}`,
      tool
    })),
    {
      type: 'run' as const,
      label: isStreaming ? t('chat.run_in_progress') : t('chat.run_completed')
    }
  ]
  const showActiveToolName =
    isStreaming && activeToolName && streamingStatus?.status !== 'tool_started'

  return (
    <div className="w-full max-w-[560px]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 text-left text-sm text-primary hover:underline"
      >
        {isStreaming && (
          <span className="inline-flex h-3 w-3 animate-spin rounded-full border border-border border-t-transparent" />
        )}
        <span className="font-medium">
          {timeLabel}
          {showActiveToolName ? ` · ${activeToolName}` : ''}
        </span>
        <Icon
          type="chevron-down"
          size="xs"
          className={`text-secondary transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-250 ease-linear',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="relative mt-3 pl-6">
            <div className="absolute bottom-1 left-2 top-1 w-px bg-border" />
            <div className="flex flex-col gap-2">
              {items.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="flex items-center gap-3 text-xs text-secondary"
                >
                  {item.type === 'tool' ? (
                    <Icon type="hammer" size="xs" className="text-secondary" />
                  ) : (
                    <div className="size-1.5 rounded-full bg-border" />
                  )}
                  {item.type === 'tool' ? (
                    <button
                      type="button"
                      onClick={() => setSelectedTool(item.tool ?? null)}
                      className="text-left hover:underline"
                    >
                      <span>{item.label}</span>
                    </button>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Dialog
        open={!!selectedTool}
        onOpenChange={(value) => {
          if (!value) setSelectedTool(null)
        }}
      >
        <DialogContent className="font-geist">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Icon type="hammer" size="xs" className="text-secondary" />
              <DialogTitle className="text-base">
                {t('chat.tool_call_details')}
              </DialogTitle>
            </div>
            <DialogDescription>
              {selectedTool?.tool_name || t('chat.tool')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 text-sm text-primary">
            <div>
              <p className="text-xs uppercase text-secondary">
                {t('chat.tool_name')}
              </p>
              <p className="mt-1">{selectedTool?.tool_name || '-'}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-secondary">
                {t('chat.tool_args')}
              </p>
              <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-border bg-background-secondary p-3 text-xs text-primary">
                {selectedTool?.tool_args
                  ? JSON.stringify(selectedTool.tool_args, null, 2)
                  : '{}'}
              </pre>
            </div>
            <div>
              <p className="text-xs uppercase text-secondary">
                {t('chat.tool_metrics')}
              </p>
              <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-border bg-background-secondary p-3 text-xs text-primary">
                {selectedTool?.metrics
                  ? JSON.stringify(selectedTool.metrics, null, 2)
                  : '{}'}
              </pre>
            </div>
            <div>
              <p className="text-xs uppercase text-secondary">
                {t('chat.tool_result')}
              </p>
              <pre
                data-testid="tool-result"
                className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-background-secondary p-3 text-xs text-primary"
              >
                {(() => {
                  const result =
                    selectedTool?.result ??
                    selectedTool?.content ??
                    t('chat.no_result')
                  if (typeof result === 'string') return result
                  try {
                    return JSON.stringify(result, null, 2)
                  } catch {
                    return t('chat.render_result_failed')
                  }
                })()}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const ToolCallBar: FC<{
  count: number
  onClick: () => void
}> = ({ count, onClick }) => {
  const { t } = useLocale()
  const label = t('chat.tool_call_bar').replace('{count}', String(count))
  return (
    <div className="flex w-full items-center justify-start">
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-3 rounded-full border border-border bg-background-secondary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary transition-colors hover:bg-surface-hover"
      >
        <Icon type="hammer" size="xs" className="text-secondary" />
        <span>{label}</span>
        <Icon
          type="chevron-down"
          size="xs"
          className="text-secondary transition-transform rotate-90"
        />
      </button>
    </div>
  )
}

const ToolCallsDrawer: FC<ToolCallsDrawerProps> = ({
  open,
  onOpenChange,
  toolCalls
}) => {
  const { t } = useLocale()
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const formatValue = (value: unknown) => {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'string') return value
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return String(value)
    }
  }

  const renderResult = (tool: ToolCall) => {
    if (tool.result !== undefined) return formatValue(tool.result)
    if (tool.content !== null && tool.content !== undefined) {
      return formatValue(tool.content)
    }
    return t('chat.no_result')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content className="fixed right-0 top-0 z-50 h-dvh w-full max-w-[420px] translate-y-0 rounded-l-2xl rounded-r-none bg-background p-0 data-[state=closed]:translate-x-full data-[state=open]:translate-x-0 transition-transform duration-300 ease-out">
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <Icon type="x" size="xs" />
            <span className="sr-only">{t('actions.close')}</span>
          </DialogClose>
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <DialogHeader className="space-y-1 text-left">
                <DialogTitle className="text-base font-semibold">
                  {t('chat.tool_calls')}
                </DialogTitle>
                <DialogDescription className="text-xs text-secondary">
                  {toolCalls.length}
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="flex-1 overflow-auto px-6 py-4">
              <div className="flex flex-col gap-3">
                {toolCalls.map((tool, index) => {
                  const isOpen = expandedIndex === index
                  return (
                    <div
                      key={tool.tool_call_id || `${tool.tool_name}-${index}`}
                      className="rounded-xl border border-border bg-background-secondary"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedIndex(isOpen ? null : index)
                        }
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-primary"
                      >
                        <span className="truncate">
                          {tool.tool_name || t('chat.tool')}
                        </span>
                        <Icon
                          type="chevron-down"
                          size="xs"
                          className={cn(
                            'text-secondary transition-transform',
                            isOpen ? 'rotate-180' : ''
                          )}
                        />
                      </button>
                      {isOpen && (
                        <div className="flex flex-col gap-4 border-t border-border px-4 py-4 text-xs text-secondary">
                          <div>
                            <p className="text-[11px] uppercase text-secondary">
                              {t('chat.tool_name')}
                            </p>
                            <p className="mt-1 text-primary">
                              {tool.tool_name || t('chat.tool')}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] uppercase text-secondary">
                              {t('chat.tool_args')}
                            </p>
                            <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-background px-3 py-2 text-[11px] text-primary">
                              {formatValue(tool.tool_args)}
                            </pre>
                          </div>
                          <div>
                            <p className="text-[11px] uppercase text-secondary">
                              {t('chat.tool_metrics')}
                            </p>
                            <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-background px-3 py-2 text-[11px] text-primary">
                              {formatValue(tool.metrics)}
                            </pre>
                          </div>
                          <div>
                            <p className="text-[11px] uppercase text-secondary">
                              {t('chat.tool_result')}
                            </p>
                            <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-background px-3 py-2 text-[11px] text-primary">
                              {renderResult(tool)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}

const AgentMessageWrapper = ({ message, isLastMessage }: MessageWrapperProps) => {
  const { t } = useLocale()
  const isStreaming = useStore((state) => state.isStreaming)
  const isStreamingMessage = isStreaming && isLastMessage
  const streamingStatus = message.extra_data?.streaming_status
  const shouldShowToolSummary =
    Boolean(message.tool_calls && message.tool_calls.length > 0) ||
    (isStreamingMessage && Boolean(streamingStatus))

  const toolHeader = shouldShowToolSummary ? (
    <div className="flex flex-col gap-4">
      <ToolCallSummary
        toolCalls={message.tool_calls ?? []}
        isStreaming={isStreamingMessage}
        runStartedAt={message.extra_data?.run_started_at}
        runCompletedAt={message.extra_data?.run_completed_at}
        streamingStatus={streamingStatus}
      />
    </div>
  ) : null

  return (
    <div className="flex flex-col gap-y-9">
      {message.extra_data?.reasoning_steps &&
        message.extra_data.reasoning_steps.length > 0 && (
          <div className="flex items-start gap-4">
            <Tooltip
              delayDuration={0}
              content={<p className="text-primary">{t('chat.reasoning')}</p>}
              side="top"
              contentClassName="border border-border bg-background text-primary shadow-sm"
            >
              <Icon type="reasoning" size="sm" />
            </Tooltip>
            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase">{t('chat.reasoning')}</p>
              <Reasonings reasoning={message.extra_data.reasoning_steps} />
            </div>
          </div>
        )}
      {message.extra_data?.references &&
        message.extra_data.references.length > 0 && (
          <div className="flex items-start gap-4">
            <Tooltip
              delayDuration={0}
              content={<p className="text-primary">{t('chat.references')}</p>}
              side="top"
              contentClassName="border border-border bg-background text-primary shadow-sm"
            >
              <Icon type="references" size="sm" />
            </Tooltip>
            <div className="flex flex-col gap-3">
              <References references={message.extra_data.references} />
            </div>
          </div>
        )}
      <AgentMessage message={message} header={toolHeader} />
    </div>
  )
}
const Reasoning: FC<ReasoningStepProps> = ({ index, stepTitle }) => {
  const { t } = useLocale()
  return (
    <div className="flex items-center gap-2 text-secondary">
      <div className="flex h-[20px] items-center rounded-md bg-background-secondary p-2">
        <p className="text-xs">{`${t('chat.step')} ${index + 1}`}</p>
      </div>
      <p className="text-xs">{stepTitle}</p>
    </div>
  )
}
const Reasonings: FC<ReasoningProps> = ({ reasoning }) => (
  <div className="flex flex-col items-start justify-center gap-2">
    {reasoning.map((title, index) => (
      <Reasoning
        key={`${title.title}-${title.action}-${index}`}
        stepTitle={title.title}
        index={index}
      />
    ))}
  </div>
)

const Messages = ({ messages }: MessageListProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMessageIndex, setDrawerMessageIndex] = useState<number | null>(
    null
  )

  if (messages.length === 0) {
    return <ChatBlankState />
  }

  const drawerToolCalls =
    drawerMessageIndex !== null &&
    messages[drawerMessageIndex]?.role === 'agent'
      ? messages[drawerMessageIndex]?.tool_calls ?? []
      : []

  return (
    <>
      {messages.map((message, index) => {
        const key = `${message.role}-${message.created_at}-${index}`
        const isLastMessage = index === messages.length - 1
        const nextMessage = messages[index + 1]
        const shouldShowToolBar =
          message.role === 'user' &&
          nextMessage?.role === 'agent' &&
          (nextMessage.tool_calls?.length ?? 0) > 0

        return (
          <React.Fragment key={key}>
            {message.role === 'agent' ? (
              <AgentMessageWrapper
                message={message}
                isLastMessage={isLastMessage}
              />
            ) : (
              <UserMessage message={message} />
            )}
            {shouldShowToolBar && (
              <ToolCallBar
                count={nextMessage?.tool_calls?.length ?? 0}
                onClick={() => {
                  setDrawerMessageIndex(index + 1)
                  setDrawerOpen(true)
                }}
              />
            )}
          </React.Fragment>
        )
      })}
      <ToolCallsDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        toolCalls={drawerToolCalls}
      />
    </>
  )
}

export default Messages
