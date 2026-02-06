import React from 'react';
import { motion } from 'framer-motion';

/**
 * Compteur de sessions : "3/5 sessions créées" avec barre de progression
 */
export default function SessionCounter({ current, max, isPaid }) {
  const percentage = Math.min((current / max) * 100, 100);
  const isFull = current >= max;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">
            {isPaid ? 'Sessions' : 'Session'}
          </span>
          <span className={`text-sm font-bold ${isFull ? 'text-orange-600' : 'text-[#61f7a2]'}`}>
            {current}/{max}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${isFull ? 'bg-orange-400' : 'bg-[#61f7a2]'}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}
