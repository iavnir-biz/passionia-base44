import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Users, Shield, Zap, Target, FileText, Mail, Calendar, MessageSquare, CheckCircle } from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import { cn } from "@/lib/utils";

export default function PayFallModal({ isOpen, onClose, onCheckout }) {
  if (!isOpen) return null;

  const includedItems = [
    { icon: Sparkles, text: "Offre complète générée par IA" },
    { icon: Target, text: "Validation de marché, de cible et de positionnement" },
    { icon: FileText, text: "Page de vente personnalisée" },
    { icon: Mail, text: "5 emails de vente automatiques" },
    { icon: MessageSquare, text: "Tous les messages de vente inclus" },
    { icon: Zap, text: "Plan d'action 7 jours pour vendre ton premier produit" },
    { icon: Calendar, text: "Plan d'action 30 jours" },
    { icon: FileText, text: "Tous les documents IA" }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header - Centré */}
          <div className="text-center pt-8 pb-6 px-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#61f7a2]/10 border border-[#61f7a2]/30 mb-4"
              style={{ boxShadow: '0 0 20px rgba(97, 247, 162, 0.2)' }}
            >
              <Sparkles className="w-8 h-8 text-[#61f7a2]" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Débloquer l'accès complet
            </h2>
            <p className="text-gray-400">
              Accède immédiatement à tous tes documents IA et à ton plan d'action personnalisé
            </p>
          </div>

          {/* Content */}
          <div className="px-8 pb-8 space-y-6">
            {/* Ce qui est inclus */}
            <div>
              <h3 className="text-xl font-bold text-white mb-5 text-center">Ce qui est inclus :</h3>
              <div className="grid grid-cols-1 gap-3">
                {includedItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-4 bg-white/5 rounded-xl p-3 border border-white/10"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#61f7a2]/10 border border-[#61f7a2]/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-[#61f7a2]" />
                      </div>
                      <span className="text-gray-300 text-sm">{item.text}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Bonus Communauté - Mise en avant premium */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-amber-500/20 via-yellow-500/15 to-amber-500/20 border-2 border-yellow-400/40 rounded-2xl p-6 shadow-lg"
              style={{ boxShadow: '0 0 30px rgba(251, 191, 36, 0.15)' }}
            >
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-400/20 border border-yellow-400/40 mb-3">
                  <Users className="w-6 h-6 text-yellow-400" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">
                  🎁 Bonus – Accès à la communauté privée (offert)
                </h4>
                <p className="text-gray-300 text-sm mb-4">
                  Accès à la communauté Passion IA pour les 50 premiers :
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Lives réguliers",
                  "Accompagnement personnalisé",
                  "Échanges entre membres",
                  "Jamais seul(e) dans ton parcours"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white/5 rounded-lg p-2 border border-yellow-400/20">
                    <CheckCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <span className="text-gray-200 text-xs">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Phrase de transition */}
            <p className="text-center text-gray-300 text-base font-medium py-2">
              Tout est prêt. Tu passes simplement à l'étape suivante.
            </p>

            {/* Pricing */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center py-4"
            >
              <div className="inline-block px-5 py-2 bg-red-500/20 border border-red-500/40 rounded-full mb-5">
                <span className="text-red-400 text-sm font-bold">
                  Offre de lancement – 77% de réduction
                </span>
              </div>
              <div className="flex items-center justify-center gap-5 mb-2">
                <span className="text-3xl text-gray-500 line-through font-semibold">297 €</span>
                <span className="text-6xl font-bold text-[#61f7a2]">67 €</span>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center mb-6"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.02, 1],
                  boxShadow: [
                    '0 0 0px rgba(97, 247, 162, 0.4)',
                    '0 0 50px rgba(97, 247, 162, 0.6)',
                    '0 0 0px rgba(97, 247, 162, 0.4)'
                  ]
                }}
                transition={{ 
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="rounded-xl"
              >
                <GlowButton
                  onClick={onCheckout}
                  size="lg"
                  className="px-20 py-5 text-xl font-bold shadow-2xl"
                >
                  Débloquer maintenant
                </GlowButton>
              </motion.div>
            </motion.div>

            {/* Rassurance - Footer */}
            <div className="border-t border-white/10 pt-6">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-400 flex-wrap mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#61f7a2]" />
                  <span>Paiement sécurisé</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#61f7a2]" />
                  <span>Accès immédiat</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#61f7a2]" />
                  <span>Satisfait ou remboursé</span>
                </div>
              </div>
              <p className="text-center text-xs text-gray-500">
                Paiement sécurisé via Stripe
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}