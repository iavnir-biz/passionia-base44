import React from 'react';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ23Obstacles() {
  return (
    <OnboardingQuestionPage
      questionId="perceivedObstacles"
      title="Qu'est-ce qui, selon toi, t'empêche aujourd'hui de générer des revenus en ligne avec ton savoir-faire ? (plusieurs choix possibles)"
      inputType="checkbox"
      options={[
        "Je ne sais pas quoi vendre exactement ni comment fixer mes prix",
        "Je ne sais pas comment faire la promotion en ligne (contenu, réseaux sociaux, pubs)",
        "Je ne sais pas par où commencer",
        "Je n'ai pas le temps de tout mettre en place",
        "Je ne suis pas à l'aise avec la technique/l'informatique",
        "J'ai peur de me lancer / du regard des autres",
        "Autre"
      ]}
      fieldName="perceivedObstacles"
      nextPage="OnboardingQ24IfNothingChanges"
      prevPage="OnboardingQ22Lifestyle"
      progress={85}
      blockType="objectives"
      useLocalStorage={false}
    />
  );
}