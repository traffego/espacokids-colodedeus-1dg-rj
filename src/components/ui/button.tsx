import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantStyles = {
      default: "bg-[#264639] text-[#f4eee3] shadow hover:bg-[#1c3028] active:scale-[0.98]",
      destructive: "bg-[#8f2d22] text-white shadow-sm hover:bg-[#722219] active:scale-[0.98]",
      outline: "border border-[#ded5c2] bg-[#fcf9f2] hover:bg-[#eae1cf] text-[#1c3028] shadow-xs",
      secondary: "bg-[#e2ece6] text-[#1c3028] hover:bg-[#d0dfd6]",
      ghost: "hover:bg-[#eae1cf]/60 text-[#1c3028]",
      link: "text-[#264639] underline-offset-4 hover:underline font-semibold",
    };

    const sizeStyles = {
      default: "h-10 px-4 py-2 text-sm",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-12 rounded-lg px-6 text-base font-semibold",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#264639] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
