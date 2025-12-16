import React from 'react';
import OnboardingQuestionPage from '../components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ24Future() {
  return (
    <OnboardingQuestionPage
      questionId="q24_future"
      title="Si tu ne fais rien, où seras-tu dans 6 mois ?"
      inputType="radio"
      options={[
        "Exactement au même point, avec les mêmes frustrations",
        "Un peu découragé(e) de ne pas avoir essayé",
        "En train de chercher une autre idée sans être passé(e) à l'action",
        "J'aurai probablement oublié cette idée"
      ]}
      fieldName="futureProjection"
      nextPage="OnboardingQ25Readiness"
      prevPage="OnboardingQ23Obstacles"
      progress={92}
    />
  );
}