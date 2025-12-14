import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
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
  Lock
} from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import PaywallModal from '@/components/paywall/PaywallModal';
import { cn } from "@/lib/utils";

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

export default function PlanAction() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

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

  const handleStepClick = (step) => {
    if (step.page) {
      navigate(createPageUrl(step.page));
    }
  };

  const handleAccessDashboard = () => {
    navigate(createPageUrl('Dashboard'));
  };

  const handlePurchase = async () => {
    setPurchasing(true);
    
    try {
      // TODO: Integrate Stripe payment here
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user profile as paid
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      
      if (profiles.length > 0) {
        await base44.entities.UserProfile.update(profiles[0].id, { has_paid: true });
      }
      
      // Redirect to dashboard
      navigate(createPageUrl('Dashboard'));
      
    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setPurchasing(false);
      setShowPaywall(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin" />
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
            {mainSteps.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => handleStepClick(step)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap cursor-pointer hover:opacity-80",
                    step.id === 5 
                      ? "bg-[#61f7a2] text-white shadow-sm" 
                      : step.id < 5
                        ? "text-[#61f7a2] hover:text-[#4de88f]"
                        : "text-gray-400 hover:text-gray-500"
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
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        
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
              className="text-gray-600 text-xl"
            >
              Maintenant, on va mettre tout ça en place ensemble
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
                { icon: Heart, text: "J'ai mon offre, mais comment je fais maintenant ?" },
                { icon: Lightbulb, text: "Je n'y connais rien en technique…" },
                { icon: Target, text: "Je ne sais pas faire du marketing…" },
                { icon: Shield, text: "J'ai peur de me planter…" }
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
              ✨ On est passés par là. Et on a créé ce pack pour toi.
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
                {[
                  "Tu vas galérer des semaines",
                  "Tu ne sauras pas par où commencer",
                  "Tu vas te décourager",
                  "Tu abandonneras probablement"
                ].map((item, idx) => (
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
                {[
                  "Tout est déjà prêt",
                  "Tu as un plan étape par étape",
                  "Tu es guidé(e) en vidéo",
                  "Tu lances cette semaine"
                ].map((item, idx) => (
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
                title: "Valider l'offre + premières ventes",
                description: "Messages générés, plan exact, première vente dans les 24h",
                color: "blue"
              },
              {
                week: 2,
                icon: Gift,
                title: "Créer l'order bump + continuer à vendre",
                description: "Contenu prêt, page web automatique, emails rédigés",
                color: "green"
              },
              {
                week: 3,
                icon: Award,
                title: "Préparer les offres supérieures + créer communauté",
                description: "Upsells prêts, première communauté, témoignages",
                color: "purple"
              },
              {
                week: 4,
                icon: Crown,
                title: "Lancer les pubs autofinancées + livrer",
                description: "Publicités intelligentes, système automatisé, croissance",
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
                title: "Textes générés",
                description: "Descriptions, bénéfices, témoignages, tout est écrit"
              },
              {
                icon: Video,
                title: "Page de vente",
                description: "Template premium, design pro, prêt à personnaliser"
              },
              {
                icon: Mail,
                title: "Emails automatiques",
                description: "Séquences complètes, relances, offres complémentaires"
              },
              {
                icon: MessageSquare,
                title: "Scripts / messages",
                description: "Messages de vente, réponses aux objections, suivi"
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
            <div className="absolute top-4 right-4">
              <span className="px-4 py-1.5 bg-yellow-500 text-white text-sm font-bold rounded-full uppercase shadow-md">
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

        {/* 7️⃣ CTA FINAL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="text-center"
        >
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl border border-gray-200 p-12 shadow-lg">
            <div className="w-16 h-16 rounded-2xl bg-[#61f7a2]/10 mx-auto mb-6 flex items-center justify-center">
              <Lock className="w-8 h-8 text-[#61f7a2]" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Débloquer tout le contenu
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Accède à ton offre complète, ta page de vente, tes emails,
              ton plan d'action et tous tes documents IA
            </p>
            
            <GlowButton 
              onClick={() => setShowPaywall(true)} 
              size="lg" 
              className="px-12 text-lg"
            >
              Débloquer maintenant
              <ArrowRight className="w-5 h-5 ml-2" />
            </GlowButton>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-gray-200 bg-white mt-12">
        <p className="text-gray-500 text-sm">Copyright Passion IA</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-[#61f7a2] animate-pulse" />
          <span className="text-[#61f7a2] text-xs font-medium">SYSTÈME CONNECTÉ</span>
        </div>
      </footer>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchase={handlePurchase}
        loading={purchasing}
      />
    </div>
  );
}