import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import { ChevronDown, Lock, CheckCircle2, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChecklistItem from './ChecklistItem';
import confetti from 'canvas-confetti';

export default function DayCard({ 
  day, 
  isActive, 
  isCompleted, 
  isLocked,
  onComplete,
  onChecklistChange,
  checklist = []
}) {
  const [isExpanded, setIsExpanded] = useState(isActive || isCompleted);
  const [showCelebration, setShowCelebration] = useState(false);

  const allChecked = checklist.every(item => item.checked);

  useEffect(() => {
    if (isCompleted && isActive) {
      setShowCelebration(true);
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Hide celebration after 3 seconds
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [isCompleted, isActive]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl border-2 overflow-hidden transition-all",
        isCompleted && "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300",
        isActive && !isCompleted && "bg-white border-[#61f7a2] shadow-lg",
        isLocked && "bg-gray-50 border-gray-200 opacity-60"
      )}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={isLocked}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl",
            isCompleted && "bg-[#61f7a2] text-white",
            isActive && !isCompleted && "bg-[#61f7a2]/10 text-[#61f7a2]",
            isLocked && "bg-gray-200 text-gray-400"
          )}>
            {isCompleted ? (
              <CheckCircle2 className="w-7 h-7" />
            ) : isLocked ? (
              <Lock className="w-6 h-6" />
            ) : (
              day.number
            )}
          </div>

          {/* Title & Objective */}
          <div className="text-left">
            <h3 className={cn(
              "text-xl font-bold mb-1 text-gray-900",
              isLocked && "text-gray-500"
            )}>
              Jour {day.number} — {day.title}
            </h3>
            <p className={cn(
              "text-sm text-gray-600",
              isLocked && "text-gray-400"
            )}>
              {day.objective}
            </p>
          </div>
        </div>

        {!isLocked && (
          <ChevronDown className={cn(
            "w-5 h-5 transition-transform text-gray-400",
            isExpanded && "rotate-180"
          )} />
        )}
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && !isLocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200"
          >
            <div className="p-6 space-y-6">
              {/* Celebration Message */}
              {showCelebration && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-gradient-to-r from-[#61f7a2] to-[#4de88f] rounded-2xl p-6 text-center text-white"
                >
                  <PartyPopper className="w-12 h-12 mx-auto mb-3" />
                  <h3 className="text-2xl font-bold mb-2">Félicitations ! 🎉</h3>
                  <p className="text-lg">
                    Vous avez bien complété les actions du Jour {day.number} !
                  </p>
                </motion.div>
              )}

              {/* Key Message */}
              {day.keyMessage && !isCompleted && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <p className="text-blue-800 font-medium italic">
                    {day.keyMessage}
                  </p>
                </div>
              )}

              {/* Checklist */}
              <div className="space-y-3">
                {checklist.map((item, idx) => (
                  <ChecklistItem
                    key={idx}
                    item={item}
                    checked={item.checked}
                    onChange={() => onChecklistChange(idx)}
                    disabled={isCompleted}
                  />
                ))}
              </div>

              {/* Completion Message for completed days */}
              {isCompleted && day.completionMessage && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                  <p className="text-green-800 font-medium">
                    ✅ {day.completionMessage}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {day.buttons && day.buttons.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {day.buttons.map((btn, idx) => (
                    <Button
                      key={idx}
                      onClick={btn.onClick}
                      variant="outline"
                      size="sm"
                      className="border-[#61f7a2] text-[#61f7a2] hover:bg-[#61f7a2] hover:text-white"
                    >
                      {btn.label}
                    </Button>
                  ))}
                </div>
              )}

              {/* Complete Button */}
              {allChecked && !isCompleted && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="pt-4 border-t border-gray-200"
                >
                  <Button
                    onClick={onComplete}
                    className="w-full bg-[#61f7a2] hover:bg-[#4de88f] text-white font-bold py-6 text-lg"
                  >
                    ✓ Passer au Jour {day.number + 1}
                  </Button>
                  <p className="text-center text-gray-600 text-sm mt-3">
                    {day.completionMessage}
                  </p>
                </motion.div>
              )}

              {/* Special Message */}
              {day.specialMessage && isCompleted && (
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 text-center">
                  <p className="text-yellow-800 font-bold text-lg">
                    {day.specialMessage}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}