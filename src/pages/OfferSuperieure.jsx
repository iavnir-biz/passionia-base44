import React from 'react';
import OfferSelectionPage from '@/components/onboarding/OfferSelectionPage';

const offers = [
  {
    badge: "Atelier live (2h)",
    title: "L'Atelier Intensif",
    price: "97 €",
    result: "Ton élève repart avec un plan d'action personnalisé après 2h de travail guidé en direct avec toi."
  },
  {
    badge: "Formation complète (8 modules)",
    title: "Le Programme Complet",
    price: "197 €",
    result: "Ton élève maîtrise ta méthode de A à Z avec un accès illimité à tous les modules et ressources."
  }
];

export default function OfferSuperieure() {
  return (
    <OfferSelectionPage
      title="Choisis ton Offre Supérieure"
      subtitle="Une offre plus complète pour ceux qui veulent aller plus loin"
      offers={offers}
      fieldName="offre_superieure"
      nextPage="OfferPremium"
    />
  );
}