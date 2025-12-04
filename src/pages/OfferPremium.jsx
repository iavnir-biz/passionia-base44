import React from 'react';
import OfferSelectionPage from '@/components/onboarding/OfferSelectionPage';

const offers = [
  {
    badge: "Coaching 3 mois",
    title: "L'Accompagnement Personnalisé",
    price: "997 €",
    result: "Ton élève bénéficie de ton expertise en 1-on-1 pendant 3 mois avec des sessions régulières et un suivi personnalisé."
  },
  {
    badge: "Mentorat 6 séances",
    title: "Le Mentorat Stratégique",
    price: "597 €",
    result: "Ton élève avance rapidement grâce à 6 sessions de mentorat ciblées sur ses problématiques spécifiques."
  }
];

export default function OfferPremium() {
  return (
    <OfferSelectionPage
      title="Choisis ton Offre Premium"
      subtitle="Ton offre haut de gamme pour un accompagnement personnalisé"
      offers={offers}
      fieldName="offre_premium"
      nextPage="Results"
    />
  );
}