import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import { ChevronDown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ChecklistItem({ item, checked, onChange, disabled }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleAction = () => {
    if (item.action) {
      if (item.action.type === 'link') {
        navigate(createPageUrl(item.action.page));
      } else if (item.action.type === 'external') {
        window.open(item.action.url, '_blank');
      }
    }
  };

  const hasDetails = item.details || item.action;

  return (
    <div
      className={cn(
        "rounded-xl border-2 transition-all",
        checked 
          ? "bg-green-50 border-green-300" 
          : "bg-white border-gray-200"
      )}
    >
      {/* Main checkbox row */}
      <div className="flex items-start gap-3 p-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="mt-0.5 w-5 h-5 text-[#61f7a2] rounded focus:ring-[#61f7a2] cursor-pointer flex-shrink-0"
        />
        
        <div className="flex-1">
          <span className={cn(
            "font-medium text-gray-900",
            checked && "line-through text-green-700"
          )}>
            {item.text}
          </span>
        </div>

        {hasDetails && !checked && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <ChevronDown className={cn(
              "w-5 h-5 transition-transform",
              isExpanded && "rotate-180"
            )} />
          </button>
        )}
      </div>

      {/* Expandable details */}
      <AnimatePresence>
        {isExpanded && !checked && hasDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-200 overflow-hidden"
          >
            <div className="p-4 bg-gray-50 space-y-3">
              {item.details && (
                <p className="text-sm text-gray-700 leading-relaxed">
                  {item.details}
                </p>
              )}
              
              {item.action && (
                <Button
                  onClick={handleAction}
                  size="sm"
                  className="bg-[#61f7a2] hover:bg-[#4de88f] text-white gap-2"
                >
                  {item.action.label}
                  {item.action.type === 'external' && (
                    <ExternalLink className="w-3 h-3" />
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}