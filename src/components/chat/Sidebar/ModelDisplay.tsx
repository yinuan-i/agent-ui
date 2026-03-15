import Icon from '@/components/ui/icon'
import { getProviderIcon } from '@/lib/modelProvider'

const ModelDisplay = ({ model }: { model: string }) => (
  <div className="flex h-9 w-full items-center gap-3 rounded-xl border border-border bg-background p-3 text-xs font-medium uppercase text-secondary">
    {(() => {
      const icon = getProviderIcon(model)
      return icon ? <Icon type={icon} className="shrink-0" size="xs" /> : null
    })()}
    {model}
  </div>
)

export default ModelDisplay
