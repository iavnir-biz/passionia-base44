import React from 'react';
import OfferSelectionPage from '@/components/onboarding/OfferSelectionPage';

const offers = [
  {
    badge: "Pack de modèles",
    title: "Les Templates Prêts-à-l'emploi",
    price: "17 €",
    result: "Ton élève gagne du temps avec des modèles qu'il peut personnaliser immédiatement pour ses propres projets."
  },
  {
    badge: "Check-list complète",
    title: "Le Guide Pas-à-Pas",
    price: "9 €",
    result: "Ton élève ne rate aucune étape grâce à une liste de vérification exhaustive qu'il coche au fur et à mesure."
  }
];

export default function OfferPetitExtra() {
  return (
    <OfferSelectionPage
      title="Choisis ton Petit Extra"
      subtitle="Un bonus simple qui apporte une valeur immédiate à tes élèves"
      offers={offers}
      fieldName="petit_extra"
      nextPage="OfferSuperieure"
    />
  );
}