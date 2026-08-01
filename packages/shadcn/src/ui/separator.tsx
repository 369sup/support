"use client";

/*
 * Import-alias exception: this module publishes its own Separator wrapper, so
 * the upstream Separator would collide. Scope is this import only; the public
 * wrapper API stays stable. Namespace/default imports are noncompliant
 * alternatives, and the centralized allowlist plus lint and typecheck contain it.
 */
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";

import { cn } from "../lib/class-names";

export function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        className,
      )}
      {...props}
    />
  );
}
