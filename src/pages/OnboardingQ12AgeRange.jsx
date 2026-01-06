import React from 'react';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ12AgeRange() {
  return (
    <OnboardingQuestionPage
      questionId="ageRange"
      title="Pour mieux te connaître, dans quelle tranche d'âge te situes-tu ?"
      inputType="radio"
      options={[
        "Moins de 25 ans",
        "25-34 ans",
        "35-44 ans",
        "45-54 ans",
        "55 ans et plus"
      ]}
      fieldName="ageRange"
      nextPage="OnboardingQ13Gender"
      prevPage="OnboardingTransition"
      progress={7}
      blockType="profile"
      useLocalStorage={true}
    />
  );
}