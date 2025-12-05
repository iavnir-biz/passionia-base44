import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function OfferCardNew({ 
  offer, 
  isSelected, 
  onSelect,
  icon: Icon
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect(offer)}
      className={cn(
        "relative cursor-pointer rounded-xl bg-white border-2 transition-all duration-300 overflow-hidden",
        isSelected 
          ? "border-[#22c55e] shadow-lg shadow-[#22c55e]/20" 
          : "border-gray-200 hover:border-gray-300"
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-[#22c55e] rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      <div className="p-5">
        {/* Header with badge and price */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="w-8 h-8 rounded-lg bg-[#22c55e]/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-[#22c55e]" />
              </div>
            )}
            <span className="px-3 py-1 bg-[#22c55e]/10 text-[#22c55e] rounded-full text-xs font-medium">
              {offer.badge}
            </span>
          </div>
          <span className="text-xl font-bold text-gray-800">
            {offer.price}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-gray-800 mb-4 leading-tight">
          {offer.title}
        </h3>

        {/* Blurred description */}
        <div className="relative bg-gray-50 rounded-lg p-4 mb-4">
          <div className="blur-[6px] text-gray-400 text-sm leading-relaxed select-none">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gray-500 text-sm font-medium bg-gray-50/80 px-3 py-1 rounded">
              Description complète révélée à la fin
            </span>
          </div>
        </div>

        {/* Result */}
        <div>
          <p className="text-xs text-gray-400 mb-1 italic">Résultat attendu :</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            {offer.result}
          </p>
        </div>
      </div>
    </motion.div>
  );
}