import React from 'react';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ4TargetAudience() {
  return (
    <OnboardingQuestionPage
      questionId="targetAudience"
      title="À qui aimerais-tu le plus enseigner cette compétence, {{user.firstName}} ?"
      placeholder="Ta réponse ici..."
      inputType="textarea"
      fieldName="targetAudience"
      nextPage="OnboardingQ5MainProblem"
      prevPage="OnboardingQ3Years"
      progress={19}
    />
  );
}