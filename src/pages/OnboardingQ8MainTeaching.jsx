import React from 'react';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ8MainTeaching() {
  return (
    <OnboardingQuestionPage
      questionId="mainTeaching"
      title="Quelle est LA chose la plus importante que tu vas lui apprendre en {{user.coreSkill}}, {{user.firstName}} ?"
      placeholder="Ta réponse ici..."
      inputType="textarea"
      fieldName="mainTeaching"
      nextPage="OnboardingQ9Method"
      prevPage="OnboardingQ7FinalTransformation"
      progress={35}
    />
  );
}