import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:  'bg-[#e8956d] text-white shadow hover:opacity-90 hover:-translate-y-0.5',
        outline:  'border border-white/10 bg-transparent hover:bg-white/5 hover:border-white/20',
        ghost:    'hover:bg-white/5 text-white/70 hover:text-white',
        danger:   'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30',
        gold:     'bg-[#e8c97a]/20 border border-[#e8c97a]/40 text-[#e8c97a] hover:bg-[#e8c97a]/30',
      },
      size: {
        sm:      'h-8 px-3 text-xs',
        default: 'h-10 px-5',
        lg:      'h-12 px-8 text-base',
        icon:    'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size:    'default',
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
})
Button.displayName = 'Button'

export { Button, buttonVariants }
