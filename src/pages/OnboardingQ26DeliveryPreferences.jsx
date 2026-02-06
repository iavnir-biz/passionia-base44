import React from 'react';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ26DeliveryPreferences() {
  return (
    <OnboardingQuestionPage
      questionId="deliveryPreferences"
      title="Comment préfères-tu créer et délivrer tes produits ?"
      subtitle="Plusieurs choix sont possibles. Coche toutes les options qui te conviennent."
      isLastQuestion={true}
      inputType="checkbox"
      options={[
        "Enregistrer des vidéos (partage d'écran, sans montrer ma tête)",
        "Enregistrer des vidéos de cours (face caméra)",
        "Créer des PDFs / Google Docs",
        "Animer des lives en groupe",
        "Animer des sessions 1-on-1 en visio",
        "Organiser des événements en présentiel (pour le high-ticket)"
      ]}
      fieldName="deliveryPreferences"
      nextPage="OfferGenerationStart"
      blockType="objectives"
      useLocalStorage={true}
      prevPage="OnboardingQ25Readiness"
      progress={100}
      buttonText="Générer mon offre sur-mesure"
      completedSteps={[1, 2]}
    />
  );
}
