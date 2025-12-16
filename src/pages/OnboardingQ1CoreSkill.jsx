import React from 'react';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ1CoreSkill() {
  return (
    <OnboardingQuestionPage
      questionId="coreSkill"
      title="Pour commencer, quelle est la compétence, la passion ou le savoir-faire que tu aimerais transformer en revenu et enseigner ?"
      subtitle="Sois précis. Par exemple : peindre des aquarelles, conseiller en décoration intérieure, consulting RH, créer des programmes de fitness à la maison…"
      placeholder="Décris ta compétence..."
      inputType="textarea"
      fieldName="coreSkill"
      nextPage="OnboardingQ2ExperienceLevel"
      prevPage="OnboardingFirstName"
      progress={8}
    />
  );
}