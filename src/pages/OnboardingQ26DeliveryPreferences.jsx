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
      blockType="objectives"
      useLocalStorage={true}
      customHandleSave={async (user, value) => {
        // Sauvegarder dans localStorage
        localStorage.setItem(`onboarding_deliveryPreferences`, JSON.stringify(value));
        
        // Sauvegarder dans le user authentifié
        const currentUser = await base44.auth.me();
        await base44.auth.updateMe({ 
          deliveryPreferences: value,
          onboarding_completed: true
        });
        
        console.log('🎯 Début sauvegarde Q26 - sessionId:', currentUser.sessionId);
        
        // CRITIQUE : Mettre à jour la session avec TOUTES les données
        if (!currentUser.sessionId) {
          console.error('❌ PAS DE SESSION ID sur le user !');
          alert('Erreur: Session non trouvée. Merci de recommencer.');
          return;
        }
        
        const sessions = await base44.entities.Session.filter({ id: currentUser.sessionId });
        if (sessions.length === 0) {
          console.error('❌ Session introuvable:', currentUser.sessionId);
          alert('Erreur: Session introuvable. Merci de recommencer.');
          return;
        }
        
        const session = sessions[0];
        console.log('📦 Session actuelle:', {
          id: session.id,
          hasHistory: !!session.onboarding_history,
          hasSummary: !!session.onboarding_summary,
          historyLength: session.onboarding_history?.length || 0
        });
        
        // Construire onboarding_full avec TOUTES les réponses statiques
        const onboardingFull = {
          // Questions statiques du profil
          ageRange: localStorage.getItem('onboarding_ageRange') || currentUser.ageRange || '',
          gender: localStorage.getItem('onboarding_gender') || currentUser.gender || '',
          familyStatus: localStorage.getItem('onboarding_familyStatus') || currentUser.familyStatus || '',
          currentIncome: localStorage.getItem('onboarding_currentIncome') || currentUser.currentIncome || '',
          
          // Questions statiques des objectifs
          targetIncome: localStorage.getItem('onboarding_targetIncome') || currentUser.targetIncome || '',
          targetIncomeDelay: localStorage.getItem('onboarding_targetIncomeDelay') || currentUser.targetIncomeDelay || '',
          lifeChangeIfSuccess: localStorage.getItem('onboarding_lifeChangeIfSuccess') || currentUser.lifeChangeIfSuccess || '',
          impactOnLife: localStorage.getItem('onboarding_impactOnLife') || currentUser.impactOnLife || '',
          emotionsAboutProject: localStorage.getItem('onboarding_emotionsAboutProject') || currentUser.emotionsAboutProject || '',
          relativesReaction: localStorage.getItem('onboarding_relativesReaction') || currentUser.relativesReaction || '',
          
          // Tableaux
          lifestyleGoals: JSON.parse(localStorage.getItem('onboarding_lifestyleGoals') || '[]'),
          obstacles: JSON.parse(localStorage.getItem('onboarding_obstacles') || '[]'),
          
          // Dernières questions
          ifNothingChanges: localStorage.getItem('onboarding_ifNothingChanges') || currentUser.ifNothingChanges || '',
          readiness: localStorage.getItem('onboarding_readiness') || currentUser.readiness || '',
          deliveryPreferences: value
        };
        
        console.log('💾 onboarding_full construit:', onboardingFull);
        
        // Mettre à jour summary avec les préférences de formats
        const summary = { ...session.onboarding_summary };
        summary.format_preferences = value;
        
        // MISE À JOUR COMPLÈTE de la session
        await base44.entities.Session.update(currentUser.sessionId, {
          onboarding_full: onboardingFull,
          onboarding_summary: summary,
          is_onboarding_done: true
        });
        
        console.log('✅ Session mise à jour avec onboarding_full complet et is_onboarding_done=true');
      }}
      prevPage="OnboardingQ25Readiness"
      progress={100}
      buttonText="Générer mon offre sur-mesure"
    />
  );
}