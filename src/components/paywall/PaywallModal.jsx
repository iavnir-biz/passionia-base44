import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles, Zap, FileText, Target, Calendar } from "lucide-react";
import GlowButton from '@/components/ui/GlowButton';

const features = [
  { icon: FileText, text: "Offre complète générée par IA" },
  { icon: Target, text: "Page de vente personnalisée" },
  { icon: Zap, text: "5 emails de vente automatiques" },
  { icon: Calendar, text: "Plan d'action 30 jours" },
  { icon: Sparkles, text: "Tous les documents IA" },
];

export default function PaywallModal({ isOpen, onClose, onPurchase, loading }) {
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-lg bg-[#1b1b33] rounded-3xl border border-[#2a2a45] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-8 text-center bg-gradient-to-b from-[#61f7a2]/10 to-transparent">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#2a2a45] flex items-center justify-center text-gray-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="w-16 h-16 rounded-2xl bg-[#61f7a2] mx-auto mb-4 flex items-center justify-center glow-green">
              <Sparkles className="w-8 h-8 text-[#11112b]" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              Débloquer l'accès complet
            </h2>
            <p className="text-gray-400">
              Accède à tous tes documents IA et ton plan d'action personnalisé
            </p>
          </div>
          
          {/* Features */}
          <div className="p-8 pt-4">
            <div className="space-y-3 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 text-gray-300"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#61f7a2]/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4 text-[#61f7a2]" />
                  </div>
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </div>
            
            {/* Price */}
            <div className="text-center mb-6">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl font-bold text-white">47€</span>
                <span className="text-gray-400 line-through">97€</span>
              </div>
              <p className="text-[#61f7a2] text-sm mt-1">Offre de lancement -50%</p>
            </div>
            
            {/* CTA */}
            <GlowButton 
              onClick={onPurchase}
              loading={loading}
              className="w-full text-lg py-4"
            >
              Débloquer maintenant
            </GlowButton>
            
            <p className="text-center text-gray-500 text-xs mt-4">
              Paiement sécurisé • Accès immédiat • Satisfait ou remboursé
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}