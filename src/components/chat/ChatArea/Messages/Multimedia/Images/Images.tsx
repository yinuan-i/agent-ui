'use client'

import { memo, useState } from 'react'

import { type ImageData } from '@/types/os'
import { cn } from '@/lib/utils'
import { useLocale } from '@/i18n/LocaleProvider'

const Images = ({ images }: { images: ImageData[] }) => {
  const { t } = useLocale()
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  const markFailed = (url: string) => {
    setFailedImages((prev) => {
      if (prev.has(url)) return prev
      const next = new Set(prev)
      next.add(url)
      return next
    })
  }

  return (
    <div
      className={cn(
        'grid max-w-xl gap-4',
        images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
      )}
    >
      {images.map((image) => {
        const hasError = failedImages.has(image.url)
        return (
          <div key={image.url} className="group relative">
            {hasError ? (
              <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-md bg-accent/60 text-muted">
                <p className="text-primary">{t('media.image_unavailable')}</p>
                <a
                  href={image.url}
                  target="_blank"
                  className="w-full max-w-md truncate underline text-primary"
                  rel="noreferrer"
                >
                  {image.url}
                </a>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image.url}
                alt={image.revised_prompt || t('media.ai_generated_image_alt')}
                className="w-full rounded-lg"
                onError={() => markFailed(image.url)}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default memo(Images)

Images.displayName = 'Images'
