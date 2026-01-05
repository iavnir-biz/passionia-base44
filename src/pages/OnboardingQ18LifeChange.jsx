import React from 'react';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ18LifeChange() {
  return (
    <OnboardingQuestionPage
      questionId="lifeChangeStory"
      title="Si tu gagnais {{user.targetIncome}} € par mois dans {{user.targetIncomeDelay}} mois… qu'est-ce que ça changerait dans ta vie ? Lâche-toi et autorise-toi à rêver en grand. Fais une liste de tout ce que tu ferais avec cet argent."
      placeholder="Ta réponse ici..."
      inputType="textarea"
      fieldName="lifeChangeStory"
      nextPage="OnboardingQ19Impact"
      prevPage="OnboardingQ17TargetDelay"
      progress={50}
    />
  );
}