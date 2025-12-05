import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, Users } from 'lucide-react';
import OfferBuilderLayout from '@/components/onboarding/OfferBuilderLayout';
import OfferCardNew from '@/components/onboarding/OfferCardNew';

const offers = [
  {
    badge: "coaching personnalisé (3 mois)",
    title: "Le Programme 'Artiste Émergent' : Votre Accompagnement de 3 Mois pour Développer Votre Style",
    price: "1000€",
    result: "Vous passerez du statut de débutant qui copie à celui d'artiste en herbe avec un style naissant, un portfolio de vos premières œuvres et un plan clair pour continuer à progresser.",
    icon: Sparkles
  },
  {
    badge: "accompagnement",
    title: "Le Mentorat 'Portfolio Premier Pas' : 6 Séances pour Créer Votre Première Série d'Œuvres",
    price: "2000€",
    result: "Vous aurez la fierté d'avoir mené à terme un projet artistique complet, matérialisé par un portfolio qui reflète votre vision et vos compétences nouvellement acquises.",
    icon: Users
  }
];

export default function OfferPremium() {
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
      if (currentUser.offer?.offre_premium) {
        setSelectedOffer(currentUser.offer.offre_premium);
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
        offer: { ...currentOffer, offre_premium: offer }
      });
      setTimeout(() => navigate(createPageUrl('Results')), 600);
    } catch (error) {
      console.error('Error saving:', error);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#22c55e] animate-spin" />
      </div>
    );
  }

  return (
    <OfferBuilderLayout currentStep={4}>
      {/* Step title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Étape 4 sur 4 : Choisis ton Offre Premium
        </h2>
        <p className="text-gray-500 text-sm max-w-lg mx-auto">
          C'est ton offre haut-de-gamme pour un accompagnement d'exception. Choisis l'option qui représente la transformation la plus profonde pour tes clients.
        </p>
      </motion.div>

      {/* Offer cards */}
      <div className="grid md:grid-cols-2 gap-5 mb-20">
        {offers.map((offer, index) => (
          <OfferCardNew
            key={index}
            offer={offer}
            icon={offer.icon}
            isSelected={selectedOffer?.title === offer.title}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {isSaving && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-[#22c55e] animate-spin" />
            <span className="text-gray-700">Enregistrement...</span>
          </div>
        </div>
      )}
    </OfferBuilderLayout>
  );
}