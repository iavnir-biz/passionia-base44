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
      title: 'Pack Accélérateur + Membre Fondateur',
      description: 'Générateur complet + Accès Skool à VIE (valeur 1164€/an)',
      popular: true
    },
    {
      price: 104,
      title: 'Pack Accélérateur + Réseaux Sociaux',
      description: 'Tout le pack + Accès Skool à VIE + 30 jours de contenus RS prêts à poster (carrousels, réels, designs)',
      popular: false
    },
    {
      price: 497,
      title: 'Pack Premium + 3 Coachings',
      description: 'Tout inclus + Accès Skool à VIE + 3 sessions de 45min d\'accompagnement personnalisé pour auditer et faire avancer votre projet',
      popular: false
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
    <div className="min-h-screen bg-gray-50">
      {/* Bandeau d'urgence */}
      <div className="bg-red-600 text-white py-3.5 px-5 text-center font-semibold text-[0.95rem] tracking-wide animate-pulse">
        <span className="inline-block mx-2 animate-bounce">🔥</span>
        <span>DERNIÈRES OFFRES — Reste 4 places — Ce soir uniquement, demain les prix augmentent</span>
        <span className="inline-block mx-2 animate-bounce">🔥</span>
      </div>

      {/* Header */}
      <div className="py-7 px-5 text-center">
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#0f172a"/>
          </svg>
          <div className="font-bold text-lg text-gray-900">
            PASSION IA <span className="font-normal text-gray-600">BY IAVNIR</span>
          </div>
        </div>
      </div>

      {/* Container principal */}
      <div className="max-w-[580px] mx-auto px-5 pb-16">
        
        <h1 className="text-4xl font-bold text-center mb-2.5 text-gray-900 leading-tight">
          Choisissez votre chemin
        </h1>
        <p className="text-center text-gray-600 mb-9">
          Votre avenir dépend de la décision que vous prenez ce soir.
        </p>

        {/* Options de paiement */}
        <div className="flex flex-col gap-4 mb-5">
          {pricingOptions.map((option) => (
            <label
              key={option.price}
              className={`bg-white border-2 rounded-2xl p-6 cursor-pointer transition-all ${
                selectedPrice === option.price
                  ? 'border-[#4ade80] bg-gradient-to-br from-[#4ade80]/8 to-[#4ade80]/2 shadow-lg shadow-[#4ade80]/20'
                  : 'border-gray-200 hover:border-[#4ade80] hover:shadow-lg hover:shadow-[#4ade80]/15 hover:-translate-y-0.5'
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
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="font-bold text-lg text-gray-900">
                      {option.title}
                    </div>
                    {option.popular && (
                      <span className="bg-[#4ade80] text-gray-900 text-[0.7rem] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Populaire
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-[0.9rem] leading-relaxed">
                    {option.description.split('Accès Skool à VIE')[0]}
                    <strong className="text-[#4ade80] font-semibold">
                      Accès Skool à VIE
                    </strong>
                    {option.description.split('Accès Skool à VIE')[1]}
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  <div className="font-bold text-3xl text-gray-900 whitespace-nowrap">
                    {option.price}€
                  </div>
                  
                  {/* Radio indicator */}
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedPrice === option.price
                      ? 'border-[#4ade80] bg-[#4ade80]'
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
          className="w-full bg-[#4ade80] hover:bg-[#86efac] disabled:bg-gray-200 disabled:text-gray-500 text-gray-900 font-bold text-lg py-4 px-8 rounded-xl transition-all uppercase tracking-wide disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#4ade80]/40 flex items-center justify-center gap-2"
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
          <Shield className="w-4.5 h-4.5 text-[#4ade80]" />
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
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4ade80] to-[#86efac]"></div>
          
          <div className="text-4xl mb-3">💎</div>
          
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-2xl">On le fait pour vous</h3>
            <div className="font-bold text-4xl text-[#4ade80]">4000€</div>
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
            className="w-full bg-transparent border-2 border-[#4ade80] text-[#4ade80] hover:bg-[#4ade80] hover:text-gray-900 font-bold py-4 px-8 rounded-xl transition-all"
          >
            Prendre rendez-vous avec nous →
          </button>
        </div>

        <p className="text-center mt-8 text-gray-600 text-sm">
          Des questions ? Contactez-nous sur{' '}
          <a href="https://www.skool.com/ia-pour-tous-6043/about" target="_blank" rel="noopener noreferrer" className="text-[#4ade80] underline">
            Skool
          </a>
          {' '}ou par email.
        </p>

      </div>
    </div>
  );
}