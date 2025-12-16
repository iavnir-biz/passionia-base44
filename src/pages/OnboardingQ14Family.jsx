import React from 'react';
import OnboardingQuestionPage from '../components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ14Family() {
  return (
    <OnboardingQuestionPage
      questionId="q14_family"
      title="Quelle est ta situation familiale actuelle ?"
      inputType="radio"
      options={[
        "Célibataire",
        "Célibataire avec enfant(s)",
        "En couple",
        "En couple avec enfant(s)"
      ]}
      fieldName="familyStatus"
      nextPage="OnboardingQ15Income"
      prevPage="OnboardingQ13Gender"
      progress={54}
    />
  );
}