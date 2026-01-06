import React from 'react';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ14Family() {
  return (
    <OnboardingQuestionPage
      questionId="familyStatus"
      title="Quelle est ta situation familiale actuelle ?"
      inputType="radio"
      options={[
        "Célibataire",
        "Célibataire avec enfant(s)",
        "En couple",
        "En couple avec enfant(s)"
      ]}
      fieldName="familyStatus"
      nextPage="OnboardingQ15CurrentIncome"
      prevPage="OnboardingQ13Gender"
      progress={21}
      blockType="profile"
      useLocalStorage={true}
      autoSubmit={false}
      completedSteps={[1]}
    />
  );
}