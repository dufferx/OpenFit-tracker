import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const Combobox = ComboboxPrimitive.Root

function ComboboxInput({ className, ...props }: ComboboxPrimitive.Input.Props) {
  return <ComboboxPrimitive.InputGroup className="relative flex h-9 w-full items-center rounded-lg border border-input bg-background shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30 has-[[aria-invalid=true]]:border-destructive has-[[aria-invalid=true]]:ring-destructive/20">
    <ComboboxPrimitive.Input data-slot="combobox-input" className={cn('h-full min-w-0 flex-1 bg-transparent px-3 py-1 pr-9 text-base outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm', className)} {...props} />
    <ComboboxPrimitive.Trigger className="absolute right-0 grid size-9 place-items-center rounded-r-lg text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50" aria-label="Show timezone options">
      <ChevronsUpDown className="size-4" aria-hidden="true" />
    </ComboboxPrimitive.Trigger>
  </ComboboxPrimitive.InputGroup>
}

function ComboboxContent({ className, children, ...props }: ComboboxPrimitive.Popup.Props) {
  return <ComboboxPrimitive.Portal>
    <ComboboxPrimitive.Positioner className="z-50 outline-none" sideOffset={4} align="start">
      <ComboboxPrimitive.Popup data-slot="combobox-content" className={cn('w-[var(--anchor-width)] max-w-[var(--available-width)] origin-[var(--transform-origin)] rounded-lg border bg-popover text-popover-foreground shadow-md transition-[scale,opacity] duration-100 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0', className)} {...props}>
        {children}
      </ComboboxPrimitive.Popup>
    </ComboboxPrimitive.Positioner>
  </ComboboxPrimitive.Portal>
}

function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return <ComboboxPrimitive.Empty data-slot="combobox-empty" className={cn('px-3 py-6 text-center text-sm text-muted-foreground', className)} {...props} />
}

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return <ComboboxPrimitive.List data-slot="combobox-list" className={cn('max-h-[min(18rem,var(--available-height))] overflow-y-auto overscroll-contain p-1 outline-none data-empty:p-0', className)} {...props} />
}

function ComboboxItem({ className, children, ...props }: ComboboxPrimitive.Item.Props) {
  return <ComboboxPrimitive.Item data-slot="combobox-item" className={cn('relative flex cursor-default select-none items-center rounded-md py-2 pl-8 pr-2 text-sm outline-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground', className)} {...props}>
    <ComboboxPrimitive.ItemIndicator className="absolute left-2 grid size-4 place-items-center">
      <Check className="size-4" aria-hidden="true" />
    </ComboboxPrimitive.ItemIndicator>
    {children}
  </ComboboxPrimitive.Item>
}

export { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList }
