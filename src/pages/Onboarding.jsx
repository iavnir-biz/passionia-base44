import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import OnboardingStep from '@/components/onboarding/OnboardingStep';
import { TextInput } from '@/components/onboarding/QuestionInput';
import LoadingStateAI from '@/components/common/LoadingStateAI';

// Structure des questions orientée enseignement
const questions = [
  // Étape 1 – Compétence
  {
    id: 'passion',
    question: "Quel est ton savoir-faire, ta passion ou ta compétence ?",
    description: "Ce que tu maîtrises et que tu pourrais transmettre ou vendre sous forme de formation, coaching, programme…",
    placeholder: "Ex: Je suis passionné par l'éducation canine et j'aide les maîtres à mieux comprendre leur chien..."
  },
  // Étape 2 – Client idéal / élève (question 1)
  {
    id: 'target_audience',
    question: "À qui aimerais-tu le plus enseigner cette compétence ?",
    description: "Décris la personne idéale à qui tu veux transmettre ton savoir",
    placeholder: "Ex: Les propriétaires d'un chiot turbulent qui ne savent pas comment l'éduquer, les freelances débutants en design..."
  },
  // Étape 2 – Client idéal / élève (question 2)
  {
    id: 'main_problem',
    question: "Quel est le problème N°1 que cette personne rencontre dans son apprentissage et que tu peux l'aider à résoudre ?",
    description: "Le blocage principal qui l'empêche d'avancer seul(e)",
    placeholder: "Ex: Ils ne savent pas par où commencer, ils sont submergés par trop d'informations contradictoires..."
  },
  // Étape 3 – Résultat rapide (quick win)
  {
    id: 'quick_win',
    question: "Quel est le tout premier résultat concret et rapide que ton élève pourra obtenir grâce à ton enseignement ?",
    description: "Un petit gain visible dès les premiers jours ou semaines",
    placeholder: "Ex: Obtenir que son chiot s'assoie sur commande en 3 jours, créer son premier logo professionnel..."
  },
  // Étape 4 – Transformation finale
  {
    id: 'transformation',
    question: "Et à la fin de ton accompagnement, quel grand changement ou transformation aura-t-il vécu ?",
    description: "Exemple : pour la guitare, \"savoir jouer son morceau préféré au coin du feu\"",
    placeholder: "Ex: Un chien calme et obéissant qui peut l'accompagner partout sans stress..."
  },
  // Étape 5 – Contenu clé
  {
    id: 'key_teaching',
    question: "Quelle est LA chose la plus importante que tu vas lui apprendre en priorité ?",
    description: "Le concept ou la compétence fondamentale que tu transmets",
    placeholder: "Ex: Comprendre le langage corporel du chien pour anticiper ses réactions..."
  },
  // Étape 6 – Approche pédagogique (question 1)
  {
    id: 'unique_method',
    question: "As-tu une méthode ou une façon d'enseigner qui te rend différent des autres ?",
    description: "Tu peux répondre \"je ne sais pas encore\" si ce n'est pas clair pour toi",
    placeholder: "Ex: J'utilise uniquement le renforcement positif et des exercices de 5 minutes max..."
  },
  // Étape 6 – Approche pédagogique (question 2)
  {
    id: 'common_mistake',
    question: "Quelle est l'erreur typique que les débutants font dans ton domaine, et que tu veux absolument leur éviter ?",
    description: "L'erreur que tu vois le plus souvent et qui freine les progrès",
    placeholder: "Ex: Vouloir aller trop vite et brûler les étapes, ce qui crée de la frustration..."
  },
  // Étape 7 – Question de clôture
  {
    id: 'personal_story',
    question: "Pour finir, y a-t-il autre chose que tu aimerais partager ?",
    description: "Une anecdote, une histoire personnelle liée à ta compétence, ou un détail qui te rend unique. Cela m'aidera à créer une offre qui te ressemble vraiment.",
    placeholder: "Ex: J'ai commencé à m'intéresser à l'éducation canine après avoir adopté un chien difficile qui a changé ma vie..."
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
    
    const loadingInterval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % 5);
    }, 2000);
    
    try {
      const user = await base44.auth.me();
      
      const existingProfiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      
      // Sauvegarder toutes les réponses de l'onboarding
      const profileData = {
        passion: answers.passion,
        target_audience: answers.target_audience,
        main_problem: answers.main_problem,
        quick_win: answers.quick_win,
        transformation: answers.transformation,
        key_teaching: answers.key_teaching,
        unique_method: answers.unique_method,
        common_mistake: answers.common_mistake,
        personal_story: answers.personal_story,
        onboarding_completed: true
      };
      
      if (existingProfiles.length > 0) {
        await base44.entities.UserProfile.update(existingProfiles[0].id, profileData);
      } else {
        await base44.entities.UserProfile.create(profileData);
      }
      
      // Génération de l'analyse IA
      const prompt = `Tu es un expert en création de formations et d'offres pédagogiques. Analyse les réponses suivantes et génère une analyse complète pour aider cette personne à lancer son activité d'enseignement.

PROFIL DE L'ENSEIGNANT :
- Compétence/Passion : ${answers.passion}
- Public cible (élèves) : ${answers.target_audience}
- Problème principal de ses élèves : ${answers.main_problem}
- Premier résultat rapide promis : ${answers.quick_win}
- Transformation finale : ${answers.transformation}
- Enseignement clé : ${answers.key_teaching}
- Méthode unique : ${answers.unique_method}
- Erreur à éviter : ${answers.common_mistake}
- Histoire personnelle : ${answers.personal_story}

Génère une analyse structurée avec :
1. Validation de marché (le potentiel de cette idée d'enseignement)
2. Avatar élève détaillé (profil précis de l'élève idéal)
3. Opportunité prometteuse (la meilleure direction à prendre)
4. Message clé + phrase d'accroche (proposition de valeur claire)
5. Vision future (projection motivante à 6 mois)
6. Première étape stratégique (action quick win à faire maintenant)
7. Offre suggérée (titre et description courte de formation/coaching)
8. Prix recommandé
9. 3 objections principales que les élèves pourraient avoir
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
      <TextInput
        value={answers[currentQuestion.id] || ''}
        onChange={updateAnswer}
        placeholder={currentQuestion.placeholder}
        multiline={true}
      />
    </OnboardingStep>
  );
}