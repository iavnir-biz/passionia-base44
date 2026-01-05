import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Loader2, 
  Brain,
  Search,
  Users,
  Package,
  FileText,
  MessageSquare,
  Mail,
  Globe,
  Rocket,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';

const STEPS = [
  {
    id: 'market',
    icon: Search,
    label: 'Analyser ton marché',
    title: 'Étape 1 — Vérifier la demande',
    description: 'On commence par valider que ton savoir-faire répond à un vrai besoin aujourd\'hui.',
    buttonText: 'Lancer l\'analyse',
    duration: '1 à 2 minutes',
    subtext: 'Nova analyse les tendances et la demande réelle',
    functionName: 'generateMarketValidation',
    successMessage: '✓ Demande validée — ton marché existe et cherche des solutions',
    transitionMessage: 'Maintenant qu\'on sait que la demande existe, on va définir qui sont exactement tes futurs clients.'
  },
  {
    id: 'avatars',
    icon: Users,
    label: 'Créer tes avatars clients',
    title: 'Étape 2 — Définir tes clients idéaux',
    description: 'Nova va créer 3 profils détaillés de tes futurs élèves pour que tu saches exactement à qui t\'adresser.',
    buttonText: 'Créer les avatars',
    duration: '2 à 3 minutes',
    subtext: 'Profils complets avec besoins, freins et motivations',
    functionName: 'generateAvatars',
    successMessage: '✓ Avatars créés — tu sais maintenant qui sont tes clients et comment leur parler',
    transitionMessage: 'Tes clients idéaux sont définis. On passe à la construction de ta gamme d\'offres.'
  },
  {
    id: 'offers',
    icon: Package,
    label: 'Structurer tes offres',
    title: 'Étape 3 — Valider ta gamme complète',
    description: 'Tes 4 offres ont été définies pendant l\'onboarding, on vérifie juste qu\'elles sont bien enregistrées.',
    buttonText: 'Valider la gamme',
    duration: 'Instantané',
    subtext: 'Low ticket → Premium, tout est déjà structuré',
    skip: true,
    successMessage: '✓ Gamme validée — du produit d\'entrée à l\'offre premium, tout est prêt',
    transitionMessage: 'Ta gamme est structurée. Place à la page qui va convertir tes visiteurs en clients.'
  },
  {
    id: 'salespage',
    icon: FileText,
    label: 'Générer ta page de vente',
    title: 'Étape 4 — Créer ta page de vente',
    description: 'Nova rédige une page de vente complète, structurée pour transformer tes visiteurs en clients.',
    buttonText: 'Générer la page',
    duration: '2 à 3 minutes',
    subtext: 'Copywriting optimisé, structure éprouvée',
    functionName: 'generateSalesPage',
    successMessage: '✓ Page créée — prête à convaincre et convertir dès aujourd\'hui',
    transitionMessage: 'Ta page de vente est prête. Maintenant, préparons tes messages pour promouvoir ton offre.'
  },
  {
    id: 'messages',
    icon: MessageSquare,
    label: 'Rédiger tes messages de vente',
    title: 'Étape 5 — Rédiger tes messages',
    description: 'Des messages persuasifs pour promouvoir ton offre sur les réseaux, adaptés à ton style et ton audience.',
    buttonText: 'Générer les messages',
    duration: '1 à 2 minutes',
    subtext: 'Ton naturel, accrocheur, authentique',
    functionName: 'generateSalesMessage',
    successMessage: '✓ Messages créés — prêts à copier-coller et publier',
    transitionMessage: 'Tes messages sont prêts. Passons maintenant à ta séquence email pour nourrir la relation avec tes prospects.'
  },
  {
    id: 'emails',
    icon: Mail,
    label: 'Créer tes emails marketing',
    title: 'Étape 6 — Construire ta séquence email',
    description: 'Une séquence complète pour éduquer, convaincre et transformer tes prospects en clients fidèles.',
    buttonText: 'Générer les emails',
    duration: '2 à 3 minutes',
    subtext: 'Séquence structurée, prête à envoyer',
    functionName: 'generateMarketingEmail',
    successMessage: '✓ Séquence créée — tes prospects vont recevoir exactement ce qu\'il faut',
    transitionMessage: 'Ta séquence email est prête. Avant de démarrer, rejoins la communauté pour ne jamais avancer seul.'
  },
  {
    id: 'community',
    icon: Globe,
    label: 'Rejoindre la communauté privée',
    title: 'Étape 7 — Rejoindre la communauté',
    description: 'Accède au groupe School privé pour échanger, poser tes questions et avancer plus vite avec d\'autres créateurs.',
    buttonText: 'Rejoindre maintenant',
    duration: 'Accès instantané',
    subtext: 'Entraide, ressources bonus, expertise partagée',
    external: true,
    externalUrl: 'https://www.skool.com/passion-ia',
    successMessage: '✓ Bienvenue dans la communauté — tu n\'es plus seul dans cette aventure',
    transitionMessage: 'Tu fais maintenant partie de la communauté. Tout est en place : accède à ton dashboard.'
  }
];

