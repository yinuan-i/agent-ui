'use client'
import { type ChangeEvent, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useStore } from '@/store'
import useAIChatStreamHandler from '@/hooks/useAIStreamHandler'
import { useQueryState } from 'nuqs'
import Icon from '@/components/ui/icon'
import { useLocale } from '@/i18n/LocaleProvider'

/** 根据文件 MIME 类型返回简短的类型标签 */
function getFileTypeLabel(file: File): string {
  const mime = file.type
  if (mime.startsWith('image/')) return '图片'
  if (mime.startsWith('video/')) return '视频'
  if (mime.startsWith('audio/')) return '音频'
  if (mime === 'application/pdf') return 'PDF'
  if (
    mime.includes('word') ||
    mime.includes('document') ||
    file.name.endsWith('.doc') ||
    file.name.endsWith('.docx')
  )
    return '文档'
  if (
    mime.includes('spreadsheet') ||
    mime.includes('excel') ||
    file.name.endsWith('.xls') ||
    file.name.endsWith('.xlsx')
  )
    return '表格'
  if (mime.includes('presentation') || file.name.endsWith('.ppt') || file.name.endsWith('.pptx'))
    return '演示文稿'
  if (mime === 'text/plain' || file.name.endsWith('.txt')) return '文档'
  if (mime.includes('json') || mime.includes('javascript') || mime.includes('typescript'))
    return '代码'
  return '文件'
}

const ChatInput = () => {
  const { t } = useLocale()
  const { chatInputRef } = useStore()

  const { handleStreamResponse } = useAIChatStreamHandler()
  const [selectedAgent] = useQueryState('agent')
  const [teamId] = useQueryState('team')
  const [inputMessage, setInputMessage] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const isStreaming = useStore((state) => state.isStreaming)

  const hasFiles = selectedFiles.length > 0

  const handleSubmit = async () => {
    if (!inputMessage.trim() && selectedFiles.length === 0) return
    const currentMessage = inputMessage
    setInputMessage('')
    try {
      if (selectedFiles.length > 0) {
        const formData = new FormData()
        formData.append('message', currentMessage)
        selectedFiles.forEach((file) => formData.append('files', file))
        await handleStreamResponse(formData)
      } else {
        await handleStreamResponse(currentMessage)
      }
    } catch (error) {
      toast.error(
        `${t('chat.submit_error')}${error instanceof Error ? error.message : String(error)}`
      )
    } finally {
      setSelectedFiles([])
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return
    setSelectedFiles((prev) => [...prev, ...files])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const isDisabled = !(selectedAgent || teamId)
  const canSend = !isDisabled && (inputMessage.trim().length > 0 || hasFiles) && !isStreaming

  return (
    <div className="mx-auto font-geist" style={{ width: '768px', maxWidth: '100%' }}>
      <input
        ref={fileInputRef}
        id="chat-attachment-input"
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
        aria-label={t('chat.add_attachments')}
        disabled={isDisabled || isStreaming}
      />

      {/* keyframe for file preview slide-in animation */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/*
        容器：无文件 → 胶囊型(33px)，有文件 → 圆角矩形(20px)
        border-radius 通过 CSS transition 平滑过渡
      */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          borderRadius: hasFiles ? '20px' : '33px',
          border: '1px solid #e5e7eb',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          boxSizing: 'border-box',
          overflow: 'hidden',
          transition: 'border-radius 0.25s ease',
        }}
      >
        {/* ── 文件预览区域（仅在有文件时展示）── */}
        {hasFiles && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              padding: '14px 16px 10px',
              borderBottom: '1px solid #f3f4f6',
              animation: 'slideDown 0.22s ease forwards',
            }}
          >
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${file.lastModified}-${index}`}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#ffffff',
                  minWidth: '160px',
                  maxWidth: '220px',
                }}
              >
                {/* 蓝色文档图标 */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: '#3b82f6',
                    flexShrink: 0,
                  }}
                >
                  {/* 文档 SVG 图标 */}
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>

                {/* 文件名 + 类型 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#111827',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {file.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                    {getFileTypeLabel(file)}
                  </div>
                </div>

                {/* 右上角删除按钮 */}
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  aria-label={t('chat.remove_attachment')}
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    border: '2px solid #ffffff',
                    backgroundColor: '#111827',
                    color: '#ffffff',
                    cursor: 'pointer',
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── 主输入行：[+] [textarea] [发送] ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            minHeight: '65px',
            padding: '0 8px',
            gap: '4px',
          }}
        >
          {/* 左侧：+ 上传按钮 */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isDisabled || isStreaming}
            aria-label={t('chat.add_attachments')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: isDisabled || isStreaming ? 'not-allowed' : 'pointer',
              opacity: isDisabled ? 0.4 : 1,
              flexShrink: 0,
              color: '#6b7280',
              transition: 'background-color 0.15s',
              padding: 0,
            }}
            onMouseEnter={(e) => {
              if (!isDisabled) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f3f4f6'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          {/* 中间：文本输入 */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
            <textarea
              ref={chatInputRef}
              placeholder={t('chat.input_placeholder')}
              value={inputMessage}
              rows={1}
              onChange={(e) => {
                setInputMessage(e.target.value)
                const el = e.target
                el.style.height = 'auto'
                el.style.height = `${Math.min(el.scrollHeight, 200)}px`
              }}
              onKeyDown={(e) => {
                if (
                  e.key === 'Enter' &&
                  !e.nativeEvent.isComposing &&
                  !e.shiftKey &&
                  !isStreaming
                ) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              disabled={isDisabled}
              style={{
                width: '100%',
                padding: '0 4px',
                lineHeight: '1.6',
                fontSize: '14px',
                color: '#111827',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                boxShadow: 'none',
                height: 'auto',
                minHeight: 'unset',
                overflow: 'hidden',
                display: 'block',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* 右侧：发送按钮（深色圆形） */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSend}
            aria-label={t('chat.send')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: canSend ? '#111827' : '#d1d5db',
              cursor: canSend ? 'pointer' : 'not-allowed',
              flexShrink: 0,
              padding: 0,
              transition: 'background-color 0.15s',
            }}
          >
            <Icon type="send" color="white" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatInput
