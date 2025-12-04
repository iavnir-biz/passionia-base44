import React from 'react';
import { motion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function OfferCard({ 
  offer, 
  isSelected, 
  onSelect 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(offer)}
      className={cn(
        "relative cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300",
        isSelected 
          ? "bg-[#61f7a2]/10 border-[#61f7a2] shadow-lg shadow-[#61f7a2]/20" 
          : "bg-[#1b1b33] border-[#2a2a45] hover:border-[#3a3a55]"
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-[#61f7a2] rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-[#11112b]" />
        </div>
      )}

      {/* Badge */}
      <div className="inline-block px-3 py-1 bg-[#2a2a45] rounded-full text-xs text-gray-300 mb-4">
        {offer.badge}
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-white mb-2">
        {offer.title}
      </h3>

      {/* Price */}
      <div className="text-2xl font-bold text-[#61f7a2] mb-4">
        {offer.price}
      </div>

      {/* Result */}
      <p className="text-gray-400 text-sm mb-4">
        {offer.result}
      </p>

      {/* Locked description */}
      <div className="flex items-center gap-2 text-gray-500 text-xs">
        <Lock className="w-3 h-3" />
        <span>Description complète révélée à la fin</span>
      </div>
    </motion.div>
  );
}