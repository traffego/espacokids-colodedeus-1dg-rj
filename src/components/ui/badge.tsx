import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "border-transparent bg-[#264639] text-[#f4eee3]",
    secondary: "border-transparent bg-[#e2ece6] text-[#1c3028]",
    destructive: "border-[#deb0aa] bg-[#f8e7e5] text-[#8f2d22]",
    success: "border-[#b8dbc9] bg-[#e7f3ec] text-[#1f583e]",
    warning: "border-[#e9d6a8] bg-[#fbf2dd] text-[#7a5711]",
    outline: "text-[#264639] border-[#ded5c2] bg-white/60",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
