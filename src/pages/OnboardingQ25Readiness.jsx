import React from 'react';
import OnboardingQuestionPage from '../components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ25Readiness() {
  return (
    <OnboardingQuestionPage
      questionId="q25_readiness"
      title="Sur une échelle de 1 à 10, à quel point es-tu prêt(e) à transformer ton savoir-faire en revenus pour aider les autres ?"
      inputType="slider"
      sliderConfig={{ min: 1, max: 10, step: 1, suffix: '' }}
      fieldName="readiness"
      nextPage="OnboardingQ26Delivery"
      prevPage="OnboardingQ24Future"
      progress={96}
    />
  );
}