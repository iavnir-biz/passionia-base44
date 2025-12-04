import React from 'react';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ11ExtraDetail() {
  return (
    <OnboardingQuestionPage
      questionId="extraDetail"
      title="Pour finir, y a-t-il autre chose que tu aimerais partager, {{user.firstName}} ? Une anecdote, une histoire personnelle liée à ta compétence {{user.coreSkill}}, ou un détail qui te rend unique ? Cela m'aidera à créer une offre qui te ressemble vraiment."
      placeholder="Ta réponse ici..."
      inputType="textarea"
      fieldName="extraDetail"
      nextPage="OnboardingQ12AgeRange"
      prevPage="OnboardingQ10TypicalMistake"
      progress={46}
    />
  );
}