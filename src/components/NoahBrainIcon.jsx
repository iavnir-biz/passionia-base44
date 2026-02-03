import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

/**
 * NoahBrainIcon - Icône animée de Noah qui "réfléchit"
 * 
 * @param {number} size - Taille de l'icône (default: 48)
 * @param {boolean} isThinking - Active l'animation de réflexion (default: true)
 * @param {boolean} isFloating - Active l'animation de flottaison (default: false)
 * @param {string} className - Classes CSS additionnelles
 */
export const NoahBrainIcon = ({ size = 48, isThinking = true, isFloating = false, className = '' }) => {
  const iconSize = Math.round(size * 0.5);
  
  return (
    <motion.div
      className={`relative ${className}`}
      animate={isFloating ? {
        y: [0, -8, 0],
        scale: [1, 1.02, 1],
      } : isThinking ? {
        scale: [1, 1.05, 1],
      } : {}}
      transition={{
        duration: isFloating ? 3 : 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <div 
        className="rounded-2xl bg-[#61f7a2] flex items-center justify-center shadow-lg"
        style={{ width: size, height: size }}
      >
        <Brain className="text-white" style={{ width: iconSize, height: iconSize }} />
      </div>
    </motion.div>
  );
};

/**
 * Version simple sans animation (pour les endroits statiques)
 */
export const NoahBrainIconStatic = ({ size = 48, className = '' }) => {
  const iconSize = Math.round(size * 0.5);
  
  return (
    <div className={className}>
      <div 
        className="rounded-2xl bg-[#61f7a2] flex items-center justify-center shadow-lg"
        style={{ width: size, height: size }}
      >
        <Brain className="text-white" style={{ width: iconSize, height: iconSize }} />
      </div>
    </div>
  );
};

export default NoahBrainIcon;