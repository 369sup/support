"use client";

/*
 * Import-alias exception: this module publishes its own Button wrapper, so the
 * upstream Button would collide. Scope is this import only; the public wrapper
 * API stays stable. Namespace/default imports are noncompliant alternatives,
 * and the centralized alias allowlist plus lint and typecheck contain it.
 */
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import type { VariantProps } from "class-variance-authority";

import { cn } from "../lib/class-names";
import { buttonVariants } from "./button-variants";

type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
