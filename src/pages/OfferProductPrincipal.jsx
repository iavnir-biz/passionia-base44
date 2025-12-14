import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Loader2, Video, FileText } from 'lucide-react';
import OfferBuilderLayout from '@/components/onboarding/OfferBuilderLayout';
import OfferCardNew from '@/components/onboarding/OfferCardNew';

const offers = [
{
  id: 'mini-formation',
  badge: "mini-formation (4 vidéos)",
  title: "Le Déclic du Dessinateur : Votre Kit de Démarrage pour Vaincre la Page Blanche",
  price: "27€",
  result: "Vous ne regarderez plus jamais une page blanche avec anxiété, mais avec l'excitation de savoir exactement par où commencer pour créer quelque chose de personnel.",
  icon: Video
},
{
  id: 'ebook',
  badge: "ebook (PDF)",
  title: "Le Guide 'Zéro Talent' : 21 Exercices Guidés pour Apprendre à Voir en Artiste",
  price: "17€",
  result: "Vous développerez un 'œil d'artiste' et comprendrez que le dessin n'est pas une question de talent, mais d'observation, une compétence que vous maîtriserez.",
  icon: FileText
}];


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
      setTimeout(() => {
        navigate(createPageUrl('OfferPetitExtra'));
      }, 500);
    } catch (error) {
      console.error('Error saving:', error);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#11112b] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin" />
      </div>);

  }

  return (
    <OfferBuilderLayout currentStep={1}>
      <div className="max-w-3xl mx-auto px-4">
        {/* Main Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-3">
            🏗️ Construis ton offre parfaite
          </h1>
          <p className="text-gray-700">À chaque étape, choisis UNE offre parmi 2 propositions pour construire ta gamme complète.

          </p>
        </div>

        {/* Step Title */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-[#61f7a2] mb-2">
            Étape 1 sur 4 : Choisis ton Produit Principal
          </h2>
          <p className="text-gray-700 mx-auto text-sm max-w-lg">C'est ton offre d'entrée. Choisis l'option la plus simple pour commencer.

          </p>
        </div>

        {/* Offer Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {offers.map((offer) =>
          <OfferCardNew
            key={offer.id}
            offer={offer}
            icon={offer.icon}
            isSelected={selectedOffer?.id === offer.id}
            onSelect={handleSelect} />

          )}
        </div>

        {isSaving &&
        <div className="mt-6 flex items-center justify-center gap-2 text-[#61f7a2]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Enregistrement...</span>
          </div>
        }
      </div>
    </OfferBuilderLayout>);

}