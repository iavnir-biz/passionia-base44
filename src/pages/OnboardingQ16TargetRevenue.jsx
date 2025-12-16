import React from 'react';
import OnboardingQuestionPage from '../components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ16TargetRevenue() {
  return (
    <OnboardingQuestionPage
      questionId="q16_target_revenue"
      title="Combien aimerais-tu gagner par mois en transmettant ton savoir-faire ?"
      inputType="slider"
      sliderConfig={{ min: 500, max: 50000, step: 500, suffix: ' €' }}
      fieldName="targetRevenue"
      nextPage="OnboardingQ17TargetDelay"
      prevPage="OnboardingQ15Income"
      progress={62}
    />
  );
}