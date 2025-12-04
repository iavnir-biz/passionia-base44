import React from 'react';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ15CurrentIncome() {
  return (
    <OnboardingQuestionPage
      questionId="currentIncome"
      title="Actuellement, quels sont tes revenus mensuels nets environ ?"
      inputType="radio"
      options={[
        "Moins de 1500€",
        "1500€ - 2500€",
        "2500€ - 3500€",
        "3500€ - 4500€",
        "Plus de 4500€"
      ]}
      fieldName="currentIncome"
      nextPage="OnboardingQ16TargetIncome"
      prevPage="OnboardingQ14Family"
      progress={62}
    />
  );
}