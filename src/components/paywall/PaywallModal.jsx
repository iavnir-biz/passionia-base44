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
          className="w-full max-w-lg bg-slate-700 rounded-3xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-8 text-center">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-16 h-16 rounded-2xl bg-[#61f7a2] mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">
              Débloquer l'accès complet
            </h2>
            <p className="text-gray-300 text-base">
              Accède à tous tes documents IA et ton plan d'action personnalisé
            </p>
          </div>
          
          {/* Features */}
          <div className="px-8 pb-8">
            <div className="space-y-3 mb-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 text-white"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-600 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4 text-[#61f7a2]" />
                  </div>
                  <span className="text-base">{feature.text}</span>
                </motion.div>
              ))}
            </div>
            
            {/* Price */}
            <div className="text-center mb-6">
              <div className="flex items-baseline justify-center gap-3 mb-1">
                <span className="text-5xl font-bold text-white">47€</span>
                <span className="text-xl text-gray-400 line-through">97€</span>
              </div>
              <p className="text-[#61f7a2] text-base font-semibold">Offre de lancement -50%</p>
            </div>
            
            {/* CTA */}
            <GlowButton 
              onClick={onPurchase}
              loading={loading}
              className="w-full text-lg py-4 rounded-2xl"
            >
              Débloquer maintenant
            </GlowButton>
            
            <p className="text-center text-gray-400 text-sm mt-4">
              Paiement sécurisé • Accès immédiat • Satisfait ou remboursé
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}