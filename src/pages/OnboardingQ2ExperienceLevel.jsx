import React from 'react';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ2ExperienceLevel() {
  return (
    <OnboardingQuestionPage
      questionId="experienceLevel"
      title="Quel est ton niveau d'expérience actuel avec cette compétence ?"
      inputType="radio"
      options={[
        "C'est une passion, je débute",
        "J'ai déjà aidé des amis/proches (gratuitement)",
        "Je suis un professionnel / J'ai déjà eu des clients"
      ]}
      fieldName="experienceLevel"
      nextPage="OnboardingQ3Years"
      prevPage="OnboardingQ1CoreSkill"
      progress={12}
    />
  );
}