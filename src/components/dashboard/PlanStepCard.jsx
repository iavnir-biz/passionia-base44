import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from "framer-motion";
import { Check, ChevronRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import ProgressBar from '@/components/ui/ProgressBar';

export default function PlanStepCard({ step, index, isUnlocked = true }) {
  const isCompleted = step.is_completed;
  const checklistProgress = step.checklist 
    ? step.checklist.filter(item => item.completed).length 
    : 0;
  const checklistTotal = step.checklist?.length || 0;
  
  return (
    <Link 
      to={isUnlocked ? createPageUrl(`PlanStepDetail?step=${step.step_number}`) : "#"}
      className={cn(!isUnlocked && "pointer-events-none")}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={cn(
          "group relative p-5 rounded-2xl border transition-all duration-300",
          isCompleted 
            ? "bg-gradient-active border-[#61f7a2]/30" 
            : isUnlocked
              ? "bg-[#1b1b33] border-[#2a2a45] hover:border-[#61f7a2]/20 cursor-pointer"
              : "bg-[#1b1b33]/50 border-[#2a2a45]/50 opacity-60"
        )}
      >
        <div className="flex items-center gap-4">
          {/* Step number / Status */}
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0",
            isCompleted 
              ? "bg-[#61f7a2] text-[#11112b]" 
              : isUnlocked
                ? "bg-[#2a2a45] text-white"
                : "bg-[#1b1b33] text-gray-500"
          )}>
            {isCompleted ? (
              <Check className="w-5 h-5" />
            ) : !isUnlocked ? (
              <Lock className="w-4 h-4" />
            ) : (
              step.step_number
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              "font-semibold truncate",
              isCompleted ? "text-[#61f7a2]" : "text-white"
            )}>
              {step.title}
            </h4>
            {checklistTotal > 0 && (
              <div className="mt-2">
                <ProgressBar 
                  value={checklistProgress} 
                  max={checklistTotal} 
                  size="sm" 
                />
                <span className="text-xs text-gray-400 mt-1">
                  {checklistProgress}/{checklistTotal} tâches
                </span>
              </div>
            )}
          </div>
          
          {/* Arrow */}
          {isUnlocked && (
            <ChevronRight className={cn(
              "w-5 h-5 transition-transform",
              isCompleted ? "text-[#61f7a2]" : "text-gray-400 group-hover:text-white group-hover:translate-x-1"
            )} />
          )}
        </div>
      </motion.div>
    </Link>
  );
}