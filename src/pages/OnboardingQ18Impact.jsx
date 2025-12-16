import React from 'react';
import OnboardingQuestionPage from '../components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ18Impact() {
  return (
    <OnboardingQuestionPage
      questionId="q18_impact"
      title="Si tu gagnais {{user.targetRevenue}} € par mois dans {{user.targetDelay}} mois, qu'est-ce que ça changerait dans ta vie ?"
      subtitle="Sois très précis(e). Lâche-toi, autorise-toi à rêver grand. Raconte en détail ce que tu ferais avec cet argent, fais une liste si tu veux. Ex : voyager au Japon, manger dans de bons restaurants, investir dans l'immobilier, offrir une maison à ma famille…"
      inputType="textarea"
      placeholder="Décris précisément ce que ça changerait dans ta vie..."
      fieldName="lifeImpact"
      nextPage="OnboardingQ19DesiredImpact"
      prevPage="OnboardingQ17TargetDelay"
      progress={69}
    />
  );
}