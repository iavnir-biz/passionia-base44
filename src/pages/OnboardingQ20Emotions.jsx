import React from 'react';
import OnboardingQuestionPage from '../components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ20Emotions() {
  return (
    <OnboardingQuestionPage
      questionId="q20_emotions"
      title="Imagine que tu aides des dizaines de personnes grâce à ton savoir-faire. Qu'est-ce que ça te ferait ressentir ?"
      inputType="checkbox"
      options={[
        "Fierté d'avoir osé me lancer",
        "Satisfaction d'être utile aux autres",
        "Confiance en moi et en mes capacités",
        "Accomplissement personnel",
        "Liberté d'être enfin aligné(e) avec mes valeurs",
        "Autre"
      ]}
      fieldName="emotions"
      nextPage="OnboardingQ21Relatives"
      prevPage="OnboardingQ19DesiredImpact"
      progress={77}
    />
  );
}