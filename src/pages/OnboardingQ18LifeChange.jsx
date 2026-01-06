import React from 'react';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ18LifeChange() {
  return (
    <OnboardingQuestionPage
      questionId="lifeChangeStory"
      title="Si tu gagnais {{user.targetIncome}} € par mois dans {{user.targetIncomeDelay}} mois… qu'est-ce que ça changerait dans ta vie ? Lâche-toi et autorise-toi à rêver en grand. Fais une liste de tout ce que tu ferais avec cet argent."
      subtitle="Par exemple : voyager au Japon, offrir des cadeaux à mes proches, passer plus de temps en famille, arrêter un travail qui ne me plaît plus, investir dans un projet qui me tient à cœur…"
      placeholder="Ta réponse ici..."
      inputType="textarea"
      fieldName="lifeChangeStory"
      nextPage="OnboardingQ19Impact"
      prevPage="OnboardingQ17TargetDelay"
      progress={50}
      blockType="objectives"
      useLocalStorage={true}
      completedSteps={[1, 2]}
    />
  );
}