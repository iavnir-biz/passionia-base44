import React from 'react';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';

export default function OnboardingQ2ExperienceLevel() {
  return (
    <OnboardingQuestionPage
      questionId="experienceLevel"
      title="Super, tu souhaites enseigner {{user.coreSkill}}. Quel est ton niveau d'expérience actuel ?"
      inputType="radio"
      options={[
        "C'est une passion, je débute",
        "J'ai déjà aidé des amis ou des proches gratuitement",
        "Je suis professionnel, j'ai déjà eu des clients"
      ]}
      fieldName="experienceLevel"
      nextPage="OnboardingQ3Years"
      prevPage="OnboardingQ1CoreSkill"
      progress={12}
    />
  );
}