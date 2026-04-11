import { cva } from 'class-variance-authority'
import { cn } from '../../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[#e8956d]/20 text-[#e8956d] border border-[#e8956d]/30',
        gold:    'bg-[#e8c97a]/20 text-[#e8c97a] border border-[#e8c97a]/30',
        purple:  'bg-[#c4a8d4]/20 text-[#c4a8d4] border border-[#c4a8d4]/30',
        muted:   'bg-white/5 text-white/50 border border-white/10',
        success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        danger:  'bg-red-500/20 text-red-400 border border-red-500/30',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
