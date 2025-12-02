import React from 'react';
import { cn } from "@/lib/utils";

export function TextInput({ value, onChange, placeholder, multiline = false }) {
  const baseClasses = "w-full bg-[#11112b] border border-[#2a2a45] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#61f7a2] focus:ring-1 focus:ring-[#61f7a2]/20 transition-all";
  
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className={baseClasses}
      />
    );
  }
  
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={baseClasses}
    />
  );
}

export function NumberInput({ value, onChange, placeholder, min, max, suffix }) {
  return (
    <div className="relative">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        className="w-full bg-[#11112b] border border-[#2a2a45] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#61f7a2] focus:ring-1 focus:ring-[#61f7a2]/20 transition-all"
      />
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
          {suffix}
        </span>
      )}
    </div>
  );
}

export function OptionCards({ options, value, onChange, columns = 2 }) {
  return (
    <div className={cn(
      "grid gap-3",
      columns === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
    )}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "p-4 rounded-xl border text-left transition-all",
            value === option.value
              ? "bg-gradient-active border-[#61f7a2]/50 text-white"
              : "bg-[#11112b] border-[#2a2a45] text-gray-400 hover:border-[#61f7a2]/30 hover:text-white"
          )}
        >
          <div className="flex items-center gap-3">
            {option.icon && <option.icon className={cn(
              "w-5 h-5",
              value === option.value ? "text-[#61f7a2]" : ""
            )} />}
            <div>
              <p className="font-medium">{option.label}</p>
              {option.description && (
                <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}