import React from 'react';
import { base44 } from '@/api/base44Client';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ26DeliveryPreferences() {
  const customHandleSave = async (user, value) => {
    console.log('🔍 Q26 customHandleSave - START', { 
      userEmail: user?.email, 
      hasSessionId: !!user?.sessionId,
      sessionId: user?.sessionId,
      valueLength: value.length 
    });
    
    // Sauvegarder dans localStorage ET dans base44
    localStorage.setItem(`onboarding_deliveryPreferences`, JSON.stringify(value));
    
    // Sauvegarder dans le user authentifié
    const currentUser = await base44.auth.me();
    console.log('🔍 Q26 - CurrentUser loaded:', {
      email: currentUser.email,
      firstName: currentUser.firstName,
      hasSessionId: !!currentUser.sessionId,
      sessionId: currentUser.sessionId
    });
    
    if (!currentUser.sessionId) {
      console.error('❌ Q26 - PAS DE SESSIONID sur le user !');
      alert('Erreur critique : Pas de session trouvée. Redirection vers transition...');
      throw new Error('No sessionId on user');
    }
    
    await base44.auth.updateMe({ deliveryPreferences: value });
    console.log('✅ Q26 - User updated with deliveryPreferences');
    
    // Mettre à jour la session avec toutes les données post-transition
    const sessions = await base44.entities.Session.filter({ id: currentUser.sessionId });
    console.log('🔍 Q26 - Sessions found:', sessions.length);
    
    if (sessions.length === 0) {
      console.error('❌ Q26 - Session non trouvée en DB avec ID:', currentUser.sessionId);
      alert('Erreur : Session non trouvée. Contactez le support.');
      throw new Error('Session not found in DB');
    }
    
    const session = sessions[0];
    console.log('🔍 Q26 - Session data:', {
      id: session.id,
      hasOnboardingHistory: !!session.onboarding_history,
      historyLength: session.onboarding_history?.length || 0,
      hasOnboardingSummary: !!session.onboarding_summary,
      skill: session.skill
    });
    
    // Construire onboarding_full avec toutes les réponses statiques
    const onboardingFull = {
      ageRange: currentUser.ageRange || localStorage.getItem('onboarding_ageRange'),
      gender: currentUser.gender || localStorage.getItem('onboarding_gender'),
      familyStatus: currentUser.familyStatus || localStorage.getItem('onboarding_familyStatus'),
      currentIncome: currentUser.currentIncome || localStorage.getItem('onboarding_currentIncome'),
      targetIncome: currentUser.targetIncome || localStorage.getItem('onboarding_targetIncome'),
      targetIncomeDelay: currentUser.targetIncomeDelay || localStorage.getItem('onboarding_targetIncomeDelay'),
      lifeChangeIfSuccess: currentUser.lifeChangeIfSuccess || localStorage.getItem('onboarding_lifeChangeIfSuccess'),
      impactOnLife: currentUser.impactOnLife || localStorage.getItem('onboarding_impactOnLife'),
      emotionsAboutProject: currentUser.emotionsAboutProject || localStorage.getItem('onboarding_emotionsAboutProject'),
      relativesReaction: currentUser.relativesReaction || localStorage.getItem('onboarding_relativesReaction'),
      lifestyleGoals: currentUser.lifestyleGoals || JSON.parse(localStorage.getItem('onboarding_lifestyleGoals') || '[]'),
      obstacles: currentUser.obstacles || JSON.parse(localStorage.getItem('onboarding_obstacles') || '[]'),
      ifNothingChanges: currentUser.ifNothingChanges || localStorage.getItem('onboarding_ifNothingChanges'),
      readiness: currentUser.readiness || localStorage.getItem('onboarding_readiness'),
      deliveryPreferences: value
    };
    
    console.log('🔍 Q26 - onboarding_full keys:', Object.keys(onboardingFull));
    console.log('🔍 Q26 - onboarding_full filled values:', 
      Object.entries(onboardingFull).filter(([k, v]) => v).map(([k]) => k)
    );
    
    // Mettre à jour summary avec les préférences de formats
    const summary = session.onboarding_summary || {};
    summary.format_preferences = value;
    
    await base44.entities.Session.update(currentUser.sessionId, {
      onboarding_full: onboardingFull,
      onboarding_summary: summary,
      is_onboarding_done: true
    });
    
    console.log('✅ Q26 - Session mise à jour avec onboarding_full complet');
    console.log('➡️ Q26 - Navigation vers OfferGenerationStart');
  };

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
      useLocalStorage={false}
      customHandleSave={customHandleSave}
      prevPage="OnboardingQ25Readiness"
      progress={100}
      buttonText="Générer mon offre sur-mesure"
      completedSteps={[1, 2]}
    />
  );
}