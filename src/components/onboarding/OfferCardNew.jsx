import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function OfferCardNew({ 
  offer, 
  isSelected, 
  onSelect,
  icon: Icon,
  colorScheme = 'green' // 'blue', 'green', 'purple', 'gold'
}) {
  // Color configurations
  const colors = {
    blue: {
      bg: 'from-blue-500/20 to-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-500',
      shadow: 'shadow-blue-500/20',
      glow: 'shadow-lg shadow-blue-500/30',
      badge: 'bg-blue-500/10 text-blue-500'
    },
    green: {
      bg: 'from-green-500/20 to-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-500',
      shadow: 'shadow-green-500/20',
      glow: 'shadow-lg shadow-green-500/30',
      badge: 'bg-green-500/10 text-green-500'
    },
    purple: {
      bg: 'from-purple-500/20 to-purple-500/10',
      border: 'border-purple-500/30',
      text: 'text-purple-500',
      shadow: 'shadow-purple-500/20',
      glow: 'shadow-lg shadow-purple-500/30',
      badge: 'bg-purple-500/10 text-purple-500'
    },
    gold: {
      bg: 'from-yellow-500/20 to-amber-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-500',
      shadow: 'shadow-yellow-500/20',
      glow: 'shadow-lg shadow-yellow-500/30',
      badge: 'bg-yellow-500/10 text-yellow-500'
    }
  };

  const scheme = colors[colorScheme];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(offer)}
      className={cn(
        "relative cursor-pointer rounded-3xl bg-white border-2 transition-all duration-300 overflow-hidden",
        isSelected 
          ? cn("border-2", scheme.border, scheme.glow)
          : "border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg"
      )}
    >
      {/* Selection indicator */}
      <AnimatePresence>
        {isSelected && (
          <motion.div 
            className={cn(
              "absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center shadow-lg",
              scheme.text.replace('text-', 'bg-')
            )}
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
              <motion.div 
                className={cn("w-10 h-10 rounded-2xl bg-gradient-to-br flex items-center justify-center", scheme.bg)}
                whileHover={{ rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <Icon className={cn("w-5 h-5", scheme.text)} />
              </motion.div>
            )}
            <motion.span 
              className={cn("px-3 py-1.5 text-xs font-semibold rounded-full", scheme.badge)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {offer.badge}
            </motion.span>
          </div>
          <motion.span 
            className={cn("text-2xl font-bold", scheme.text)}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {offer.price}
          </motion.span>
        </div>

        {/* Title */}
        <motion.h3 
          className="text-lg font-bold text-gray-900 mb-4 leading-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {offer.title}
        </motion.h3>

        {/* Blurred description zone */}
        <motion.div 
          className="relative bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="blur-[6px] text-gray-400 text-sm leading-relaxed select-none">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span 
              className="text-gray-600 text-sm font-medium bg-white/95 px-4 py-2 rounded-xl border border-gray-200 shadow-sm"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              Description complète révélée à la fin
            </motion.span>
          </div>
        </motion.div>

        {/* Result section */}
        <motion.div 
          className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-xs text-gray-600 mb-2 uppercase tracking-wide font-semibold">Résultat attendu :</p>
          <p className="text-sm text-gray-700 leading-relaxed font-medium">
            {offer.result}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}