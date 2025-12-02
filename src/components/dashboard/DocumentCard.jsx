import React from 'react';
import { motion } from "framer-motion";
import { FileText, Download, Edit3, Sparkles, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import GlowButton from '@/components/ui/GlowButton';

export default function DocumentCard({ document, onView, onDownload, index }) {
  const isGenerated = document.is_generated;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "group relative p-5 rounded-2xl border transition-all duration-300",
        isGenerated
          ? "bg-[#1b1b33] border-[#2a2a45] hover:border-[#61f7a2]/30"
          : "bg-[#1b1b33]/50 border-[#2a2a45]/50"
      )}
    >
      {/* Status badge */}
      {isGenerated && (
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#61f7a2]/10 text-[#61f7a2] text-xs">
            <CheckCircle className="w-3 h-3" />
            Généré
          </div>
        </div>
      )}
      
      {/* Icon */}
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
        isGenerated ? "bg-[#61f7a2]/10" : "bg-[#2a2a45]"
      )}>
        <FileText className={cn(
          "w-6 h-6",
          isGenerated ? "text-[#61f7a2]" : "text-gray-500"
        )} />
      </div>
      
      {/* Content */}
      <h4 className="font-semibold text-white mb-1 pr-16">{document.title}</h4>
      <p className="text-sm text-gray-400 mb-4">{document.subcategory}</p>
      
      {/* Version */}
      {document.version && (
        <p className="text-xs text-gray-500 mb-4">Version {document.version}</p>
      )}
      
      {/* Actions */}
      <div className="flex items-center gap-2">
        {isGenerated ? (
          <>
            <GlowButton 
              variant="secondary" 
              size="sm" 
              onClick={() => onView(document)}
              icon={Edit3}
              className="flex-1"
            >
              Éditer
            </GlowButton>
            <button 
              onClick={() => onDownload(document)}
              className="p-2 rounded-xl bg-[#2a2a45] hover:bg-[#3a3a55] text-gray-400 hover:text-white transition-all"
            >
              <Download className="w-4 h-4" />
            </button>
          </>
        ) : (
          <GlowButton 
            variant="outline" 
            size="sm" 
            icon={Sparkles}
            className="w-full"
          >
            Générer
          </GlowButton>
        )}
      </div>
    </motion.div>
  );
}