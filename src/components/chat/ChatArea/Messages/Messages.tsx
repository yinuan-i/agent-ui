import type { ChatMessage } from '@/types/os'

import { AgentMessage, UserMessage } from './MessageItem'
import Tooltip from '@/components/ui/tooltip'
import { useEffect, useMemo, useState } from 'react'
import {
  type ToolCall,
  ReasoningStepProps,
  ReasoningProps,
  ReferenceData,
  Reference
} from '@/types/os'
import type { FC } from 'react'

import Icon from '@/components/ui/icon'
import ChatBlankState from './ChatBlankState'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

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
  runCompletedAt
}) => {
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
    if (!Number.isFinite(seconds) || seconds <= 0) return '1 s'
    if (seconds < 1) return `${seconds.toFixed(2)} s`
    if (seconds < 10) return `${seconds.toFixed(1)} s`
    return `${Math.round(seconds)} s`
  }
  const timeLabel = isStreaming
    ? 'Working...'
    : `Worked for ${formatDuration(displaySeconds)}`

  const activeToolName = useMemo(() => {
    for (let i = orderedTools.length - 1; i >= 0; i -= 1) {
      if (!isToolCompleted(orderedTools[i])) {
        return orderedTools[i].tool_name || 'Tool'
      }
    }
    return null
  }, [orderedTools, isToolCompleted])

  const items = [
    { type: 'run' as const, label: 'Run Started' },
    ...orderedTools.map((tool) => ({
      type: 'tool' as const,
      label: isToolCompleted(tool)
        ? `Tool call completed: ${tool.tool_name || 'Tool'}`
        : `${tool.tool_name || 'Tool'}`,
      tool
    })),
    {
      type: 'run' as const,
      label: hasInProgressTools ? 'Run In Progress' : 'Run Completed'
    }
  ]

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
          {isStreaming && activeToolName ? ` · ${activeToolName}` : ''}
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
              <DialogTitle className="text-base">Tool Call Details</DialogTitle>
            </div>
            <DialogDescription>
              {selectedTool?.tool_name || 'Tool'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 text-sm text-primary">
            <div>
              <p className="text-xs uppercase text-secondary">Tool Name</p>
              <p className="mt-1">{selectedTool?.tool_name || '-'}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-secondary">Tool Args</p>
              <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-border bg-background-secondary p-3 text-xs text-primary">
                {selectedTool?.tool_args
                  ? JSON.stringify(selectedTool.tool_args, null, 2)
                  : '{}'}
              </pre>
            </div>
            <div>
              <p className="text-xs uppercase text-secondary">Tool Metrics</p>
              <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-border bg-background-secondary p-3 text-xs text-primary">
                {selectedTool?.metrics
                  ? JSON.stringify(selectedTool.metrics, null, 2)
                  : '{}'}
              </pre>
            </div>
            <div>
              <p className="text-xs uppercase text-secondary">Tool Result</p>
              <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-border bg-background-secondary p-3 text-xs text-primary">
                {(() => {
                  const result =
                    selectedTool?.result ??
                    selectedTool?.content ??
                    'No result (tool output not returned by server)'
                  if (typeof result === 'string') return result
                  try {
                    return JSON.stringify(result, null, 2)
                  } catch {
                    return 'Unable to render result'
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

const ToolPill: FC<{ toolName?: string }> = ({ toolName }) => (
  <div className="cursor-default rounded-full border border-border bg-background-secondary px-2 py-1.5 text-xs">
    <p className="font-dmmono uppercase text-primary/80">
      {toolName || 'Tool'}
    </p>
  </div>
)

const AgentMessageWrapper = ({ message, isLastMessage }: MessageWrapperProps) => {
  const isStreaming = useStore((state) => state.isStreaming)
  const isStreamingMessage = isStreaming && isLastMessage
  const shouldShowToolSummary =
    message.tool_calls && message.tool_calls.length > 0

  const toolHeader = shouldShowToolSummary ? (
    <div className="flex flex-col gap-4">
      <ToolCallSummary
        toolCalls={message.tool_calls ?? []}
        isStreaming={isStreamingMessage}
        runStartedAt={message.extra_data?.run_started_at}
        runCompletedAt={message.extra_data?.run_completed_at}
      />
      <div className="flex items-start gap-3">
        <Tooltip
          delayDuration={0}
          content={<p className="text-primary">Tool Calls</p>}
          side="top"
          contentClassName="border border-border bg-background text-primary shadow-sm"
        >
          <Icon
            type="hammer"
            className="rounded-lg border border-border bg-background-secondary p-1"
            size="sm"
            color="secondary"
          />
        </Tooltip>

        <div className="flex flex-wrap gap-2">
          {message.tool_calls?.map((toolCall, index) => (
            <ToolPill
              key={
                toolCall.tool_call_id ||
                `${toolCall.tool_name}-${toolCall.created_at}-${index}`
              }
              toolName={toolCall.tool_name}
            />
          ))}
        </div>
      </div>
    </div>
  ) : null

  return (
    <div className="flex flex-col gap-y-9">
      {message.extra_data?.reasoning_steps &&
        message.extra_data.reasoning_steps.length > 0 && (
          <div className="flex items-start gap-4">
            <Tooltip
              delayDuration={0}
              content={<p className="text-primary">Reasoning</p>}
              side="top"
              contentClassName="border border-border bg-background text-primary shadow-sm"
            >
              <Icon type="reasoning" size="sm" />
            </Tooltip>
            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase">Reasoning</p>
              <Reasonings reasoning={message.extra_data.reasoning_steps} />
            </div>
          </div>
        )}
      {message.extra_data?.references &&
        message.extra_data.references.length > 0 && (
          <div className="flex items-start gap-4">
            <Tooltip
              delayDuration={0}
              content={<p className="text-primary">References</p>}
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
const Reasoning: FC<ReasoningStepProps> = ({ index, stepTitle }) => (
  <div className="flex items-center gap-2 text-secondary">
    <div className="flex h-[20px] items-center rounded-md bg-background-secondary p-2">
      <p className="text-xs">STEP {index + 1}</p>
    </div>
    <p className="text-xs">{stepTitle}</p>
  </div>
)
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
  if (messages.length === 0) {
    return <ChatBlankState />
  }

  return (
    <>
      {messages.map((message, index) => {
        const key = `${message.role}-${message.created_at}-${index}`
        const isLastMessage = index === messages.length - 1

        if (message.role === 'agent') {
          return (
            <AgentMessageWrapper
              key={key}
              message={message}
              isLastMessage={isLastMessage}
            />
          )
        }
        return <UserMessage key={key} message={message} />
      })}
    </>
  )
}

export default Messages
