import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Loader2, BookOpen, FileText } from 'lucide-react';
import OfferBuilderLayout from '@/components/onboarding/OfferBuilderLayout';
import OfferCardNew from '@/components/onboarding/OfferCardNew';

const offers = [
  {
    badge: "mini-formation (4 vidéos)",
    title: "Le Déclic du Débutant : Votre Kit de Démarrage pour Vaincre la Page Blanche",
    price: "27€",
    result: "Vous ne regarderez plus jamais une page blanche avec anxiété, mais avec l'excitation de savoir exactement par où commencer pour créer quelque chose de personnel.",
    icon: BookOpen
  },
  {
    badge: "ebook (PDF)",
    title: "Le Guide 'Zéro Talent' : 21 Exercices Guidés pour Apprendre à Voir en Artiste",
    price: "17€",
    result: "Vous développerez un 'œil d'artiste' et comprendrez que le dessin n'est pas une question de talent, mais d'observation, une compétence que vous maîtriserez.",
    icon: FileText
  }
];

export default function OfferProductPrincipal() {
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
      if (currentUser.offer?.product_principal) {
        setSelectedOffer(currentUser.offer.product_principal);
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
        offer: { ...currentOffer, product_principal: offer }
      });
      setTimeout(() => navigate(createPageUrl('OfferPetitExtra')), 600);
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
    <OfferBuilderLayout currentStep={1}>
      {/* Main title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          🏗️ Construis ton offre parfaite
        </h1>
        <p className="text-gray-500">
          À chaque étape, choisis UNE offre parmi 2 propositions pour construire ta gamme complète.
        </p>
      </motion.div>

      {/* Step title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-6"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Étape 1 sur 4 : Choisis ton Produit Principal
        </h2>
        <p className="text-gray-500 text-sm max-w-lg mx-auto">
          C'est ton offre d'entrée qui attirera tes premiers clients. Choisis l'option qui te semble la plus pertinente et la plus simple à créer pour commencer.
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