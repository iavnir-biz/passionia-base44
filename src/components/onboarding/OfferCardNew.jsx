import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function OfferCardNew({ 
  offer, 
  isSelected, 
  onSelect,
  icon: Icon,
  colorScheme = 'blue'
}) {
  const colors = {
    blue: {
      border: 'border-[#1a1a1a]',
      text: 'text-[#1a1a1a]',
      glow: 'shadow-lg shadow-black/10',
      badge: 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white',
      iconBg: 'bg-gradient-to-br from-blue-100 to-blue-50',
      iconText: 'text-blue-600',
      priceBg: 'text-[#1a1a1a]',
      resultBg: 'bg-[#f8f8f8] border-[#e5e5e5]',
      checkBg: 'bg-[#1a1a1a]'
    },
    green: {
      border: 'border-[#1a1a1a]',
      text: 'text-[#1a1a1a]',
      glow: 'shadow-lg shadow-black/10',
      badge: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
      iconBg: 'bg-gradient-to-br from-green-100 to-green-50',
      iconText: 'text-green-600',
      priceBg: 'text-[#1a1a1a]',
      resultBg: 'bg-[#f8f8f8] border-[#e5e5e5]',
      checkBg: 'bg-[#1a1a1a]'
    },
    purple: {
      border: 'border-[#1a1a1a]',
      text: 'text-[#1a1a1a]',
      glow: 'shadow-lg shadow-black/10',
      badge: 'bg-gradient-to-r from-purple-500 to-violet-500 text-white',
      iconBg: 'bg-gradient-to-br from-purple-100 to-purple-50',
      iconText: 'text-purple-600',
      priceBg: 'text-[#1a1a1a]',
      resultBg: 'bg-[#f8f8f8] border-[#e5e5e5]',
      checkBg: 'bg-[#1a1a1a]'
    },
    gold: {
      border: 'border-[#1a1a1a]',
      text: 'text-[#1a1a1a]',
      glow: 'shadow-lg shadow-black/10',
      badge: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white',
      iconBg: 'bg-gradient-to-br from-amber-100 to-amber-50',
      iconText: 'text-amber-600',
      priceBg: 'text-[#1a1a1a]',
      resultBg: 'bg-[#f8f8f8] border-[#e5e5e5]',
      checkBg: 'bg-[#1a1a1a]'
    }
  };

  const scheme = colors[colorScheme];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(offer)}
      className={cn(
        "relative cursor-pointer rounded-2xl bg-white border-2 transition-all duration-300 overflow-hidden",
        isSelected 
          ? cn(scheme.border, scheme.glow)
          : "border-[#e5e5e5] hover:border-[#ccc] shadow-sm hover:shadow-md"
      )}
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      {/* Selection indicator */}
      <AnimatePresence>
        {isSelected && (
          <motion.div 
            className={cn("absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center shadow-lg", scheme.checkBg)}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <Check className="w-5 h-5 text-white" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6">
        {/* Header with badge and price */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", scheme.iconBg)}>
                <Icon className={cn("w-5 h-5", scheme.iconText)} />
              </div>
            )}
            <span className={cn("px-3 py-1 text-[11px] font-semibold rounded-full", scheme.badge)}>
              {offer.badge}
            </span>
          </div>
          <span className="text-2xl font-bold text-[#1a1a1a]">
            {offer.price}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-[#1a1a1a] mb-4 leading-tight">
          {offer.title}
        </h3>

        {/* Blurred description zone */}
        <div className="relative bg-[#f8f8f8] rounded-xl p-4 mb-4 border border-[#e5e5e5]">
          <div className="blur-[6px] text-gray-400 text-sm leading-relaxed select-none">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[#666] text-xs font-medium bg-white/95 px-4 py-2 rounded-lg border border-[#e5e5e5]">
              Description révélée à la fin
            </span>
          </div>
        </div>

        {/* Result section */}
        <div className={cn("rounded-xl p-4 border", scheme.resultBg)}>
          <p className="text-[10px] text-[#888] mb-1.5 uppercase tracking-wider font-semibold">Résultat attendu</p>
          <p className="text-sm text-[#1a1a1a] leading-relaxed font-medium">
            {offer.outcome || offer.result || "Transformation garantie"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}