import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import OnboardingStep from '@/components/onboarding/OnboardingStep';
import { TextInput, NumberInput, OptionCards } from '@/components/onboarding/QuestionInput';
import LoadingStateAI from '@/components/common/LoadingStateAI';
import { Package, Briefcase, GraduationCap, Users } from "lucide-react";

const projectTypes = [
  { value: 'mini-produit', label: 'Mini-produit digital', description: 'Ebook, template, guide...', icon: Package },
  { value: 'service-ia', label: 'Service IA', description: 'Automatisation, outils IA...', icon: Briefcase },
  { value: 'formation', label: 'Formation en ligne', description: 'Cours, masterclass...', icon: GraduationCap },
  { value: 'accompagnement', label: 'Accompagnement', description: 'Coaching, consulting...', icon: Users },
];

const questions = [
  {
    id: 'passion',
    question: "Quel est ton savoir-faire, ta passion ou ta compétence ?",
    description: "Ce que tu maîtrises et que tu pourrais transmettre ou vendre",
    type: 'text',
    multiline: true,
    placeholder: "Ex: Je suis expert en photographie de portrait..."
  },
  {
    id: 'transformation',
    question: "Quelle transformation sais-tu apporter ?",
    description: "Le résultat concret que tu peux offrir à quelqu'un",
    type: 'text',
    multiline: true,
    placeholder: "Ex: J'aide les gens à prendre de meilleures photos..."
  },
  {
    id: 'target_audience',
    question: "À qui veux-tu t'adresser ?",
    description: "Décris ton client idéal en quelques mots",
    type: 'text',
    multiline: true,
    placeholder: "Ex: Les entrepreneurs qui veulent une image professionnelle..."
  },
  {
    id: 'obstacles',
    question: "Quels sont tes obstacles et forces personnelles ?",
    description: "Ce qui te freine et ce qui te différencie",
    type: 'text',
    multiline: true,
    placeholder: "Ex: Obstacle: manque de temps. Force: créativité..."
  },
  {
    id: 'experience',
    question: "Quelle expérience ou problème as-tu déjà vécu ?",
    description: "Une situation qui t'a forgé et que tu peux partager",
    type: 'text',
    multiline: true,
    placeholder: "Ex: J'ai dû reconstruire ma carrière après..."
  },
  {
    id: 'project_type',
    question: "Qu'aimerais-tu construire ?",
    description: "Choisis le type de produit qui te correspond",
    type: 'options',
    options: projectTypes
  },
  {
    id: 'hours_per_week',
    question: "Combien d'heures par semaine peux-tu consacrer ?",
    description: "Sois réaliste pour un plan adapté",
    type: 'number',
    suffix: 'heures/semaine',
    placeholder: "10"
  },
  {
    id: 'revenue_goal',
    question: "Quel revenu vises-tu comme premier palier ?",
    description: "Ton objectif financier mensuel initial",
    type: 'number',
    suffix: '€/mois',
    placeholder: "1000"
  }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  
  const totalSteps = questions.length;
  const currentQuestion = questions[currentStep - 1];
  
  const canProceed = () => {
    const answer = answers[currentQuestion.id];
    if (!answer) return false;
    if (typeof answer === 'string' && answer.trim() === '') return false;
    return true;
  };
  
  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Generate results
      await generateResults();
    }
  };
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const updateAnswer = (value) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };
  
  const generateResults = async () => {
    setIsGenerating(true);
    
    // Animate loading steps
    const loadingInterval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % 5);
    }, 2000);
    
    try {
      // Save profile data
      const user = await base44.auth.me();
      
      // Check if profile exists
      const existingProfiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      
      const profileData = {
        passion: answers.passion,
        transformation: answers.transformation,
        target_audience: answers.target_audience,
        obstacles: answers.obstacles,
        experience: answers.experience,
        project_type: answers.project_type,
        hours_per_week: parseInt(answers.hours_per_week) || 10,
        revenue_goal: parseInt(answers.revenue_goal) || 1000,
        onboarding_completed: true
      };
      
      if (existingProfiles.length > 0) {
        await base44.entities.UserProfile.update(existingProfiles[0].id, profileData);
      } else {
        await base44.entities.UserProfile.create(profileData);
      }
      
      // Generate AI analysis
      const prompt = `Tu es un expert en business en ligne et en création d'offres. Analyse les réponses suivantes et génère une analyse complète.

PROFIL:
- Passion/Compétence: ${answers.passion}
- Transformation apportée: ${answers.transformation}
- Audience cible: ${answers.target_audience}
- Obstacles et forces: ${answers.obstacles}
- Expérience vécue: ${answers.experience}
- Type de projet: ${answers.project_type}
- Heures disponibles: ${answers.hours_per_week}h/semaine
- Objectif revenu: ${answers.revenue_goal}€/mois

Génère une analyse structurée avec:
1. Validation de marché (le potentiel de cette idée)
2. Avatar client détaillé (profil précis du client idéal)
3. Opportunité prometteuse (la meilleure direction à prendre)
4. Message clé + phrase d'accroche (proposition de valeur claire)
5. Vision future (projection motivante à 6 mois)
6. Première étape stratégique (action quick win à faire maintenant)
7. Offre suggérée (titre et description courte)
8. Prix recommandé
9. 3 objections principales que les clients pourraient avoir
10. 3 arguments de vente clés`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            market_validation: { type: "string" },
            avatar: { type: "string" },
            opportunity: { type: "string" },
            message: { type: "string" },
            catchphrase: { type: "string" },
            future_vision: { type: "string" },
            first_step: { type: "string" },
            offer_title: { type: "string" },
            offer_description: { type: "string" },
            recommended_price: { type: "string" },
            objections: { type: "array", items: { type: "string" } },
            selling_points: { type: "array", items: { type: "string" } }
          }
        }
      });
      
      // Update profile with results
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      if (profiles.length > 0) {
        await base44.entities.UserProfile.update(profiles[0].id, {
          generated_results: result
        });
      }
      
      clearInterval(loadingInterval);
      navigate(createPageUrl('Results'));
      
    } catch (error) {
      console.error('Error generating results:', error);
      clearInterval(loadingInterval);
      setIsGenerating(false);
    }
  };
  
  if (isGenerating) {
    return <LoadingStateAI step={loadingStep} />;
  }
  
  return (
    <OnboardingStep
      step={currentStep}
      totalSteps={totalSteps}
      question={currentQuestion.question}
      description={currentQuestion.description}
      onNext={handleNext}
      onBack={handleBack}
      canProceed={canProceed()}
      isLast={currentStep === totalSteps}
    >
      {currentQuestion.type === 'text' && (
        <TextInput
          value={answers[currentQuestion.id] || ''}
          onChange={updateAnswer}
          placeholder={currentQuestion.placeholder}
          multiline={currentQuestion.multiline}
        />
      )}
      
      {currentQuestion.type === 'number' && (
        <NumberInput
          value={answers[currentQuestion.id] || ''}
          onChange={updateAnswer}
          placeholder={currentQuestion.placeholder}
          suffix={currentQuestion.suffix}
        />
      )}
      
      {currentQuestion.type === 'options' && (
        <OptionCards
          options={currentQuestion.options}
          value={answers[currentQuestion.id]}
          onChange={updateAnswer}
        />
      )}
    </OnboardingStep>
  );
}