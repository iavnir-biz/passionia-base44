import React from 'react';
import { cn } from "@/lib/utils";

export default function ProgressBar({ 
  value = 0, 
  max = 100, 
  className,
  showLabel = false,
  size = "default"
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const sizeClasses = {
    sm: "h-1.5",
    default: "h-2.5",
    lg: "h-4"
  };

  return (
    <div className={cn("w-full", className)}>
      <div className={cn(
        "w-full bg-[#1b1b33] rounded-full overflow-hidden",
        sizeClasses[size]
      )}>
        <div 
          className="h-full bg-[#61f7a2] rounded-full progress-bar-animated glow-green-subtle"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1.5 text-xs text-gray-400">
          <span>{value} / {max}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
}