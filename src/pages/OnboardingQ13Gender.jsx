import React from 'react';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ13Gender() {
  return (
    <OnboardingQuestionPage
      questionId="gender"
      title="C'est noté. Peux-tu indiquer ton genre ? (Cela m'aidera à personnaliser les textes pour toi)"
      inputType="radio"
      options={[
        "Homme",
        "Femme",
        "Je ne préfère pas le dire"
      ]}
      fieldName="gender"
      nextPage="OnboardingQ14Family"
      prevPage="OnboardingQ12AgeRange"
      progress={54}
    />
  );
}