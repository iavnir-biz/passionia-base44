import React from 'react';
import OnboardingQuestionPage from '../components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ13Gender() {
  return (
    <OnboardingQuestionPage
      questionId="q13_gender"
      title="C'est noté. Peux-tu indiquer ton genre ?"
      subtitle="Cela m'aidera à personnaliser certains textes pour toi."
      inputType="radio"
      options={[
        "Homme",
        "Femme",
        "Je ne préfère pas le dire"
      ]}
      fieldName="gender"
      nextPage="OnboardingQ14Family"
      prevPage="OnboardingQ12Age"
      progress={50}
    />
  );
}