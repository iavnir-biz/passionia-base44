import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Check, Circle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ActionOfTheDayCard({ action, onToggle, index }) {
  const isCompleted = action.is_completed;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "group relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer",
        isCompleted 
          ? "bg-gradient-active border-[#61f7a2]/30" 
          : "bg-[#1b1b33] border-[#2a2a45] hover:border-[#61f7a2]/20"
      )}
      onClick={() => onToggle(action.id)}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center transition-all flex-shrink-0 mt-0.5",
          isCompleted 
            ? "bg-[#61f7a2] glow-green-subtle" 
            : "border-2 border-[#2a2a45] group-hover:border-[#61f7a2]/50"
        )}>
          <AnimatePresence>
            {isCompleted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Check className="w-4 h-4 text-[#11112b]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <h4 className={cn(
            "font-semibold transition-all",
            isCompleted ? "text-[#61f7a2]" : "text-white"
          )}>
            {action.title}
          </h4>
          {action.description && (
            <p className="text-gray-400 text-sm mt-1">{action.description}</p>
          )}
        </div>
        
        {/* Priority indicator */}
        <div className="flex items-center gap-1">
          {[...Array(action.priority || 1)].map((_, i) => (
            <Sparkles key={i} className="w-3 h-3 text-[#61f7a2]/60" />
          ))}
        </div>
      </div>
      
      {/* Completion animation overlay */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: "radial-gradient(circle at center, rgba(97, 247, 162, 0.1) 0%, transparent 70%)"
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}