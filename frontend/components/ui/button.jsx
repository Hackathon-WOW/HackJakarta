"use client";

import { forwardRef } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-emerald-800 text-paper-soft hover:bg-emerald-700 shadow-soft",
        amber: "bg-amber-500 text-emerald-900 hover:bg-amber-400 shadow-soft hover:shadow-glow",
        outline: "border border-emerald-800/30 text-emerald-800 hover:bg-emerald-800/5",
        ghost: "text-emerald-800 hover:bg-emerald-800/5",
        light: "bg-paper-soft text-emerald-800 border border-sand hover:bg-paper",
        danger: "bg-wine text-paper-soft hover:bg-wine/90",
        dark: "bg-ink text-paper-soft hover:bg-ink-soft",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

const Button = forwardRef(({ className, variant, size, asChild, ...props }, ref) => {
  return <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});
Button.displayName = "Button";

export { Button, buttonVariants };
