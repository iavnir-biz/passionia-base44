import React from 'react';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ9Method() {
  return (
    <OnboardingQuestionPage
      questionId="uniqueMethod"
      title="As-tu une méthode ou une façon d'enseigner la compétence {{user.coreSkill}} qui te rend différent des autres, {{user.firstName}} ?"
      subtitle="Tu peux répondre « Je ne sais pas encore » si ce n'est pas clair pour toi."
      placeholder="Ta réponse ici..."
      inputType="textarea"
      fieldName="uniqueMethod"
      nextPage="OnboardingQ10TypicalMistake"
      prevPage="OnboardingQ8MainTeaching"
      progress={38}
    />
  );
}