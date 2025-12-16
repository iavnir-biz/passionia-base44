import React from 'react';
import OnboardingQuestionPage from '../components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ22Lifestyle() {
  return (
    <OnboardingQuestionPage
      questionId="q22_lifestyle"
      title="Grâce à ces revenus, quel style de vie aimerais-tu avoir ?"
      inputType="checkbox"
      options={[
        "Voyager quand je veux",
        "Passer plus de temps en famille",
        "Quitter mon job actuel",
        "Travailler d'où je veux",
        "Vivre de ce que j'aime vraiment",
        "Autre"
      ]}
      fieldName="lifestyle"
      nextPage="OnboardingQ23Obstacles"
      prevPage="OnboardingQ21Relatives"
      progress={85}
    />
  );
}