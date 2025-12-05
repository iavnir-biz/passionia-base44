import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Loader2, Layers, CheckSquare } from 'lucide-react';
import OfferBuilderLayout from '@/components/onboarding/OfferBuilderLayout';
import OfferCardNew from '@/components/onboarding/OfferCardNew';

const offers = [
  {
    id: 'modeles',
    badge: "modèles",
    title: "La Boîte à Outils Anti-Panne : 50 Modèles & Structures pour Pratiquer Sans Pression",
    price: "17€",
    result: "Vous aurez toujours une base solide pour démarrer un dessin, transformant le manque d'inspiration en une session de pratique productive et amusante.",
    icon: Layers
  },
  {
    id: 'checklist',
    badge: "check-list",
    title: "La Checklist du Matériel Essentiel : Le Guide pour Choisir Vos Outils sans Vous Ruiner",
    price: "14€",
    result: "Vous ferez des choix éclairés et économiques, en ayant le matériel parfait pour commencer sans gaspiller d'argent dans des outils inutiles ou intimidants.",
    icon: CheckSquare
  }
];

export default function OfferPetitExtra() {
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
      if (currentUser.offer?.petit_extra) {
        setSelectedOffer(currentUser.offer.petit_extra);
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
        offer: { ...currentOffer, petit_extra: offer }
      });
      setTimeout(() => {
        navigate(createPageUrl('OfferSuperieure'));
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
    <OfferBuilderLayout currentStep={2}>
      <div className="max-w-3xl mx-auto px-4">
        {/* Step Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-2">
            Étape 2 sur 4 : Choisis ton Petit Extra
          </h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">
            Il s'agit d'une petite offre complémentaire irrésistible, proposée juste avant le paiement. Sélectionne celle qui complète le mieux ton produit principal.
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