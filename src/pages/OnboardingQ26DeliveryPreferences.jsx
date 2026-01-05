import React from 'react';
import { base44 } from '@/api/base44Client';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ26DeliveryPreferences() {
  return (
    <OnboardingQuestionPage
      questionId="deliveryPreferences"
      title="Comment préfères-tu créer et délivrer tes produits ?"
      subtitle="Plusieurs choix sont possibles. Coche toutes les options qui te conviennent. Tes sélections nous aideront à créer une offre qui te correspond parfaitement."
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
      customHandleSave={async (user, value) => {
        // Sauvegarder deliveryPreferences
        await base44.auth.updateMe({ deliveryPreferences: value });
        
        if (user.sessionId) {
          // Récupérer les données localStorage
          const onboardingData = JSON.parse(localStorage.getItem('onboarding_data') || '{"history": [], "summary": {}}');
          const firstName = localStorage.getItem('onboarding_firstName') || '';
          
          // Synchroniser TOUT dans Session
          const sessions = await base44.entities.Session.filter({ id: user.sessionId });
          if (sessions.length > 0) {
            const session = sessions[0];
            
            // Construire onboarding_summary depuis les données localStorage
            const summary = onboardingData.summary || {};
            
            // Construire onboarding_full avec TOUTES les données
            const onboardingFull = session.onboarding_full || {};
            onboardingFull.deliveryPreferences = value;
            onboardingFull.ageRange = user.ageRange;
            onboardingFull.gender = user.gender;
            onboardingFull.familyStatus = user.familyStatus;
            onboardingFull.currentIncome = user.currentIncome;
            onboardingFull.targetIncome = user.targetIncome;
            onboardingFull.targetIncomeDelay = user.targetIncomeDelay;
            onboardingFull.lifeChangeStory = user.lifeChangeStory;
            onboardingFull.impactGoals = user.impactGoals;
            onboardingFull.emotionalBenefits = user.emotionalBenefits;
            onboardingFull.relativesThoughts = user.relativesThoughts;
            onboardingFull.lifestyleGoals = user.lifestyleGoals;
            onboardingFull.perceivedObstacles = user.perceivedObstacles;
            onboardingFull.ifNothingChanges = user.ifNothingChanges;
            onboardingFull.readinessScore = user.readinessScore;
            
            // Mettre à jour la session avec TOUTES les données
            await base44.entities.Session.update(user.sessionId, {
              onboarding_summary: summary,
              onboarding_full: onboardingFull,
              onboarding_history: onboardingData.history || [],
              skill: summary.who_to_teach || session.skill || '',
              format_preferences: value,
              firstName: firstName,
              is_onboarding_done: true
            });
          }
        }
      }}
      prevPage="OnboardingQ25Readiness"
      progress={93}
      buttonText="Générer mon offre sur-mesure"
    />
  );
}