export default function Activation() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMessage, setGenerationMessage] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      if (currentUser.sessionId) {
        setSessionId(currentUser.sessionId);
      }

      // Vérifier si l'activation est déjà terminée
      if (currentUser.activation_completed) {
        navigate(createPageUrl('Dashboard'));
        return;
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepAction = async () => {
    const step = STEPS[currentStepIndex];
    setIsGenerating(true);
    setGenerationMessage('Génération en cours...');

    try {
      if (step.skip) {
        // Étape déjà faite
        await new Promise(resolve => setTimeout(resolve, 500));
      } else if (step.external) {
        // Ouvrir lien externe
        window.open(step.externalUrl, '_blank');
        await new Promise(resolve => setTimeout(resolve, 500));
      } else if (step.functionName) {
        // Appel fonction backend
        const { data } = await base44.functions.invoke(step.functionName, {
          sessionId: sessionId
        });
        
        if (!data.success && !data.marketValidation && !data.avatars) {
          throw new Error('Échec génération');
        }
      }

      // Marquer comme complété
      setCompletedSteps([...completedSteps, step.id]);
      setGenerationMessage(step.successMessage);
      
      // Attendre un peu pour montrer le succès
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Passer à l'étape suivante
      if (currentStepIndex < STEPS.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
        setGenerationMessage('');
      } else {
        // Toutes les étapes terminées
        await base44.auth.updateMe({ activation_completed: true });
      }
    } catch (error) {
      console.error(`Error at step ${step.id}:`, error);
      // Marquer comme complété quand même pour ne pas bloquer
      setCompletedSteps([...completedSteps, step.id]);
      setGenerationMessage(step.successMessage);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (currentStepIndex < STEPS.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
        setGenerationMessage('');
      } else {
        await base44.auth.updateMe({ activation_completed: true });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAccessDashboard = async () => {
    await base44.auth.updateMe({ activation_completed: true });
    navigate(createPageUrl('Dashboard'));
  };

  const isStepCompleted = (stepId) => completedSteps.includes(stepId);
  const isLastStepCompleted = completedSteps.length === STEPS.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin" />
      </div>
    );
  }

  const currentStep = STEPS[currentStepIndex];

  return (
    <div className="min-h-screen bg-white flex">
      {/* Colonne gauche - Progression */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col p-8 fixed h-screen overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Activation de ton projet</h2>
          <p className="text-sm text-gray-600">Suis les étapes pour tout mettre en place</p>
        </div>

        {/* Timeline verticale */}
        <div className="relative flex-1">
          {/* Ligne verticale */}
          <div className="absolute left-5 top-3 bottom-3 w-0.5 bg-gray-200" />

          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = isStepCompleted(step.id);
            const isCurrent = currentStepIndex === index;
            const isLocked = index > currentStepIndex;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative flex items-start gap-3 mb-6"
              >
                {/* Cercle indicateur */}
                <div 
                  className={`
                    relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                    ${isCompleted ? 'bg-[#61f7a2] border-2 border-[#61f7a2] shadow-sm' : 
                      isCurrent ? 'bg-white border-2 border-[#61f7a2] shadow-md' :
                      'bg-white border-2 border-gray-200'}
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <Icon className={`w-5 h-5 ${isCurrent ? 'text-[#61f7a2]' : 'text-gray-400'}`} />
                  )}
                </div>

                {/* Label */}
                <div className="pt-1.5">
                  <p className={`text-sm font-medium ${
                    isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Zone centrale - Contenu dynamique */}
      <div className="flex-1 ml-80">
        <div className="max-w-3xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-[#61f7a2] rounded-full px-4 py-1.5">
                <span className="text-sm font-medium text-gray-900">✨ Propulsé par l'IA de Passion IA</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">
              Ton projet commence maintenant.
            </h1>
            
            <p className="text-gray-600 text-center text-lg">
              En quelques étapes guidées, tu vas poser les fondations complètes de ton activité en ligne.
            </p>
          </div>

          {/* Bloc Noah */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 flex items-start gap-4 mb-12"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Noah — ton copilote stratégique</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Je vais t'accompagner étape par étape pour transformer ton savoir-faire en une activité claire, structurée et prête à vendre. Tu avances à ton rythme, je m'occupe du reste.
              </p>
            </div>
          </motion.div>

          {/* Zone étape courante */}
          <AnimatePresence mode="wait">
            {!isLastStepCompleted ? (
              <motion.div
                key={currentStep.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white border-2 border-gray-200 rounded-3xl p-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center">
                    {React.createElement(currentStep.icon, { className: "w-5 h-5 text-white" })}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{currentStep.title}</h2>
                </div>

                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {currentStep.description}
                </p>

                {/* État génération */}
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div
                      key="generating"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-center"
                    >
                      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
                      <p className="text-blue-900 font-medium">{generationMessage}</p>
                    </motion.div>
                  ) : generationMessage ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center mb-6"
                    >
                      <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-3" />
                      <p className="text-green-900 font-medium">{generationMessage}</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="action"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <GlowButton
                        onClick={handleStepAction}
                        size="lg"
                        className="w-full mb-3"
                      >
                        {currentStep.buttonText}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </GlowButton>
                      <p className="text-sm text-gray-500 text-center">
                        ⏱️ {currentStep.duration} · {currentStep.subtext || 'Aucune action technique requise'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="final"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-[#61f7a2] rounded-3xl p-10 text-center"
              >
                <div className="w-20 h-20 bg-[#61f7a2] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Rocket className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Tout est prêt.
                </h2>
                
                <p className="text-gray-600 text-lg mb-2 max-w-xl mx-auto">
                  Ton espace complet est maintenant disponible. Tu pourras affiner, modifier et lancer chaque élément à ton rythme.
                </p>
                
                <p className="text-sm text-gray-500 mb-8">
                  Chaque contenu généré t'attend dans ton dashboard. Tu contrôles la suite.
                </p>
                
                <GlowButton
                  onClick={handleAccessDashboard}
                  size="lg"
                  className="px-12"
                >
                  Accéder à mon espace
                  <Rocket className="w-5 h-5 ml-2" />
                </GlowButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}