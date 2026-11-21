"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { cn } from "cn"
import { CheckIcon } from "lucide-react"

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-lg border border-input transition-colors outline-none group-has-disabled/field:opacity-50 group-has-focus-visible/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed dark:bg-input/30",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center transition-none [&>svg]:size-3.5"
      >
        <CheckIcon className="size-3.5 stroke-[2.5] text-foreground" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
