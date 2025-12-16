import React from 'react';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ3Years() {
  return (
    <OnboardingQuestionPage
      questionId="yearsPracticing"
      title="D'accord. Depuis combien d'années pratiques-tu cette compétence ou cette passion ?"
      inputType="slider"
      sliderConfig={{ min: 0, max: 15, step: 1, suffix: ' ans' }}
      fieldName="yearsPracticing"
      nextPage="OnboardingQ4TargetAudience"
      prevPage="OnboardingQ2ExperienceLevel"
      progress={15}
    />
  );
}