import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import OnboardingQuestionPage from '@/components/onboarding/OnboardingQuestionPage';
import { Loader2 } from 'lucide-react';

export default function OnboardingQ21Relatives() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const gender = localStorage.getItem('onboarding_gender');
      const firstName = localStorage.getItem('onboarding_firstName');
      setUser({ gender, firstName });
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
        '"Elle a vraiment réussi"',
        '"Je suis fière d\'elle"',
        '"Elle a eu raison de se lancer"',
        '"Elle m\'inspire"',
        '"Elle fait quelque chose qui a du sens"',
        "Autre"
      ];
    } else if (gender === "Homme") {
      return [
        '"Il a vraiment réussi"',
        '"Je suis fier de lui"',
        '"Il a eu raison de se lancer"',
        '"Il m\'inspire"',
        '"Il fait quelque chose qui a du sens"',
        "Autre"
      ];
    } else {
      return [
        '"Il/Elle a vraiment réussi"',
        '"Je suis fier/fière de lui/elle"',
        '"Il/Elle a eu raison de se lancer"',
        '"Il/Elle m\'inspire"',
        '"Il/Elle fait quelque chose qui a du sens"',
        "Autre"
      ];
    }
  };

  return (
    <OnboardingQuestionPage
      questionId="relativesThoughts"
      title="Quand tes proches verront que tu vis en aidant les autres avec ce que tu sais… qu'est-ce qu'ils penseront ? (plusieurs choix possibles)"
      inputType="checkbox"
      options={getGenderedOptions()}
      fieldName="relativesThoughts"
      nextPage="OnboardingQ22Lifestyle"
      prevPage="OnboardingQ20Emotions"
      progress={71}
      blockType="objectives"
      useLocalStorage={true}
      completedSteps={[1, 2]}
    />
  );
}