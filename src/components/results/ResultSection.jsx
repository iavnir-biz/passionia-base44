import React from 'react';
import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ResultSection({ 
  title, 
  content, 
  icon: Icon, 
  index, 
  isBlurred = false,
  isLocked = false 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "relative p-6 rounded-2xl border transition-all",
        isBlurred 
          ? "bg-[#1b1b33]/50 border-[#2a2a45]/50" 
          : "bg-[#1b1b33] border-[#2a2a45]"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          isBlurred ? "bg-[#2a2a45]/50" : "bg-[#61f7a2]/10"
        )}>
          {isLocked ? (
            <Lock className="w-5 h-5 text-gray-500" />
          ) : (
            <Icon className={cn(
              "w-5 h-5",
              isBlurred ? "text-gray-500" : "text-[#61f7a2]"
            )} />
          )}
        </div>
        <h3 className={cn(
          "text-lg font-semibold",
          isBlurred ? "text-gray-500" : "text-white"
        )}>
          {title}
        </h3>
        {!isBlurred && !isLocked && (
          <Check className="w-5 h-5 text-[#61f7a2] ml-auto" />
        )}
      </div>
      
      {/* Content */}
      <div className={cn(
        "text-gray-300 leading-relaxed",
        isBlurred && "blur-content select-none"
      )}>
        {content}
      </div>
      
      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-[#11112b]/60 rounded-2xl flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <Lock className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Contenu premium</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}