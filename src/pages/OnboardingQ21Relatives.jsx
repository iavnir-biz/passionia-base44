import React from 'react';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ21Relatives() {
  return (
    <OnboardingQuestionPage
      questionId="relativesThoughts"
      title="Quand tes proches verront que tu vis en aidant les autres avec ce que tu sais, qu'est-ce qu'ils penseront ? (plusieurs choix possibles)"
      inputType="checkbox"
      options={[
        '"Il a vraiment réussi"',
        '"Je suis fier de lui"',
        '"Il a eu raison de se lancer"',
        '"Il m\'inspire"',
        '"Il fait quelque chose qui a du sens"',
        "Autre"
      ]}
      fieldName="relativesThoughts"
      nextPage="OnboardingQ22Lifestyle"
      prevPage="OnboardingQ20Emotions"
      progress={85}
    />
  );
}