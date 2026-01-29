import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Sparkles, Shield, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ChooseYourPath() {
  const navigate = useNavigate();
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const pricingOptions = [
    {
      price: 67,
      title: 'Pack Accélérateur',
      items: [
        'Générateur complet',
        'Membre Fondateur',
        'Accès Skool à VIE (valeur 1164€/an)'
      ],
      popular: false,
      tagline: null
    },
    {
      price: 104,
      title: 'Pack Accélérateur + Pack Réseaux Sociaux',
      items: [
        'Générateur complet',
        'Membre Fondateur',
        'Accès Skool à VIE (valeur 1164€/an)',
        '30 jours de contenu réseaux sociaux prêt à poster',
        'Carrousels, réels, designs adaptés à vos offres'
      ],
      popular: true,
      tagline: '💡 Sans ce pack, vous passez 2 semaines à créer vos contenus. Avec, vous postez dès demain.',
      highlighted: true
    },
    {
      price: 497,
      title: 'Pack Premium + 3 Coachings',
      items: [
        'Tout inclus (générateur + réseaux sociaux)',
        'Accès Skool à VIE',
        '3 sessions de 45min d\'accompagnement personnalisé',
        'Audit complet de votre projet',
        'Stratégie de lancement personnalisée',
        'On débloque vos blocages techniques'
      ],
      popular: false,
      tagline: '🚀 L\'option idéale si vous voulez être guidé sans le done-for-you complet.'
    }
  ];

  const handlePayment = async () => {
    if (!selectedPrice) return;

    setIsProcessing(true);
    try {
      // Appeler la fonction de création de checkout avec le prix sélectionné
      const { data } = await base44.functions.invoke('createCheckoutChoice', {
        selectedPrice: selectedPrice
      });

      if (data?.url) {
        window.top.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Erreur lors de la redirection vers le paiement');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Bandeau d'urgence */}
      <div className="bg-gradient-to-r from-[#61f7a2] to-[#4de88f] text-gray-900 py-3.5 px-5 text-center font-bold text-[0.95rem] tracking-wide">
        <span className="inline-block mx-2">🔥</span>
        <span>DERNIÈRES OFFRES — Reste 4 places — Ce soir uniquement, demain les prix augmentent</span>
        <span className="inline-block mx-2">🔥</span>
      </div>

      {/* Header */}
      <div className="py-7 px-5 text-center border-b border-gray-200">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center shadow-lg shadow-[#61f7a2]/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="font-bold text-xl text-gray-900">
            PASSION IA
          </div>
        </div>
      </div>

      {/* Container principal */}
      <div className="max-w-[580px] mx-auto px-5 py-12 pb-16">
        
        <h1 className="text-4xl font-bold text-center mb-3 text-gray-900 leading-tight">
          Choisissez votre chemin
        </h1>
        <p className="text-center text-gray-600 text-lg mb-9">
          Votre avenir dépend de la décision que vous prenez ce soir.
        </p>

        {/* Options de paiement */}
        <div className="flex flex-col gap-4 mb-5">
          {pricingOptions.map((option) => (
            <label
              key={option.price}
              className={`bg-white rounded-2xl p-6 cursor-pointer transition-all ${
                option.highlighted 
                  ? 'border-2 border-[#61f7a2]' 
                  : 'border-2 border-gray-200'
              } ${
                selectedPrice === option.price
                  ? 'bg-gradient-to-br from-[#61f7a2]/8 to-[#61f7a2]/2 shadow-lg shadow-[#61f7a2]/20'
                  : 'hover:border-[#61f7a2] hover:shadow-lg hover:shadow-[#61f7a2]/15 hover:-translate-y-0.5'
              }`}
            >
              <input
                type="radio"
                name="pricing-option"
                value={option.price}
                checked={selectedPrice === option.price}
                onChange={() => setSelectedPrice(option.price)}
                className="hidden"
              />
              
              <div className="flex justify-between items-start relative">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="font-bold text-lg text-gray-900">
                      {option.title}
                    </div>
                    {option.popular && (
                      <span className="bg-[#61f7a2] text-gray-900 text-[0.7rem] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Recommandé
                      </span>
                    )}
                  </div>
                  <ul className="space-y-1.5 mb-3">
                    {option.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700 text-[0.9rem]">
                        <Check className="w-4 h-4 text-[#61f7a2] flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  {option.tagline && (
                    <p className="text-[#1fa85f] text-sm font-semibold italic">
                      {option.tagline}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  <div className="font-bold text-3xl text-gray-900 whitespace-nowrap">
                    {option.price}€
                  </div>
                  
                  {/* Radio indicator */}
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedPrice === option.price
                      ? 'border-[#61f7a2] bg-[#61f7a2]'
                      : 'border-gray-300'
                  }`}>
                    {selectedPrice === option.price && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Bouton de paiement */}
        <button
          onClick={handlePayment}
          disabled={!selectedPrice || isProcessing}
          className="w-full bg-gradient-to-r from-[#61f7a2] to-[#4de88f] hover:from-[#4de88f] hover:to-[#61f7a2] disabled:bg-gray-200 disabled:text-gray-500 text-gray-900 font-bold text-lg py-4 px-8 rounded-xl transition-all uppercase tracking-wide disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#61f7a2]/30 flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Redirection...
            </>
          ) : selectedPrice ? (
            `Valider mon choix — ${selectedPrice}€`
          ) : (
            'Sélectionnez une option'
          )}
        </button>

        <div className="flex items-center justify-center gap-2 mt-4 text-gray-600 text-sm">
          <Shield className="w-4.5 h-4.5 text-[#61f7a2]" />
          <span>Paiement sécurisé — Satisfait ou remboursé 14 jours</span>
        </div>

        {/* Séparateur */}
        <div className="flex items-center my-10 gap-5">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="font-semibold text-gray-500 text-sm uppercase tracking-widest">Ou</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Option Premium : Done for you */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[20px] p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#61f7a2] to-[#4de88f]"></div>
          
          <div className="flex items-center justify-between mb-3">
            <div className="text-4xl">💎</div>
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider animate-pulse">
              2 PLACES UNIQUEMENT
            </span>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-2xl">On le fait pour vous</h3>
            <div className="font-bold text-4xl text-[#2dd673]">4000€</div>
          </div>
          
          <p className="text-gray-400 text-[0.95rem] mb-6 leading-relaxed">
            Vous voulez un business automatique clé en main sans toucher à la technique ? Nous construisons tout à votre place, de A à Z, en 30 jours. Objectif : 1000€/mois minimum dès les 3 premiers mois.
          </p>
          
          <div className="flex flex-wrap gap-2.5 mb-6">
            {[
              'Page de vente',
              'Messages de vente',
              'Emails marketing',
              'Designs réseaux sociaux',
              'Création comptes RS',
              'Produit digital',
              'Communauté',
              'Logiciel paiement',
              'Pixels & tracking'
            ].map((feature) => (
              <span
                key={feature}
                className="bg-white/10 px-3.5 py-2 rounded-lg text-xs text-gray-300"
              >
                {feature}
              </span>
            ))}
          </div>
          
          <button
            onClick={() => navigate(createPageUrl('Booking'))}
            className="w-full bg-transparent border-2 border-[#61f7a2] text-[#61f7a2] hover:bg-[#61f7a2] hover:text-gray-900 font-bold py-4 px-8 rounded-xl transition-all"
          >
            Prendre rendez-vous avec nous →
          </button>
        </div>

        <p className="text-center mt-8 text-gray-600 text-sm">
          Des questions ? Contactez-nous sur{' '}
          <a href="https://www.skool.com/ia-pour-tous-6043/about" target="_blank" rel="noopener noreferrer" className="text-[#61f7a2] underline hover:text-[#4de88f]">
            Skool
          </a>
          {' '}ou par email.
        </p>

      </div>
    </div>
  );
}