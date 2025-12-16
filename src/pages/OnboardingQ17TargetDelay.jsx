import React from 'react';
import OnboardingQuestionPage from '../components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ17TargetDelay() {
  return (
    <OnboardingQuestionPage
      questionId="q17_target_delay"
      title="D'ici combien de mois aimerais-tu atteindre ce revenu ?"
      inputType="slider"
      sliderConfig={{ min: 1, max: 12, step: 1, suffix: ' mois' }}
      fieldName="targetDelay"
      nextPage="OnboardingQ18Impact"
      prevPage="OnboardingQ16TargetRevenue"
      progress={65}
    />
  );
}