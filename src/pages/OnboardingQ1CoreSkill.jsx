import React from 'react';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ1CoreSkill() {
  return (
    <OnboardingQuestionPage
      questionId="coreSkill"
      title="Enchanté, {{user.firstName}} ! Quelle est la compétence, la passion ou le savoir-faire que tu aimerais transformer en revenu ?"
      placeholder="Ton savoir-faire..."
      inputType="textarea"
      fieldName="coreSkill"
      nextPage="OnboardingQ2ExperienceLevel"
      prevPage="OnboardingFirstName"
      progress={8}
    />
  );
}