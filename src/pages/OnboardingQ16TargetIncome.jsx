import React from 'react';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ16TargetIncome() {
  return (
    <OnboardingQuestionPage
      questionId="targetIncome"
      title="Combien aimerais-tu gagner par mois en transmettant ton savoir-faire ?"
      subtitle="Pense à un montant qui changerait vraiment ta vie. Ose viser grand, c'est le moment de rêver !"
      inputType="slider"
      sliderConfig={{ min: 500, max: 50000, step: 500, suffix: ' €' }}
      fieldName="targetIncome"
      nextPage="OnboardingQ17TargetDelay"
      prevPage="OnboardingQ15CurrentIncome"
      progress={35}
    />
  );
}