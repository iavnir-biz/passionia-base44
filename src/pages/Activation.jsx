import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Target, 
  Package, 
  BarChart3, 
  Sprout, 
  Map, 
  PartyPopper,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Brain
} from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const STEPS = [
  { id: 1, title: 'Tes talents', icon: Sparkles, key: 'talents' },
  { id: 2, title: 'Tes objectifs', icon: Target, key: 'objectifs' },
  { id: 3, title: 'Tes offres', icon: Package, key: 'offres' },
  { id: 4, title: 'Validation de marché', icon: BarChart3, key: 'validation' },
  { id: 5, title: 'Ta vie future', icon: Sprout, key: 'future' },
  { id: 6, title: 'Plan d\'action', icon: Map, key: 'plan' },
  { id: 7, title: 'Bienvenue', icon: PartyPopper, key: 'welcome' }
];

export default function Activation() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stepData, setStepData] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Vérifier paiement
      if (!currentUser.has_paid) {
        navigate(createPageUrl('Dashboard'));
        return;
      }

      // Charger session
      const sessions = await base44.entities.Session.filter({ created_by: currentUser.email });
      if (sessions.length > 0) {
        const sess = sessions[0];
        setSession(sess);
        
        // Déterminer l'étape actuelle basée sur les données
        determineCurrentStep(sess);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const determineCurrentStep = (sess) => {
    if (!sess.onboarding_summary?.who_to_teach) {
      setCurrentStep(1);
    } else if (!sess.onboarding_full?.targetIncome) {
      setCurrentStep(2);
    } else if (!sess.offer_generation) {
      setCurrentStep(3);
    } else if (!sess.market_validation) {
      setCurrentStep(4);
    } else if (!sess.future_vision) {
      setCurrentStep(5);
    } else if (!sess.action_plan) {
      setCurrentStep(6);
    } else {
      setCurrentStep(7);
    }
  };

  const progress = Math.round((completedSteps.length / STEPS.length) * 100);

  const handleNextStep = async () => {
    if (currentStep < STEPS.length) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    } else {
      // Dernière étape -> Dashboard
      navigate(createPageUrl('Dashboard'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex">
      {/* Colonne gauche - Navigation */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 h-screen">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Activation</h1>
              <p className="text-xs text-gray-600">Construis ton projet</p>
            </div>
          </div>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Progression</span>
              <span className="text-lg font-bold text-[#61f7a2]">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#61f7a2] to-[#4de88f]"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Steps */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = completedSteps.includes(step.id);
            const isFuture = step.id > currentStep;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: step.id * 0.1 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#61f7a2]/10 to-[#61f7a2]/5 border border-[#61f7a2]' 
                    : isCompleted
                      ? 'bg-white hover:bg-gray-50'
                      : 'bg-white opacity-50'
                }`}
                onClick={() => !isFuture && setCurrentStep(step.id)}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-[#61f7a2] text-white' 
                    : isActive 
                      ? 'bg-[#61f7a2]/20 text-[#61f7a2]' 
                      : 'bg-gray-100 text-gray-400'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">Étape {step.id}/7</p>
                </div>
              </motion.div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Brain className="w-4 h-4 text-[#61f7a2]" />
            <span>Propulsé par l'IA Passion IA</span>
          </div>
        </div>
      </aside>

      {/* Colonne centrale - Contenu */}
      <main className="flex-1 ml-80 p-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <StepContent 
            key={currentStep}
            step={currentStep}
            user={user}
            session={session}
            onNext={handleNextStep}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
          />
        </AnimatePresence>
      </main>
    </div>
  );
}

function StepContent({ step, user, session, onNext, isGenerating, setIsGenerating }) {
  const [answer, setAnswer] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <StepCard
            icon={Sparkles}
            iconColor="from-[#61f7a2] to-[#4de88f]"
            title="Commençons par tes talents"
            subtitle="En quelques questions, on identifie ce que tu peux réellement transformer en activité rentable."
            noahMessage="Je vais te poser quelques questions pour comprendre ton expertise et ce que tu veux enseigner."
          >
            <div className="space-y-4">
              <p className="text-gray-700">Quelle compétence ou passion aimerais-tu transformer en source de revenus ?</p>
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Ex: Le yoga, la photographie, le développement web..."
                className="min-h-[120px]"
              />
              <GlowButton 
                onClick={onNext} 
                disabled={!answer.trim()}
                className="w-full"
              >
                Continuer
                <ArrowRight className="w-5 h-5 ml-2" />
              </GlowButton>
            </div>
          </StepCard>
        );

      case 2:
        return (
          <StepCard
            icon={Target}
            iconColor="from-blue-500 to-cyan-500"
            title="Quel est ton objectif ?"
            subtitle="Définis clairement ce que tu veux accomplir avec cette activité."
            noahMessage="Comprendre tes objectifs m'aidera à construire un plan d'action sur-mesure pour toi."
          >
            <div className="space-y-4">
              <p className="text-gray-700">Que souhaites-tu accomplir dans les 6 prochains mois ?</p>
              <div className="space-y-2">
                {['Générer mes premiers revenus', 'Quitter mon emploi actuel', 'Vivre de ma passion', 'Avoir plus de liberté', 'Autre'].map((opt) => (
                  <label key={opt} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-[#61f7a2] transition-all cursor-pointer">
                    <Checkbox
                      checked={selectedOptions.includes(opt)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedOptions([...selectedOptions, opt]);
                        } else {
                          setSelectedOptions(selectedOptions.filter(o => o !== opt));
                        }
                      }}
                    />
                    <span className="text-gray-900">{opt}</span>
                  </label>
                ))}
              </div>
              <GlowButton 
                onClick={onNext} 
                disabled={selectedOptions.length === 0}
                className="w-full"
              >
                Continuer
                <ArrowRight className="w-5 h-5 ml-2" />
              </GlowButton>
            </div>
          </StepCard>
        );

      case 3:
        return (
          <StepCard
            icon={Package}
            iconColor="from-purple-500 to-pink-500"
            title="Création de tes offres"
            subtitle="L'IA va générer des offres commerciales adaptées à ton expertise et ton marché."
            noahMessage="Je vais analyser ton profil et créer 3 offres complètes que tu pourras utiliser immédiatement."
          >
            <div className="space-y-4">
              {isGenerating ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 text-[#61f7a2] animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Génération de tes offres en cours...</p>
                  <p className="text-sm text-gray-500 mt-2">Cela peut prendre quelques secondes</p>
                </div>
              ) : (
                <GlowButton 
                  onClick={() => {
                    setIsGenerating(true);
                    setTimeout(() => {
                      setIsGenerating(false);
                      onNext();
                    }, 3000);
                  }}
                  className="w-full"
                >
                  Générer mes offres
                  <Sparkles className="w-5 h-5 ml-2" />
                </GlowButton>
              )}
            </div>
          </StepCard>
        );

      case 7:
        return (
          <StepCard
            icon={PartyPopper}
            iconColor="from-[#61f7a2] to-[#4de88f]"
            title="Félicitations ! Ton projet est prêt 🎉"
            subtitle="Tu as maintenant tous les outils pour démarrer ton activité."
            noahMessage="C'est parti ! Direction le dashboard pour passer à l'action."
          >
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-[#61f7a2]/10 to-[#61f7a2]/5 rounded-2xl p-6 text-center">
                <CheckCircle2 className="w-16 h-16 text-[#61f7a2] mx-auto mb-4" />
                <p className="text-gray-900 font-semibold mb-2">Ton projet est activé !</p>
                <p className="text-gray-600 text-sm">Tout est prêt pour transformer ton expertise en revenus.</p>
              </div>
              <GlowButton 
                onClick={onNext}
                className="w-full"
                size="lg"
              >
                Accéder au Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </GlowButton>
            </div>
          </StepCard>
        );

      default:
        return (
          <StepCard
            icon={Sparkles}
            iconColor="from-[#61f7a2] to-[#4de88f]"
            title="Étape en construction"
            subtitle="Cette étape sera bientôt disponible."
            noahMessage="Continue ton activation !"
          >
            <GlowButton onClick={onNext} className="w-full">
              Suivant
              <ArrowRight className="w-5 h-5 ml-2" />
            </GlowButton>
          </StepCard>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl"
    >
      {renderStep()}
    </motion.div>
  );
}

function StepCard({ icon: Icon, iconColor, title, subtitle, noahMessage, children }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
      {/* Header */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Sparkles className="w-3 h-3" />
        <span>Propulsé par l'IA de Passion IA</span>
      </div>

      {/* Icon */}
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${iconColor} flex items-center justify-center mb-6`}>
        <Icon className="w-8 h-8 text-white" />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
      <p className="text-gray-600 mb-6">{subtitle}</p>

      {/* Noah block */}
      {noahMessage && (
        <div className="bg-gradient-to-r from-[#61f7a2]/10 to-[#61f7a2]/5 border border-[#61f7a2]/20 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900 mb-1">Noah – ton copilote IA</p>
              <p className="text-sm text-gray-700">{noahMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {children}
    </div>
  );
}