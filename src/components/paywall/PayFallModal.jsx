import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Zap, CheckCircle, Lock } from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';

export default function PayFallModal({ isOpen, onClose, onCheckout }) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      await onCheckout();
    } catch (error) {
      console.error('Checkout error:', error);
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-200 relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-10 text-center">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] shadow-lg">
                <span className="text-3xl font-bold text-white">P</span>
              </div>
              <p className="text-sm font-semibold text-gray-700 mt-2">Passion IA</p>
            </motion.div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Débloquer l'accès maintenant
            </h2>
            <p className="text-gray-600 text-base mb-8">
              Accède immédiatement à tous tes documents IA et à ton plan d'action personnalisé
            </p>

            {/* Pricing */}
            <div className="mb-8">
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, -2, 2, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="inline-block"
              >
                <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-full mb-4">
                  <span className="text-red-600 text-sm font-bold">
                    🔥 Offre de lancement – 77% de réduction
                  </span>
                </div>
              </motion.div>
              <div className="flex items-center justify-center gap-4 mb-2">
                <span className="text-2xl text-gray-400 line-through font-semibold">297 €</span>
                <span className="text-5xl font-bold text-gray-900">67 €</span>
              </div>
            </div>

            {/* CTA */}
            <div className="mb-8">
              <motion.div
                animate={{ 
                  scale: [1, 1.02, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <GlowButton
                  onClick={handleCheckout}
                  loading={isLoading}
                  disabled={isLoading}
                  size="lg"
                  className="w-full py-4 text-lg font-bold"
                  icon={Lock}
                >
                  Débloquer maintenant
                </GlowButton>
              </motion.div>
            </div>

            {/* Rassurance */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-600 flex-wrap mb-3">
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
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" 
                  alt="Stripe" 
                  className="h-4"
                />
                <span>Paiement sécurisé via Stripe</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}