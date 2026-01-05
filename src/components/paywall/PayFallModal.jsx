import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Zap, CheckCircle } from 'lucide-react';
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
            {/* Title */}
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Débloquer l'accès maintenant
            </h2>
            <p className="text-gray-600 text-base mb-8">
              Accède immédiatement à tous tes documents IA et à ton plan d'action personnalisé
            </p>

            {/* Phrase de transition */}
            <p className="text-gray-700 text-lg font-medium mb-8">
              Tout est prêt. Tu passes simplement à l'étape suivante.
            </p>

            {/* Pricing */}
            <div className="mb-8">
              <div className="inline-block px-4 py-2 bg-red-50 border border-red-200 rounded-full mb-4">
                <span className="text-red-600 text-sm font-bold">
                  Offre de lancement – 77% de réduction
                </span>
              </div>
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
                <svg className="w-12 h-auto" viewBox="0 0 60 25" fill="none">
                  <path d="M0 12.5C0 5.597 5.597 0 12.5 0h35C54.403 0 60 5.597 60 12.5S54.403 25 47.5 25h-35C5.597 25 0 19.403 0 12.5z" fill="#635BFF"/>
                  <path d="M26.37 9.004c-.745 0-1.228.378-1.228.963 0 .477.346.768 1.134.951l.473.108c1.44.333 2.13 1.026 2.13 2.133 0 1.422-1.134 2.346-2.895 2.346-1.395 0-2.535-.588-2.805-1.71l1.332-.351c.18.729.828 1.161 1.53 1.161.837 0 1.41-.414 1.41-1.026 0-.522-.36-.846-1.278-1.05l-.432-.099c-1.35-.315-2.043-.972-2.043-2.07 0-1.35 1.116-2.256 2.742-2.256 1.305 0 2.295.54 2.598 1.521l-1.323.36c-.207-.576-.72-.981-1.35-.981zm4.365-1.89v2.169h1.53v1.08h-1.53v3.582c0 .675.288.936.927.936.198 0 .396-.018.603-.063v1.08c-.288.072-.594.099-.909.099-1.359 0-2.043-.63-2.043-1.872V10.363h-1.206v-1.08h1.206V7.113h1.422zm4.563 2.169c.117-.18.333-.315.576-.315.117 0 .225.027.324.072l-.252 1.215c-.135-.063-.279-.09-.432-.09-.783 0-1.305.657-1.305 1.647v3.654h-1.422V8.833h1.377v.9a1.98 1.98 0 011.134-.45zm2.025 6.183V8.833h1.422v6.633H37.323zm.711-8.145c-.495 0-.873-.36-.873-.837 0-.477.378-.837.873-.837.486 0 .864.36.864.837 0 .477-.378.837-.864.837zm3.15 8.235c-1.323 0-2.259-.828-2.259-2.241v-2.637c0-1.413.936-2.24 2.259-2.24 1.098 0 1.836.531 2.106 1.395l-1.233.459c-.18-.522-.549-.828-1.017-.828-.648 0-1.08.495-1.08 1.214v2.403c0 .72.432 1.215 1.08 1.215.486 0 .837-.315 1.017-.828l1.233.459c-.27.864-1.008 1.395-2.106 1.395zm6.039-.09h-1.584l-2.205-3.636v3.636h-1.422V6.384h1.422v5.058l2.124-3.609h1.53l-2.358 3.672 2.493 2.961z" fill="#fff"/>
                </svg>
                <span>Paiement sécurisé via Stripe</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}