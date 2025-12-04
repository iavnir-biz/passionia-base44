import React from 'react';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ6FirstResult() {
  return (
    <OnboardingQuestionPage
      questionId="firstQuickResult"
      title="Quel est le tout premier résultat concret et rapide que ton élève obtiendra grâce à ton enseignement de la compétence {{user.coreSkill}}, {{user.firstName}} ?"
      placeholder="Ta réponse ici..."
      inputType="textarea"
      fieldName="firstQuickResult"
      nextPage="OnboardingQ7FinalTransformation"
      prevPage="OnboardingQ5MainProblem"
      progress={27}
    />
  );
}