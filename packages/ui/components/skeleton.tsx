import { cn } from "@turbotemplate/ui/lib/utils"
import type { ComponentPropsWithoutRef } from "react"

function Skeleton({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
