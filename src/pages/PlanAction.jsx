import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import PayFallModal from '@/components/paywall/PayFallModal';
import ActionOfTheDayCard from '@/components/dashboard/ActionOfTheDayCard';
import ProgressBar from '@/components/ui/ProgressBar';
import { 
  Loader2, 
  ArrowRight,
  CheckCircle,
  Zap,
  TrendingUp,
  Video,
  FileText,
  Users,
  Gift,
  Shield,
  Clock,
  Sparkles,
  Target,
  Mail,
  Check,
  X,
  Package,
  Crown,
  Award,
  Heart,
  Lightbulb,
  Calendar,
  MessageSquare,
  BarChart,
  Trophy,
  RefreshCw
} from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import { cn } from "@/lib/utils";
import ChatBubble from '@/components/chat/ChatBubble';

const mainSteps = [
  { id: 1, label: "Ton Offre", page: "OfferResume" },
  { id: 2, label: "Bonne nouvelle !", page: "BonneNouvelle" },
  { id: 3, label: "Ta Vie Future", page: "OfferTaVieFuture" },
  { id: 4, label: "Concrètement ?", page: "OfferConcretement" },
  { id: 5, label: "Plan d'Action", page: "PlanAction" },
];

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}

// Composant Actions du jour intégré
function DailyActionsContent({ user }) {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const today = new Date().toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  useEffect(() => {
    if (user) {
      loadActions();
    }
  }, [user]);

  const loadActions = async () => {
    try {
      const steps = await base44.entities.PlanStep.filter({ created_by: user.email });
      const completed = steps.filter(s => s.is_completed).length;
      setProgress(steps.length > 0 ? Math.round((completed / steps.length) * 100) : 0);
      
      const todayDate = new Date().toISOString().split('T')[0];
      const todayActions = await base44.entities.DailyAction.filter({ 
        created_by: user.email,
        date: todayDate 
      });
      
      setActions(todayActions.sort((a, b) => (b.priority || 1) - (a.priority || 1)));
    } catch (error) {
      console.error('Error loading actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAction = async (actionId) => {
    const action = actions.find(a => a.id === actionId);
    if (!action) return;
    
    await base44.entities.DailyAction.update(actionId, {
      is_completed: !action.is_completed
    });
    
    setActions(actions.map(a => 
      a.id === actionId ? { ...a, is_completed: !a.is_completed } : a
    ));
  };

  const regenerateActions = async () => {
    setGenerating(true);
    
    try {
      for (const action of actions) {
        await base44.entities.DailyAction.delete(action.id);
      }
      
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      const profile = profiles[0];
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Tu es Nova, coach d'affaires. Génère 3 actions quotidiennes concrètes pour quelqu'un qui:
- Compétence: ${profile?.passion || 'un savoir-faire'}
- Cible: ${profile?.target_audience || 'des apprenants'}

Actions: concrètes, réalisables en 30 min max, progressives, orientées validation/ventes.
Réponds en JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" }
                }
              }
            }
          }
        }
      });
      
      const todayDate = new Date().toISOString().split('T')[0];
      const newActions = [];
      
      for (let i = 0; i < result.actions.length; i++) {
        const action = result.actions[i];
        const created = await base44.entities.DailyAction.create({
          title: action.title,
          description: action.description,
          date: todayDate,
          priority: 3 - i,
          is_completed: false
        });
        newActions.push(created);
      }
      
      setActions(newActions.sort((a, b) => (b.priority || 1) - (a.priority || 1)));
    } catch (error) {
      console.error('Error regenerating actions:', error);
    } finally {
      setGenerating(false);
    }
  };

  const calculateDailyProgress = () => {
    if (actions.length === 0) return 0;
    const completed = actions.filter(a => a.is_completed).length;
    return Math.round((completed / actions.length) * 100);
  };

  const allCompleted = actions.length > 0 && actions.every(a => a.is_completed);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border p-8 ${
          allCompleted 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
            : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              allCompleted ? 'bg-[#61f7a2]' : 'bg-[#61f7a2]/10'
            }`}>
              {allCompleted ? (
                <Trophy className="w-7 h-7 text-white" />
              ) : (
                <Calendar className="w-7 h-7 text-[#61f7a2]" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {allCompleted ? 'Bravo ! Journée complétée ! 🎉' : 'Tes actions du jour'}
              </h2>
              <p className="text-gray-600">
                {allCompleted 
                  ? 'Tu as accompli toutes tes actions. Reviens demain !'
                  : `${actions.filter(a => a.is_completed).length} sur ${actions.length} actions complétées`
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right mr-4">
              <p className="text-4xl font-bold text-[#61f7a2]">{calculateDailyProgress()}%</p>
              <p className="text-gray-600 text-sm">aujourd'hui</p>
            </div>
            
            <GlowButton
              variant="secondary"
              onClick={regenerateActions}
              loading={generating}
              icon={RefreshCw}
            >
              Régénérer
            </GlowButton>
          </div>
        </div>
        
        <ProgressBar value={calculateDailyProgress()} max={100} size="lg" />
      </motion.div>
      
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin" />
          </div>
        ) : actions.length > 0 ? (
          actions.map((action, index) => (
            <ActionOfTheDayCard
              key={action.id}
              action={action}
              onToggle={toggleAction}
              index={index}
            />
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-2xl bg-gray-100 mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-4">Aucune action pour aujourd'hui</p>
            <GlowButton onClick={regenerateActions} loading={generating}>
              Générer mes actions
            </GlowButton>
          </motion.div>
        )}
      </div>
      
      {!allCompleted && actions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center"
        >
          <p className="text-gray-700">
            💡 <span className="font-medium">Conseil :</span> Commence par l'action la plus importante. 
            Les petites victoires quotidiennes construisent les grands succès.
          </p>
        </motion.div>
      )}
    </div>
  );
}

export default function PlanAction() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [content, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPayFallOpen, setIsPayFallOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('plan');

  useEffect(() => {
    loadUser();
    
    // Vérifier si retour de paiement réussi
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      // Recharger les données utilisateur pour vérifier has_purchased
      setTimeout(() => {
        window.location.href = createPageUrl('Dashboard');
      }, 2000);
    }
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (currentUser.sessionId) {
        const sessions = await base44.entities.Session.filter({ id: currentUser.sessionId });
        if (sessions.length > 0) {
          const userSession = sessions[0];
          setSession(userSession);

          if (userSession.plan_action_content) {
            setContent(userSession.plan_action_content);
          } else {
            await generateContent(currentUser.sessionId);
          }
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateContent = async (sessionId) => {
    setIsGenerating(true);
    try {
      const { data } = await base44.functions.invoke('generatePlanActionContent', { sessionId });
      if (data.success) {
        setContent(data.content);
      }
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStepClick = (step) => {
    if (step.page) {
      navigate(createPageUrl(step.page));
    }
  };

  const handleAccessDashboard = () => {
    setIsPayFallOpen(true);
  };

  const handleCheckout = async () => {
    try {
      const { data } = await base44.functions.invoke('createCheckout', {});
      
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout failed:', data);
        const errorMessage = data.message || data.error || 'Erreur lors de la création du paiement.';
        
        // Si déjà acheté, rediriger vers Dashboard
        if (data.error === 'Already purchased') {
          alert('Vous avez déjà acheté ce pack ! Redirection vers votre Dashboard...');
          setTimeout(() => {
            navigate(createPageUrl('Dashboard'));
          }, 1000);
        } else {
          alert(errorMessage + ' Veuillez réessayer.');
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Erreur lors de la création du paiement.';
      alert(errorMsg);
    }
  };

  if (isLoading || isGenerating) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin mb-4" />
        <p className="text-gray-600">{isGenerating ? 'Nova personnalise ton pack...' : 'Chargement...'}</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Impossible de charger le contenu</p>
          <GlowButton onClick={() => window.location.reload()}>
            Réessayer
          </GlowButton>
        </div>
      </div>
    );
  }

  const offer = user?.offer || {};
  const products = [
    { 
      key: 'product_principal', 
      label: 'Produit Principal', 
      data: offer.product_principal, 
      multiplier: 30,
      icon: Package,
      color: 'blue'
    },
    { 
      key: 'petit_extra', 
      label: 'Order Bump', 
      data: offer.petit_extra, 
      multiplier: 15,
      icon: Gift,
      color: 'green'
    },
    { 
      key: 'offre_superieure', 
      label: 'Upsell', 
      data: offer.offre_superieure, 
      multiplier: 9,
      icon: Award,
      color: 'purple'
    },
    { 
      key: 'offre_premium', 
      label: 'Premium', 
      data: offer.offre_premium, 
      multiplier: 1,
      icon: Crown,
      color: 'gold'
    }
  ];

  const revenues = products.map(p => ({
    ...p,
    price: parsePrice(p.data?.price),
    total: parsePrice(p.data?.price) * p.multiplier
  }));

  const totalMonthly = revenues.reduce((sum, r) => sum + r.total, 0);

  const colorSchemes = {
    blue: {
      bg: 'from-blue-50 to-blue-100',
      border: 'border-blue-200',
      text: 'text-blue-600',
      iconBg: 'bg-blue-100',
    },
    green: {
      bg: 'from-green-50 to-green-100',
      border: 'border-green-200',
      text: 'text-green-600',
      iconBg: 'bg-green-100',
    },
    purple: {
      bg: 'from-purple-50 to-purple-100',
      border: 'border-purple-200',
      text: 'text-purple-600',
      iconBg: 'bg-purple-100',
    },
    gold: {
      bg: 'from-yellow-50 to-amber-100',
      border: 'border-yellow-200',
      text: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Navigation Bar */}
      <div className="bg-white border-b border-gray-200 py-4 shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-center gap-1 md:gap-2 flex-wrap">
            {mainSteps.map((step, index) => {
              const isActive = step.id === 5;
              const isPrevious = step.id < 5;
              const isClickable = isPrevious;

              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => isClickable && step.page && navigate(createPageUrl(step.page))}
                    disabled={!isClickable}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap",
                      isActive && "bg-[#61f7a2] text-white shadow-sm",
                      isPrevious && "text-[#61f7a2] hover:text-[#4de88f] cursor-pointer",
                      !isActive && !isPrevious && "text-gray-400 cursor-not-allowed opacity-50"
                    )}>
                    {step.id}. {step.label}
                  </button>
                  {index < mainSteps.length - 1 && (
                    <div className={cn(
                      "w-4 md:w-8 h-[2px]",
                      step.id < 5 ? "bg-[#61f7a2]" : "bg-gray-200"
                    )} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* Tabs navigation */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('plan')}
            className={cn(
              "px-6 py-3 font-medium transition-all relative",
              activeTab === 'plan'
                ? "text-[#61f7a2]"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            Plan d'action
            {activeTab === 'plan' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#61f7a2]"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={cn(
              "px-6 py-3 font-medium transition-all relative",
              activeTab === 'actions'
                ? "text-[#61f7a2]"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            Actions du jour
            {activeTab === 'actions' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#61f7a2]"
              />
            )}
          </button>
        </div>

        {activeTab === 'actions' ? (
          <DailyActionsContent user={user} />
        ) : (
          <div>
        
          {/* 1️⃣ HERO SECTION - Vision & Clarté */}
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight"
            >
              Tu sais maintenant 
              <span className="text-[#61f7a2]"> QUOI vendre</span> et
              <span className="text-[#61f7a2]"> À QUEL PRIX</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 text-xl mb-4"
            >
              Maintenant, on va mettre tout ça en place ensemble
            </motion.p>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-700 text-base max-w-2xl mx-auto"
            >
              {content.heroSubtext}
            </motion.p>
          </div>

          {/* Carte principale glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200 p-8 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ton offre complète</h2>
            
            {/* 4 offres en grille compacte */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {products.map((product, index) => {
                const Icon = product.icon;
                const scheme = colorSchemes[product.color];
                
                return (
                  <motion.div
                    key={product.key}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className={cn(
                      "bg-gradient-to-br rounded-2xl border p-4",
                      scheme.bg,
                      scheme.border
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", scheme.iconBg)}>
                        <Icon className={cn("w-5 h-5", scheme.text)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={cn("text-xs font-semibold uppercase tracking-wide", scheme.text)}>
                          {product.label}
                        </span>
                        <h3 className="text-gray-900 font-semibold text-sm mt-1 truncate">
                          {product.data?.title || '—'}
                        </h3>
                        <span className={cn("text-lg font-bold mt-1 block", scheme.text)}>
                          {product.data?.price || '—'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Projection revenus */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-[#61f7a2]/10 to-blue-50 rounded-2xl border border-[#61f7a2]/30 p-6 text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-[#61f7a2]" />
                <span className="text-gray-600 font-medium">Ton potentiel de revenus mensuels</span>
              </div>
              <span className="text-4xl font-bold text-[#61f7a2]">
                {totalMonthly.toLocaleString('fr-FR')} €
              </span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* 2️⃣ SECTION "ON S'EST MIS À TA PLACE" */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            On s'est mis à ta place
          </h2>
          
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl border border-gray-200 p-8">
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: Heart, text: content.objections[0] },
                { icon: Lightbulb, text: content.objections[1] },
                { icon: Target, text: content.objections[2] },
                { icon: Shield, text: content.objections[3] }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + idx * 0.05 }}
                  className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-gray-700 italic">"{item.text}"</p>
                </motion.div>
              ))}
            </div>
            <p className="text-center text-[#61f7a2] font-semibold text-lg mt-6">
              {content.objectionConclusion}
            </p>
          </div>
        </motion.div>

        {/* 3️⃣ SECTION COMPARATIVE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mb-16"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {/* Sans le pack */}
            <div className="bg-white rounded-3xl border border-red-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                  <X className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Sans ce pack</h3>
              </div>
              <ul className="space-y-3">
                {content.withoutPack.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-600">
                    <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Avec le pack */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl border border-green-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#61f7a2] flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Avec ce pack</h3>
              </div>
              <ul className="space-y-3">
                {content.withPack.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-700 font-medium">
                    <Check className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* 4️⃣ SECTION "LE PLAN EN 4 SEMAINES" */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Le plan en 4 semaines
            </h2>
            <p className="text-gray-600 text-lg">
              Tout est déjà pensé. Tu n'as qu'à suivre.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                week: 1,
                icon: Zap,
                title: content.weeklyPlan[0].title,
                description: content.weeklyPlan[0].description,
                color: "blue"
              },
              {
                week: 2,
                icon: Gift,
                title: content.weeklyPlan[1].title,
                description: content.weeklyPlan[1].description,
                color: "green"
              },
              {
                week: 3,
                icon: Award,
                title: content.weeklyPlan[2].title,
                description: content.weeklyPlan[2].description,
                color: "purple"
              },
              {
                week: 4,
                icon: Crown,
                title: content.weeklyPlan[3].title,
                description: content.weeklyPlan[3].description,
                color: "gold"
              }
            ].map((week, index) => {
              const Icon = week.icon;
              const scheme = colorSchemes[week.color];
              
              return (
                <motion.div
                  key={week.week}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                  className={cn(
                    "bg-gradient-to-br rounded-2xl border p-6 hover:shadow-lg transition-all",
                    scheme.bg,
                    scheme.border
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-2xl font-bold text-gray-900">{week.week}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={cn("w-5 h-5", scheme.text)} />
                        <h3 className="text-lg font-bold text-gray-900">Semaine {week.week}</h3>
                      </div>
                      <p className="text-gray-900 font-semibold mb-1">{week.title}</p>
                      <p className="text-gray-600 text-sm">{week.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* 5️⃣ SECTION "CE QUI EST DÉJÀ PRÊT POUR TOI" */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Ce qui est déjà prêt pour toi
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: FileText,
                title: content.readyFeatures[0].title,
                description: content.readyFeatures[0].description
              },
              {
                icon: Video,
                title: content.readyFeatures[1].title,
                description: content.readyFeatures[1].description
              },
              {
                icon: Mail,
                title: content.readyFeatures[2].title,
                description: content.readyFeatures[2].description
              },
              {
                icon: MessageSquare,
                title: content.readyFeatures[3].title,
                description: content.readyFeatures[3].description
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.6 + idx * 0.05 }}
                  className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* 6️⃣ SECTION BONUS COMMUNAUTÉ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="mb-16"
        >
          <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 rounded-3xl border-2 border-yellow-300 p-8 shadow-lg relative overflow-hidden">
            <div className="absolute top-6 right-6">
              <span className="px-6 py-3 bg-yellow-500 text-white text-lg font-bold rounded-full uppercase shadow-lg">
                🎁 Bonus
              </span>
            </div>
            
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-yellow-400 flex items-center justify-center flex-shrink-0 shadow-md">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Accès communauté Skool
                </h3>
                <p className="text-gray-700 text-lg">
                  Un espace pour échanger, poser tes questions et ne jamais être seul(e)
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {[
                "Poses tes questions 24/7",
                "Échanges entre membres",
                "1 live par semaine",
                "Jamais seul(e) dans ton parcours"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-xl p-3">
                  <Check className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <span className="text-gray-800 font-medium">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4">
              <span className="text-2xl text-gray-500 line-through">197€</span>
              <span className="text-3xl font-bold text-yellow-600">Gratuit à vie</span>
            </div>
          </div>
        </motion.div>

        {/* 6️⃣-B CE QUI EST INCLUS DANS LE PACK */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9 }}
          className="mb-16"
        >
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 rounded-3xl border-2 border-blue-300 p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Ce qui est inclus dans le pack
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: Sparkles, text: "Offre complète générée par IA" },
                { icon: Target, text: "Validation de marché, de cible et de positionnement" },
                { icon: FileText, text: "Page de vente personnalisée" },
                { icon: Mail, text: "5 emails de vente automatiques" },
                { icon: MessageSquare, text: "Tous les messages de vente inclus" },
                { icon: Zap, text: "Plan d'action 7 jours pour ta première vente" },
                { icon: Calendar, text: "Plan d'action 30 jours complet" },
                { icon: FileText, text: "Tous les documents IA personnalisés" }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2 + idx * 0.05 }}
                    className="flex items-center gap-3 bg-white rounded-xl p-4 border border-blue-200 shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-gray-800 font-medium text-sm">{item.text}</span>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-blue-200">
              <p className="text-center text-gray-700 text-lg font-medium">
                Tout est prêt. Tu passes simplement à l'étape suivante.
              </p>
            </div>
          </div>
        </motion.div>

        {/* 6️⃣-C RENTABILISE TON INVESTISSEMENT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.1 }}
          className="mb-16"
        >
          {(() => {
            const packPrice = 67;
            const mainProductPrice = parsePrice(products[0]?.data?.price);
            const salesNeeded = mainProductPrice > 0 ? Math.ceil(packPrice / mainProductPrice) : 0;
            const totalFromSales = salesNeeded * mainProductPrice;

            return (
              <div className="bg-white rounded-3xl border-2 border-gray-200 p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#61f7a2] flex items-center justify-center flex-shrink-0">
                    <BarChart className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Rentabilise ton investissement dès les premières ventes
                  </h3>
                </div>

                <div className="bg-gradient-to-br from-[#61f7a2]/10 to-green-50 rounded-2xl border border-[#61f7a2]/30 p-6 mb-6">
                  <p className="text-gray-800 text-lg mb-4">
                    Le pack est à <span className="font-bold text-[#61f7a2]">67€</span>. 
                    Ton produit principal est à <span className="font-bold text-[#61f7a2]">{products[0]?.data?.price || '—'}</span>.
                  </p>
                  {salesNeeded > 0 && (
                    <>
                      <p className="text-gray-900 text-xl font-bold">
                        Il te suffira de faire <span className="text-[#61f7a2]">{salesNeeded} {salesNeeded === 1 ? 'vente' : 'ventes'}</span> pour que ce soit 
                        <span className="text-[#61f7a2]"> 100% remboursé</span>. 
                      </p>
                      <p className="text-gray-600 text-base mt-2">
                        ({salesNeeded} × {products[0]?.data?.price} = {totalFromSales}€)
                      </p>
                      <p className="text-gray-900 text-lg font-semibold mt-3">
                        Tout le reste, c'est 100% de bénéfice pour toi. 💰
                      </p>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-center gap-3 bg-gray-50 rounded-xl p-4">
                  <Clock className="w-6 h-6 text-[#61f7a2]" />
                  <p className="text-gray-700 font-medium">
                    L'objectif : ta première vente dans les 24 heures après avoir lancé
                  </p>
                </div>
              </div>
            );
          })()}
        </motion.div>

        {/* 7️⃣ CTA FINAL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="text-center"
        >
          <div className="bg-gradient-to-br from-[#61f7a2]/10 via-blue-50 to-purple-50 rounded-3xl border border-[#61f7a2]/30 p-12 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {content.finalCTA.title}
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              {content.finalCTA.subtitle}
            </p>
            
            <div className="flex justify-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    '0 0 0px rgba(97, 247, 162, 0.5)',
                    '0 0 30px rgba(97, 247, 162, 0.8)',
                    '0 0 0px rgba(97, 247, 162, 0.5)'
                  ]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="rounded-xl"
              >
                <GlowButton 
                  onClick={handleAccessDashboard} 
                  size="lg" 
                  className="px-12 text-lg shadow-2xl"
                >
                  Accéder à mon espace membre
                  <ArrowRight className="w-5 h-5 ml-2" />
                </GlowButton>
              </motion.div>
            </div>
          </div>
          </motion.div>
          </div>
        )}
      </div>



        {/* PayFall Modal */}
      <PayFallModal
        isOpen={isPayFallOpen}
        onClose={() => setIsPayFallOpen(false)}
        onCheckout={handleCheckout}
      />

      {/* Chat Bubble */}
      <ChatBubble />
    </div>
  );
}