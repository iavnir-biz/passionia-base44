import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';
import { Loader2 } from 'lucide-react';

export default function OnboardingQ20Emotions() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin" />
      </div>
    );
  }

  const getGenderedOptions = () => {
    const gender = user?.gender;
    
    if (gender === "Femme") {
      return [
        "Fierté d'avoir osé me lancer",
        "Satisfaction d'être utile aux autres",
        "Confiance en moi et en mes capacités",
        "Accomplissement personnel",
        "Liberté d'être enfin alignée avec mes valeurs",
        "Autre"
      ];
    } else if (gender === "Homme") {
      return [
        "Fierté d'avoir osé me lancer",
        "Satisfaction d'être utile aux autres",
        "Confiance en moi et en mes capacités",
        "Accomplissement personnel",
        "Liberté d'être enfin aligné avec mes valeurs",
        "Autre"
      ];
    } else {
      return [
        "Fierté d'avoir osé me lancer",
        "Satisfaction d'être utile aux autres",
        "Confiance en moi et en mes capacités",
        "Accomplissement personnel",
        "Liberté d'être enfin aligné(e) avec mes valeurs",
        "Autre"
      ];
    }
  };

  return (
    <OnboardingQuestionPage
      questionId="emotionalBenefits"
      title="Imagine que tu aides des dizaines de personnes grâce à ton savoir-faire… Qu'est-ce que ça te ferait ressentir ? (plusieurs choix possibles)"
      inputType="checkbox"
      options={getGenderedOptions()}
      fieldName="emotionalBenefits"
      nextPage="OnboardingQ21Relatives"
      prevPage="OnboardingQ19Impact"
      progress={64}
    />
  );
}