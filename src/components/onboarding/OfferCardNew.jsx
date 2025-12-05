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
        "relative cursor-pointer rounded-2xl bg-[#1b1b33] border-2 transition-all duration-300 overflow-hidden",
        isSelected 
          ? "border-[#61f7a2] shadow-lg shadow-[#61f7a2]/20" 
          : "border-[#2a2a45] hover:border-[#3a3a55]"
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-[#61f7a2] rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-[#11112b]" />
        </div>
      )}

      <div className="p-6">
        {/* Header with badge and price */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="w-8 h-8 rounded-lg bg-[#61f7a2]/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-[#61f7a2]" />
              </div>
            )}
            <span className="px-3 py-1 bg-[#61f7a2]/10 text-[#61f7a2] text-xs font-medium rounded-full">
              {offer.badge}
            </span>
          </div>
          <span className="text-2xl font-bold text-[#61f7a2]">
            {offer.price}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-4 leading-tight">
          {offer.title}
        </h3>

        {/* Blurred description zone */}
        <div className="relative bg-[#11112b] rounded-xl p-4 mb-4 border border-[#2a2a45]">
          <div className="blur-[6px] text-gray-500 text-sm leading-relaxed select-none">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gray-400 text-sm font-medium bg-[#11112b]/90 px-4 py-2 rounded-lg border border-[#2a2a45]">
              Description complète révélée à la fin
            </span>
          </div>
        </div>

        {/* Result section */}
        <div className="bg-[#11112b] rounded-xl p-4 border border-[#2a2a45]">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Résultat attendu :</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            {offer.result}
          </p>
        </div>
      </div>
    </motion.div>
  );
}