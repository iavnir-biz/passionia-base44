import React from 'react';
import OfferSelectionPage from '@/components/onboarding/OfferSelectionPage';

const offers = [
  {
    badge: "Mini-formation (4 vidéos)",
    title: "Le Guide Express",
    price: "47 €",
    result: "Ton élève obtient son premier résultat concret en moins de 7 jours grâce à un parcours structuré et actionnable."
  },
  {
    badge: "Ebook + Workbook",
    title: "Le Manuel Pratique",
    price: "27 €",
    result: "Ton élève peut avancer à son rythme avec un guide complet qu'il garde à vie et consulte quand il veut."
  }
];

export default function OfferProductPrincipal() {
  return (
    <OfferSelectionPage
      title="Choisis ton Produit Principal"
      subtitle="Sélectionne le format qui te correspond le mieux pour démarrer"
      offers={offers}
      fieldName="product_principal"
      nextPage="OfferPetitExtra"
    />
  );
}