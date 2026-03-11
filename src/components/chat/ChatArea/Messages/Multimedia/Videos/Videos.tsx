'use client'

import { memo } from 'react'

import { toast } from 'sonner'

import { type VideoData } from '@/types/os'
import Icon from '@/components/ui/icon'
import { useLocale } from '@/i18n/LocaleProvider'

const VideoItem = memo(({ video }: { video: VideoData }) => {
  const { t } = useLocale()
  const videoUrl = video.url

  const handleDownload = async () => {
    try {
      toast.loading(t('media.downloading_video'))
      const response = await fetch(videoUrl)
      if (!response.ok) throw new Error('Network response was not ok')

      const blob = await response.blob()
      const fileExtension = videoUrl.split('.').pop() ?? 'mp4'
      const fileName = `video-${Date.now()}.${fileExtension}`

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName

      document.body.appendChild(a)
      a.click()

      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.dismiss()
      toast.success(t('media.download_success'))
    } catch {
      toast.dismiss()
      toast.error(t('media.download_failed'))
    }
  }

  return (
    <div>
      <div className="group relative w-full max-w-xl">
        {}
        <video
          src={videoUrl}
          autoPlay
          muted
          loop
          controls
          className="w-full rounded-lg"
          style={{ aspectRatio: '16 / 9' }}
        />
        <button
          type="button"
          onClick={handleDownload}
          className="absolute right-2 top-2 flex items-center justify-center rounded-sm bg-background-secondary/80 p-1.5 opacity-0 transition-opacity duration-200 hover:bg-background-secondary group-hover:opacity-100"
          aria-label={t('media.download_video')}
        >
          <Icon type="download" size="xs" />
        </button>
      </div>
    </div>
  )
})

VideoItem.displayName = 'VideoItem'

const Videos = memo(({ videos }: { videos: VideoData[] }) => (
  <div className="flex flex-col gap-4">
    {videos.map((video) => (
      <VideoItem key={video.id} video={video} />
    ))}
  </div>
))

Videos.displayName = 'Videos'

export default Videos
