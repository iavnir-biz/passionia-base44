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
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(offer)}
      className={cn(
        "relative cursor-pointer rounded-3xl bg-white border-2 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md",
        isSelected 
          ? "border-[#61f7a2] shadow-lg shadow-[#61f7a2]/10" 
          : "border-gray-200 hover:border-gray-300"
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
          className="absolute top-4 right-4 w-8 h-8 bg-[#61f7a2] rounded-full flex items-center justify-center shadow-sm"
        >
          <Check className="w-5 h-5 text-white" />
        </motion.div>
      )}

      <div className="p-6">
        {/* Header with badge and price */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#61f7a2]/20 to-[#61f7a2]/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#61f7a2]" />
              </div>
            )}
            <span className="px-3 py-1.5 bg-[#61f7a2]/10 text-[#61f7a2] text-xs font-semibold rounded-full">
              {offer.badge}
            </span>
          </div>
          <span className="text-2xl font-bold text-[#61f7a2]">
            {offer.price}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-4 leading-tight">
          {offer.title}
        </h3>

        {/* Blurred description zone */}
        <div className="relative bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-200">
          <div className="blur-[6px] text-gray-400 text-sm leading-relaxed select-none">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gray-600 text-sm font-medium bg-white/95 px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
              Description complète révélée à la fin
            </span>
          </div>
        </div>

        {/* Result section */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-100">
          <p className="text-xs text-gray-600 mb-2 uppercase tracking-wide font-semibold">Résultat attendu :</p>
          <p className="text-sm text-gray-700 leading-relaxed font-medium">
            {offer.result}
          </p>
        </div>
      </div>
    </motion.div>
  );
}