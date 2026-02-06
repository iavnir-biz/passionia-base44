import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { X, Lock, Sparkles, LayoutDashboard, FileText, Check } from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';

/**
 * Modal Paywall specifique aux sessions
 * Affichée quand :
 * - Gratuit essaie de créer une 2e session
 * - Gratuit clique "Recommencer"
 * - Payant a atteint 5/5 (message different)
 */
export default function SessionPaywallModal({ isOpen, onClose, type = 'upgrade_required' }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const isLimitReached = type === 'limit_reached';

  const handleUpgrade = () => {
    onClose();
    navigate(createPageUrl('CTAPAYWALL'));
  };

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
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {isLimitReached ? (
              <>
                {/* Version 5/5 atteint */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#61f7a2]/10 mx-auto mb-4 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-[#61f7a2]" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Tu as cree tes 3 sessions !
                  </h2>
                  <p className="text-gray-600">
                    Elles restent accessibles dans ton dashboard.
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Compris
                </button>
              </>
            ) : (
              <>
                {/* Version gratuit → upgrade */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 mx-auto mb-4 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-amber-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Tu as utilise ta session gratuite !
                  </h2>
                  <p className="text-gray-600">
                    Passe Premium pour debloquer toutes les fonctionnalites.
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {[
                    { icon: Sparkles, text: '3 sessions au total' },
                    { icon: LayoutDashboard, text: 'Dashboard complet avec historique' },
                    { icon: FileText, text: 'Tous tes documents accessibles' },
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#61f7a2]/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-[#61f7a2]" />
                      </div>
                      <span className="text-gray-700 text-sm font-medium">{feature.text}</span>
                    </div>
                  ))}
                </div>

                <GlowButton
                  onClick={handleUpgrade}
                  className="w-full text-lg py-4 rounded-2xl mb-3"
                  size="lg"
                >
                  Passer Premium
                </GlowButton>

                <button
                  onClick={onClose}
                  className="w-full px-6 py-2 text-gray-400 hover:text-gray-600 text-sm transition-colors"
                >
                  Plus tard
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
