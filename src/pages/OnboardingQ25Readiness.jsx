import React from 'react';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ25Readiness() {
  return (
    <OnboardingQuestionPage
      questionId="readinessScore"
      title="Sur une échelle de 1 à 10, à quel point es-tu prêt(e) à transformer ton savoir-faire en revenus pour aider les autres ?"
      inputType="slider"
      sliderConfig={{ min: 1, max: 10, step: 1, suffix: ' / 10' }}
      fieldName="readinessScore"
      nextPage="OnboardingQ26DeliveryPreferences"
      prevPage="OnboardingQ24IfNothingChanges"
      progress={100}
    />
  );
}