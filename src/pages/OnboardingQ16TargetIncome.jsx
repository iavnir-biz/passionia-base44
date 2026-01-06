import React, { useEffect } from 'react';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';
import confetti from 'canvas-confetti';

export default function OnboardingQ16TargetIncome() {
  // Déclencher les confetti au chargement (passage à Tes objectifs)
  useEffect(() => {
    const hasShownConfetti = sessionStorage.getItem('objectives_confetti_shown');
    if (!hasShownConfetti) {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 300);
      sessionStorage.setItem('objectives_confetti_shown', 'true');
    }
  }, []);

  return (
    <OnboardingQuestionPage
      questionId="targetIncome"
      title="Combien aimerais-tu gagner par mois en transmettant ton savoir-faire ?"
      subtitle="Pense à un montant qui changerait vraiment ta vie. Ose viser grand, c'est le moment de rêver !"
      inputType="slider"
      sliderConfig={{ min: 500, max: 50000, step: 500, suffix: ' €' }}
      fieldName="targetIncome"
      nextPage="OnboardingQ17TargetDelay"
      prevPage="OnboardingQ15CurrentIncome"
      progress={35}
      blockType="objectives"
      useLocalStorage={true}
    />
  );
}