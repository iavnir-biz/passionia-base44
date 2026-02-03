import React from 'react';
import { motion } from 'framer-motion';

/**
 * NoahBrainIcon - Icône animée de Noah qui "réfléchit"
 * 
 * @param {number} size - Taille de l'icône (default: 48)
 * @param {boolean} isThinking - Active l'animation de réflexion (default: true)
 * @param {string} className - Classes CSS additionnelles
 */
export const NoahBrainIcon = ({ size = 48, isThinking = true, isFloating = false, className = '' }) => {
  return (
    <motion.div
      className={className}
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
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 64 64" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background rounded square */}
        <rect x="4" y="4" width="56" height="56" rx="14" fill="#61f7a2" />
        
        {/* Brain icon - clean symmetric design */}
        <g transform="translate(14, 12)" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Left hemisphere */}
          <path d="M18 8C18 8 14 8 11 11C8 14 8 18 8 20C8 22 8 26 11 29C11 29 8 30 8 34C8 38 12 40 16 40" />
          
          {/* Right hemisphere */}
          <path d="M18 8C18 8 22 8 25 11C28 14 28 18 28 20C28 22 28 26 25 29C25 29 28 30 28 34C28 38 24 40 20 40" />
          
          {/* Center stem */}
          <path d="M18 8V16" />
          <path d="M16 40C16 40 18 44 18 44" />
          <path d="M20 40C20 40 18 44 18 44" />
          
          {/* Brain folds */}
          <path d="M12 20C14 22 16 22 18 20" />
          <path d="M18 20C20 22 22 22 24 20" />
        </g>
      </svg>
    </motion.div>
  );
};

/**
 * Version simple sans animation (pour les endroits statiques)
 */
export const NoahBrainIconStatic = ({ size = 48, className = '' }) => {
  return (
    <div className={className}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 64 64" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background rounded square */}
        <rect x="4" y="4" width="56" height="56" rx="14" fill="#61f7a2" />
        
        {/* Brain icon - clean symmetric design */}
        <g transform="translate(14, 12)" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Left hemisphere */}
          <path d="M18 8C18 8 14 8 11 11C8 14 8 18 8 20C8 22 8 26 11 29C11 29 8 30 8 34C8 38 12 40 16 40" />
          
          {/* Right hemisphere */}
          <path d="M18 8C18 8 22 8 25 11C28 14 28 18 28 20C28 22 28 26 25 29C25 29 28 30 28 34C28 38 24 40 20 40" />
          
          {/* Center stem */}
          <path d="M18 8V16" />
          <path d="M16 40C16 40 18 44 18 44" />
          <path d="M20 40C20 40 18 44 18 44" />
          
          {/* Brain folds */}
          <path d="M12 20C14 22 16 22 18 20" />
          <path d="M18 20C20 22 22 22 24 20" />
        </g>
      </svg>
    </div>
  );
};

export default NoahBrainIcon;