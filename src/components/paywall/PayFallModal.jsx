import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles, Users, Shield, Zap } from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import { cn } from "@/lib/utils";

export default function PayFallModal({ isOpen, onClose, onCheckout }) {
  if (!isOpen) return null;

  const includedItems = [
    { icon: Sparkles, text: "Offre complète générée par IA" },
    { icon: FileText, text: "Page de vente personnalisée" },
    { icon: Mail, text: "5 emails de vente automatiques" },
    { icon: Zap, text: "Plan d'action 7 jours pour vendre ton premier produit" },
    { icon: Calendar, text: "Plan d'action 30 jours" },
    { icon: FileText, text: "Tous les documents IA générés pour toi" }
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
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-b border-gray-700 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Débloquer l'accès complet
              </h2>
              <p className="text-gray-400 text-sm">
                Accède immédiatement à tous tes documents IA et à ton plan d'action personnalisé
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Ce qui est inclus */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Ce qui est inclus :</h3>
              <div className="space-y-3">
                {includedItems.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#61f7a2] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-[#1a1a2e]" />
                    </div>
                    <span className="text-gray-300">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Bonus Communauté */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-2xl p-5"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">
                    🎁 Bonus – Accès à la communauté privée (offert)
                  </h4>
                  <p className="text-gray-400 text-sm mb-3">
                    Accès à la communauté Passion IA pour les 50 premiers :
                  </p>
                  <ul className="space-y-1.5 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-yellow-400" />
                      Lives réguliers
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-yellow-400" />
                      Accompagnement et retours personnalisés
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-yellow-400" />
                      Échanges entre membres
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-yellow-400" />
                      Jamais seul(e) dans ton parcours
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Micro optimisation */}
            <p className="text-center text-gray-400 text-sm italic">
              Tout est prêt. Tu passes simplement à l'étape suivante.
            </p>

            {/* Pricing */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center py-6"
            >
              <div className="inline-block px-4 py-1.5 bg-red-500/20 border border-red-500/30 rounded-full mb-4">
                <span className="text-red-400 text-sm font-semibold">
                  Offre de lancement – 77% de réduction
                </span>
              </div>
              <div className="flex items-center justify-center gap-4 mb-2">
                <span className="text-3xl text-gray-500 line-through">297 €</span>
                <span className="text-5xl font-bold text-[#61f7a2]">67 €</span>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.03, 1],
                  boxShadow: [
                    '0 0 0px rgba(97, 247, 162, 0.5)',
                    '0 0 40px rgba(97, 247, 162, 0.9)',
                    '0 0 0px rgba(97, 247, 162, 0.5)'
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
                  className="px-16 py-4 text-xl shadow-2xl"
                >
                  Débloquer maintenant
                </GlowButton>
              </motion.div>
            </motion.div>

            {/* Rassurance */}
            <div className="flex items-center justify-center gap-6 text-sm text-gray-400 flex-wrap">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#61f7a2]" />
                <span>Paiement sécurisé</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#61f7a2]" />
                <span>Accès immédiat</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#61f7a2]" />
                <span>Satisfait ou remboursé</span>
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">
              Paiement sécurisé via Stripe
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Missing imports for icons
import { FileText, Mail, Calendar } from 'lucide-react';