import React from 'react';
import { motion } from 'framer-motion';

/**
 * NoahBrainIcon - Icône animée de Noah qui "réfléchit"
 * 
 * @param {number} size - Taille de l'icône (default: 48)
 * @param {boolean} isThinking - Active l'animation de réflexion (default: true)
 * @param {string} className - Classes CSS additionnelles
 */
export const NoahBrainIcon = ({ size = 48, isThinking = true, className = '' }) => {
  const gradientId = `noah-brain-bg-${size}`;
  return (
    <motion.div
      className={className}
      animate={isThinking ? {
        scale: [1, 1.05, 1],
      } : {}}
      transition={{
        duration: 2,
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
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#61f7a2" />
            <stop offset="100%" stopColor="#2dd4bf" />
          </linearGradient>
        </defs>
        
        {/* Background */}
        <rect x="2" y="2" width="60" height="60" rx="14" fill={`url(#${gradientId})`} />
        
        {/* Brain left hemisphere */}
        <motion.path 
          d="M18 38C14 38 11 34 11 30C11 27 13 24 16 23C15 21 15 18 17 16C19 14 22 14 24 15C25 12 28 10 32 10"
          stroke="white" 
          strokeWidth="3" 
          strokeLinecap="round"
          fill="none"
          animate={isThinking ? { 
            opacity: [0.9, 1, 0.9],
            pathLength: [0.95, 1, 0.95]
          } : {}}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Brain right hemisphere */}
        <motion.path 
          d="M46 38C50 38 53 34 53 30C53 27 51 24 48 23C49 21 49 18 47 16C45 14 42 14 40 15C39 12 36 10 32 10"
          stroke="white" 
          strokeWidth="3" 
          strokeLinecap="round"
          fill="none"
          animate={isThinking ? { 
            opacity: [0.9, 1, 0.9],
            pathLength: [0.95, 1, 0.95]
          } : {}}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2
          }}
        />
        
        {/* Center connection */}
        <path d="M32 10V22" stroke="white" strokeWidth="3" strokeLinecap="round" />
        
        {/* Eyes */}
        <circle cx="24" cy="28" r="4" fill="white" />
        <circle cx="40" cy="28" r="4" fill="white" />
        
        {/* Pupils - animated looking around */}
        <motion.circle 
          cx="25" 
          cy="27" 
          r="2" 
          fill="#1f2937"
          animate={isThinking ? {
            cx: [25, 23, 25, 26, 25],
            cy: [27, 28, 27, 28, 27]
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.circle 
          cx="41" 
          cy="27" 
          r="2" 
          fill="#1f2937"
          animate={isThinking ? {
            cx: [41, 39, 41, 42, 41],
            cy: [27, 28, 27, 28, 27]
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Smile */}
        <path 
          d="M26 44C26 44 29 48 32 48C35 48 38 44 38 44" 
          stroke="white" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          fill="none"
        />
        
        {/* Thinking sparkles - animated */}
        <motion.circle 
          cx="54" 
          cy="10" 
          r="3" 
          fill="white"
          animate={isThinking ? {
            opacity: [0.4, 1, 0.4],
            scale: [0.8, 1.2, 0.8]
          } : { opacity: 0.7 }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.circle 
          cx="10" 
          cy="12" 
          r="2" 
          fill="#fbbf24"
          animate={isThinking ? {
            opacity: [0.5, 1, 0.5],
            scale: [0.9, 1.1, 0.9]
          } : { opacity: 0.6 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3
          }}
        />
        <motion.circle 
          cx="52" 
          cy="52" 
          r="2" 
          fill="#fbbf24"
          animate={isThinking ? {
            opacity: [0.3, 0.8, 0.3],
            scale: [0.8, 1, 0.8]
          } : { opacity: 0.5 }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.6
          }}
        />
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
        <defs>
          <linearGradient id="noah-brain-static-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#61f7a2" />
            <stop offset="100%" stopColor="#2dd4bf" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#noah-brain-static-bg)" />
        <path d="M18 38C14 38 11 34 11 30C11 27 13 24 16 23C15 21 15 18 17 16C19 14 22 14 24 15C25 12 28 10 32 10" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <path d="M46 38C50 38 53 34 53 30C53 27 51 24 48 23C49 21 49 18 47 16C45 14 42 14 40 15C39 12 36 10 32 10" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <path d="M32 10V22" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <circle cx="24" cy="28" r="4" fill="white" />
        <circle cx="40" cy="28" r="4" fill="white" />
        <circle cx="25" cy="27" r="2" fill="#1f2937" />
        <circle cx="41" cy="27" r="2" fill="#1f2937" />
        <path d="M26 44C26 44 29 48 32 48C35 48 38 44 38 44" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <circle cx="54" cy="10" r="3" fill="white" opacity="0.7" />
      </svg>
    </div>
  );
};

export default NoahBrainIcon;