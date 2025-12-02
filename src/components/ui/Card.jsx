import React from 'react';
import { cn } from "@/lib/utils";

export function Card({ children, className, hover = false, active = false, ...props }) {
  return (
    <div 
      className={cn(
        "bg-[#1b1b33] rounded-2xl border border-[#2a2a45]",
        hover && "card-hover cursor-pointer",
        active && "bg-gradient-active border-[#61f7a2]/30",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn("p-6 pb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3 className={cn("text-xl font-semibold text-white", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className, ...props }) {
  return (
    <p className={cn("text-gray-400 text-sm mt-1", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div className={cn("p-6 pt-4 border-t border-[#2a2a45]", className)} {...props}>
      {children}
    </div>
  );
}