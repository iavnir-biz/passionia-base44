import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Loader2, Presentation, GraduationCap } from 'lucide-react';
import OfferBuilderLayout from '@/components/onboarding/OfferBuilderLayout';
import OfferCardNew from '@/components/onboarding/OfferCardNew';

const offers = [
  {
    id: 'atelier',
    badge: "atelier (2 heures)",
    title: "Atelier 'Dessin Intuitif' : Libérez Votre Trait en Direct",
    price: "97€",
    result: "Vous ressentirez une libération créative, en remplaçant la technique rigide par un flow intuitif qui rendra vos dessins vivants et authentiquement vôtres.",
    icon: Presentation
  },
  {
    id: 'formation-complete',
    badge: "formation complète (12 vidéos)",
    title: "La Méthode Fondations : Le Cursus Complet pour Maîtriser les 5 Piliers du Dessin",
    price: "197€",
    result: "Vous posséderez une compréhension solide et durable des fondamentaux du dessin, vous donnant la confiance et la compétence pour aborder n'importe quel sujet.",
    icon: GraduationCap
  }
];

export default function OfferSuperieure() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      if (currentUser.offer?.offre_superieure) {
        setSelectedOffer(currentUser.offer.offre_superieure);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = async (offer) => {
    setSelectedOffer(offer);
    setIsSaving(true);
    
    try {
      const currentOffer = user?.offer || {};
      await base44.auth.updateMe({ 
        offer: { ...currentOffer, offre_superieure: offer }
      });
      setTimeout(() => {
        navigate(createPageUrl('OfferPremium'));
      }, 500);
    } catch (error) {
      console.error('Error saving:', error);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f3f0] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#22c55e] animate-spin" />
      </div>
    );
  }

  return (
    <OfferBuilderLayout currentStep={3}>
      <div className="max-w-3xl mx-auto px-4">
        {/* Step Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-2">
            Étape 3 sur 4 : Choisis ton Offre Supérieure
          </h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">
            Propose une solution plus complète à tes clients les plus motivés, juste après leur achat initial. Choisis l'option qui apporte le plus de valeur.
          </p>
        </div>

        {/* Offer Cards */}
        <div className="grid md:grid-cols-2 gap-5">
          {offers.map((offer) => (
            <OfferCardNew
              key={offer.id}
              offer={offer}
              icon={offer.icon}
              isSelected={selectedOffer?.id === offer.id}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {isSaving && (
          <div className="mt-6 flex items-center justify-center gap-2 text-[#22c55e]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Enregistrement...</span>
          </div>
        )}
      </div>
    </OfferBuilderLayout>
  );
}