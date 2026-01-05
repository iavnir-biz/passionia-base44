import React from 'react';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ16TargetIncome() {
  return (
    <OnboardingQuestionPage
      questionId="targetIncome"
      title="Combien aimerais-tu gagner par mois en transmettant ton savoir-faire ?"
      subtitle="Exemples : voyager au Japon, manger dans de bons restaurants, investir, offrir une maison à ma famille."
      inputType="slider"
      sliderConfig={{ min: 500, max: 50000, step: 500, suffix: ' €' }}
      fieldName="targetIncome"
      nextPage="OnboardingQ17TargetDelay"
      prevPage="OnboardingQ15CurrentIncome"
      progress={35}
    />
  );
}