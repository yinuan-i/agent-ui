import { type FC } from 'react'
import { useLocale } from '@/i18n/LocaleProvider'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

interface DeleteSessionModalProps {
  isOpen: boolean
  onClose: () => void
  onDelete: () => Promise<void>
  isDeleting: boolean
}

const DeleteSessionModal: FC<DeleteSessionModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  isDeleting
}) => {
  const { t } = useLocale()
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="font-geist">
        <DialogHeader>
          <DialogTitle>{t('sessions.confirm_deletion')}</DialogTitle>
          <DialogDescription>
            {t('sessions.confirm_deletion_desc')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            className="rounded-xl border-border font-geist"
            onClick={onClose}
            disabled={isDeleting}
          >
            {t('actions.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={isDeleting}
            className="rounded-xl font-geist"
          >
            {t('actions.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteSessionModal
