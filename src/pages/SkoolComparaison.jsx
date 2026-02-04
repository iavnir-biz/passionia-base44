import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Check, X, Gem, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function SkoolComparaison() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(null);

  const handleCheckout = async (plan) => {
    setIsProcessing(plan);
    try {
      // TODO: Implémenter le checkout Stripe pour Skool
      toast.info('Redirection vers le paiement...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.error('Checkout non configuré');
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Erreur lors de la redirection vers le paiement');
    } finally {
      setIsProcessing(null);
    }
  };

  const featuresCommunes = [
    { label: 'Générateur ∞', standard: true, premium: true },
    { label: '2 lives/semaine', standard: true, premium: true },
    { label: 'Formation complète', standard: true, premium: true },
    { label: 'Communauté 24/7', standard: true, premium: true },
    { label: 'Bibliothèque Templates', standard: true, premium: true },
  ];

  const featuresExclusives = [
    { label: '30min coaching individuel/mois (197$/mois)', standard: false, premium: true },
    { label: '1 Live Premium exclusif/mois', standard: false, premium: true },
    { label: 'Groupe WhatsApp VIP', standard: false, premium: true },
    { label: 'Cerveau collectif & mastermind', standard: false, premium: true },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Badge Chemin 2 */}
      <div className="absolute top-4 right-4">
        <span className="bg-[#FFD700] text-[#1A1A1A] text-xs font-bold px-3 py-1.5 rounded-full">
          CHEMIN 2
        </span>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        {/* Retour */}
        <button
          onClick={() => navigate(createPageUrl('SkoolAbonnement'))}
          className="flex items-center gap-2 text-gray-600 hover:text-[#1A1A1A] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        {/* Titre */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] text-center mb-12">
          STANDARD vs PREMIUM — LEQUEL CHOISIR ?
        </h1>

        {/* Tableau comparatif */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Header du tableau */}
          <div className="grid grid-cols-2">
            {/* Standard Header */}
            <div className="p-6 border-r border-b border-gray-200">
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-1">STANDARD</h2>
              <p className="text-3xl font-extrabold text-[#00D9A3]">37$/mois</p>
            </div>
            
            {/* Premium Header */}
            <div className="p-6 border-b border-gray-200 bg-[#F3E8FF]">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-[#1A1A1A]">PREMIUM</h2>
                <span className="bg-[#7C3AED] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  RECOMMANDÉ
                </span>
              </div>
              <p className="text-3xl font-extrabold text-[#7C3AED]">370$/an</p>
              <p className="text-sm text-gray-600">(30.83$/mois)</p>
            </div>
          </div>

          {/* Features communes */}
          {featuresCommunes.map((feature, index) => (
            <div key={index} className="grid grid-cols-2">
              <div className="p-4 border-r border-b border-gray-100 flex items-center gap-3">
                <Check className="w-5 h-5 text-[#00D9A3] flex-shrink-0" />
                <span className="text-gray-700">{feature.label}</span>
              </div>
              <div className="p-4 border-b border-gray-100 bg-[#F3E8FF]/30 flex items-center gap-3">
                <Check className="w-5 h-5 text-[#00D9A3] flex-shrink-0" />
                <span className="text-gray-700">{feature.label}</span>
              </div>
            </div>
          ))}

          {/* Séparateur visuel */}
          <div className="grid grid-cols-2">
            <div className="p-2 border-r border-gray-200 bg-gray-50" />
            <div className="p-2 bg-[#F3E8FF]/50" />
          </div>

          {/* Features exclusives Premium */}
          {featuresExclusives.map((feature, index) => (
            <div key={index} className="grid grid-cols-2">
              <div className="p-4 border-r border-b border-gray-100 flex items-center gap-3">
                <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-gray-400">{feature.label.split('(')[0]}</span>
              </div>
              <div className="p-4 border-b border-gray-100 bg-[#F3E8FF]/30 flex items-center gap-3">
                <Check className="w-5 h-5 text-[#00D9A3] flex-shrink-0" />
                <span className="text-gray-700">{feature.label}</span>
              </div>
            </div>
          ))}

          {/* Footer du tableau - Totaux */}
          <div className="grid grid-cols-2">
            <div className="p-6 border-r border-gray-200 bg-gray-50">
              <p className="text-gray-600 mb-1">Coût annuel:</p>
              <p className="text-2xl font-bold text-[#1A1A1A]">444$/an</p>
            </div>
            <div className="p-6 bg-[#F3E8FF]">
              <p className="text-gray-600 mb-1">Coût annuel:</p>
              <p className="text-2xl font-bold text-[#7C3AED]">370$/an</p>
              <p className="text-sm text-gray-600">+ 2364$ de bonus inclus</p>
              <div className="flex items-center gap-2 mt-3">
                <Gem className="w-5 h-5 text-[#7C3AED]" />
                <span className="text-[#7C3AED] font-bold">ÉCONOMIE: 74$/an</span>
              </div>
            </div>
          </div>
        </div>

        {/* Insight */}
        <div className="bg-[#FFF3E0] rounded-2xl p-6 mt-8 text-center border border-[#FF9800]/30">
          <p className="text-[#1A1A1A] text-lg">
            💡 <strong>Si vous restez plus de 3 mois</strong> → Premium est plus rentable
          </p>
        </div>

        {/* Boutons CTA */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <button
            onClick={() => handleCheckout('standard')}
            disabled={isProcessing}
            className="bg-[#00D9A3] hover:bg-[#00C494] text-white font-bold py-4 px-6 rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isProcessing === 'standard' ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Redirection...
              </span>
            ) : (
              <>
                <span className="block text-lg">Choisir Standard</span>
                <span className="block text-sm opacity-80">37$/mois</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleCheckout('premium')}
            disabled={isProcessing}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold py-4 px-6 rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isProcessing === 'premium' ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Redirection...
              </span>
            ) : (
              <>
                <span className="block text-lg">Choisir Premium</span>
                <span className="block text-sm opacity-80">370$/an — Économisez 74$</span>
              </>
            )}
          </button>
        </div>

        <p className="text-gray-500 text-sm text-center mt-4">
          Accès immédiat après paiement
        </p>
      </div>
    </div>
  );
}