import React from 'react';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ7FinalTransformation() {
  return (
    <OnboardingQuestionPage
      questionId="finalTransformation"
      title="Et à la fin, quel grand changement ou transformation aura-t-il vécu grâce à ton enseignement de la compétence {{user.coreSkill}}, {{user.firstName}} ?"
      placeholder="Ta réponse ici..."
      inputType="textarea"
      fieldName="finalTransformation"
      nextPage="OnboardingQ8MainTeaching"
      prevPage="OnboardingQ6FirstResult"
      progress={31}
    />
  );
}