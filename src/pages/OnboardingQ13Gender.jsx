import React from 'react';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';
import { User, Users, MessageCircleOff } from 'lucide-react';

export default function OnboardingQ13Gender() {
  return (
    <OnboardingQuestionPage
      questionId="gender"
      title="C'est noté. Peux-tu indiquer ton genre ? (Cela m'aidera à personnaliser les textes pour toi)"
      inputType="radio"
      options={[
        { label: "Homme", icon: User },
        { label: "Femme", icon: Users },
        { label: "Je ne préfère pas le dire", icon: MessageCircleOff }
      ]}
      fieldName="gender"
      nextPage="OnboardingQ14Family"
      prevPage="OnboardingQ12AgeRange"
      progress={14}
      blockType="profile"
      useLocalStorage={true}
      autoSubmit={true}
    />
  );
}