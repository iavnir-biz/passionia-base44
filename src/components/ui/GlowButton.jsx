import React from 'react';
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function GlowButton({ 
  children, 
  onClick, 
  className,
  variant = "primary",
  size = "default",
  loading = false,
  disabled = false,
  icon: Icon,
  ...props
}) {
  const variants = {
    primary: "bg-[#61f7a2] text-[#11112b] hover:bg-[#4de88f] glow-green font-semibold",
    secondary: "bg-[#1b1b33] text-white hover:bg-[#2a2a45] border border-[#2a2a45]",
    ghost: "bg-transparent text-white hover:bg-[#2a2a45]",
    outline: "bg-transparent text-[#61f7a2] border border-[#61f7a2] hover:bg-[rgba(97,247,162,0.1)]"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    default: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "rounded-xl transition-all duration-300 flex items-center justify-center gap-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "hover:scale-105 active:scale-95 transform",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : Icon ? (
        <Icon className="w-5 h-5" />
      ) : null}
      {children}
    </button>
  );
}