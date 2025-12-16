import React from 'react';
import OnboardingQuestionPage from '../components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ21Relatives() {
  return (
    <OnboardingQuestionPage
      questionId="q21_relatives"
      title="Quand tes proches verront que tu vis en aidant les autres avec ce que tu sais, qu'est-ce qu'ils penseront ?"
      inputType="checkbox"
      options={[
        "« Il / Elle a vraiment réussi »",
        "« Je suis fier(ère) de lui / elle »",
        "« Il / Elle a eu raison de se lancer »",
        "« Il / Elle m'inspire »",
        "« Il / Elle fait quelque chose qui a du sens »",
        "Autre"
      ]}
      fieldName="relativesThoughts"
      nextPage="OnboardingQ22Lifestyle"
      prevPage="OnboardingQ20Emotions"
      progress={81}
    />
  );
}