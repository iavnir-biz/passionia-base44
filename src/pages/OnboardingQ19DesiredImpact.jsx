import React from 'react';
import OnboardingQuestionPage from '../components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ19DesiredImpact() {
  return (
    <OnboardingQuestionPage
      questionId="q19_desired_impact"
      title="Quel impact aimerais-tu avoir en transmettant ce que tu sais ?"
      inputType="checkbox"
      options={[
        "Aider des gens à résoudre un problème concret",
        "Transmettre une passion qui me tient à cœur",
        "Inspirer et motiver les autres",
        "Créer une communauté autour de mon expertise",
        "Laisser une trace, avoir un impact durable",
        "Autre"
      ]}
      fieldName="desiredImpact"
      nextPage="OnboardingQ20Emotions"
      prevPage="OnboardingQ18Impact"
      progress={73}
    />
  );
}