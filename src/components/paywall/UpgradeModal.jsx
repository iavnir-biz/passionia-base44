import React from 'react';
import { Crown, X, Check } from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';

export default function UpgradeModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleUpgrade = () => {
    // Redirect to checkout or pricing page
    window.location.href = '/checkout'; // À adapter selon votre système de paiement
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1b1b33] border border-[#2a2a45] rounded-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
            <Crown className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-3">
          Passe à Premium
        </h2>
        <p className="text-gray-400 text-center mb-6">
          Débloque la régénération illimitée et tous les outils avancés
        </p>

        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-3 text-gray-300">
            <div className="w-5 h-5 rounded-full bg-[#61f7a2]/20 flex items-center justify-center">
              <Check className="w-3 h-3 text-[#61f7a2]" />
            </div>
            <span>Régénération illimitée</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <div className="w-5 h-5 rounded-full bg-[#61f7a2]/20 flex items-center justify-center">
              <Check className="w-3 h-3 text-[#61f7a2]" />
            </div>
            <span>Tous les types de contenus débloqués</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <div className="w-5 h-5 rounded-full bg-[#61f7a2]/20 flex items-center justify-center">
              <Check className="w-3 h-3 text-[#61f7a2]" />
            </div>
            <span>Support prioritaire</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <div className="w-5 h-5 rounded-full bg-[#61f7a2]/20 flex items-center justify-center">
              <Check className="w-3 h-3 text-[#61f7a2]" />
            </div>
            <span>Templates et ressources premium</span>
          </div>
        </div>

        <GlowButton
          onClick={handleUpgrade}
          variant="primary"
          className="w-full"
        >
          Passer à Premium
        </GlowButton>
      </div>
    </div>
  );
}