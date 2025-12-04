import React from 'react';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ5MainProblem() {
  return (
    <OnboardingQuestionPage
      questionId="mainProblem"
      title="Quel est le problème N°1 que cette personne rencontre dans son apprentissage de la compétence {{user.coreSkill}} et que tu peux résoudre, {{user.firstName}} ?"
      placeholder="Ta réponse ici..."
      inputType="textarea"
      fieldName="mainProblem"
      nextPage="OnboardingQ6FirstResult"
      prevPage="OnboardingQ4TargetAudience"
      progress={23}
    />
  );
}