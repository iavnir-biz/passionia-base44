import React from 'react';
import { base44 } from '@/api/base44Client';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ26DeliveryPreferences() {
  return (
    <OnboardingQuestionPage
      questionId="deliveryPreferences"
      title="Comment préfères-tu créer et délivrer tes produits ?"
      subtitle="Plusieurs choix sont possibles. Coche toutes les options qui te conviennent."
      isLastQuestion={false}
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
        const currentUser = await base44.auth.me();
        
        const resolvedSessionId = localStorage.getItem('passionia_active_session_id') || currentUser.sessionId;
        if (!resolvedSessionId) {
          console.error('❌ [Q26] Pas de sessionId');
          alert('Session introuvable. Merci de recommencer.');
          return;
        }

        const sessions = await base44.entities.Session.filter({ id: resolvedSessionId });
        if (sessions.length === 0) {
          console.error('❌ [Q26] Session introuvable');
          alert('Session introuvable. Merci de recommencer.');
          return;
        }
        
        const session = sessions[0];
        
        console.log('📦 [Q26] Session avant merge:', {
          sessionId: session.id,
          historyLength: session.onboarding_history?.length || 0,
          fullKeys: Object.keys(session.onboarding_full || {})
        });
        
        // 🔥 MERGE UNIQUEMENT deliveryPreferences (pas de rebuild)
        const onboardingFull = { ...session.onboarding_full };
        onboardingFull.deliveryPreferences = value;
        
        const summary = { ...session.onboarding_summary };
        summary.format_preferences = value;
        
        await base44.entities.Session.update(resolvedSessionId, {
          onboarding_full: onboardingFull,
          onboarding_summary: summary,
          is_onboarding_done: true
        });
        
        console.log('✅ [Q26] Session updated (merge only):', {
          sessionId: resolvedSessionId,
          deliveryPreferences: value,
          fullKeys: Object.keys(onboardingFull)
        });
        
        // Update User onboarding_completed
        try {
          await base44.auth.updateMe({ onboarding_completed: true });
        } catch (e) {
          console.warn('⚠️ [Q26] updateMe failed:', e);
        }
        
        // Save deliveryPreferences in localStorage
        localStorage.setItem('onboarding_deliveryPreferences', JSON.stringify(value));
        console.log('✅ [Q26] Done');
      }}
      prevPage="OnboardingQ25Readiness"
      progress={100}
      buttonText="Générer mon offre sur-mesure"
      completedSteps={[1, 2]}
    />
  );
}