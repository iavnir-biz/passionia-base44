import React, { useEffect } from 'react';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';
import confetti from 'canvas-confetti';

export default function OnboardingQ12AgeRange() {
  // Déclencher les confetti au chargement (passage à Ton profil)
  useEffect(() => {
    const hasShownConfetti = sessionStorage.getItem('profile_confetti_shown');
    if (!hasShownConfetti) {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 300);
      sessionStorage.setItem('profile_confetti_shown', 'true');
    }
  }, []);

  return (
    <OnboardingQuestionPage
      questionId="ageRange"
      title="Pour mieux te connaître, dans quelle tranche d'âge te situes-tu ?"
      inputType="radio"
      options={[
        "Moins de 25 ans",
        "25-34 ans",
        "35-44 ans",
        "45-54 ans",
        "55 ans et plus"
      ]}
      fieldName="ageRange"
      nextPage="OnboardingQ13Gender"
      prevPage="OnboardingTransition"
      progress={7}
      blockType="profile"
      useLocalStorage={true}
      autoSubmit={true}
      completedSteps={[1]}
    />
  );
}