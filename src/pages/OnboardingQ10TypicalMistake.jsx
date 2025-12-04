import React from 'react';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ10TypicalMistake() {
  return (
    <OnboardingQuestionPage
      questionId="typicalMistake"
      title="Quelle est l'erreur typique que les débutants font en {{user.coreSkill}} et que tu aides à éviter, {{user.firstName}} ?"
      placeholder="Ta réponse ici..."
      inputType="textarea"
      fieldName="typicalMistake"
      nextPage="OnboardingQ11ExtraDetail"
      prevPage="OnboardingQ9Method"
      progress={42}
    />
  );
}