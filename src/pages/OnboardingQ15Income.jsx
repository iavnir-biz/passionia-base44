import React from 'react';
import OnboardingQuestionPage from '../components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ15Income() {
  return (
    <OnboardingQuestionPage
      questionId="q15_income"
      title="Actuellement, quels sont tes revenus mensuels nets environ ?"
      inputType="radio"
      options={[
        "Moins de 1 500 €",
        "1 500 € – 2 500 €",
        "2 500 € – 3 500 €",
        "3 500 € – 4 500 €",
        "Plus de 4 500 €"
      ]}
      fieldName="currentIncome"
      nextPage="OnboardingQ16TargetRevenue"
      prevPage="OnboardingQ14Family"
      progress={58}
    />
  );
}