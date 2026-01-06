import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  Sparkles,
  CheckCircle,
  ArrowRight,
  Loader2,
  Target,
  Mail,
  FileText,
  Users,
  BarChart3,
  MessageSquare,
  Zap,
  Shield,
  Clock,
  Rocket
} from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import OnboardingSidebar from '@/components/onboarding/OnboardingSidebar';
import { cn } from "@/lib/utils";

export default function PlanActionPaywall() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Vérifier si l'utilisateur a déjà payé
      if (currentUser.has_purchased) {
        navigate(createPageUrl('PlanAction'));
        return;
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAccess = async () => {
    if (!user) return;

    setIsCreatingCheckout(true);
    try {
      const { data } = await base44.functions.invoke('createCheckout', {
        userId: user.id,
        userEmail: user.email
      });

      if (data.success && data.checkoutUrl) {
        // Sauvegarder le timestamp de clic paywall
        await base44.auth.updateMe({
          paywall_clicked_at: new Date().toISOString()
        });

        // Rediriger vers Stripe Checkout
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin" />
      </div>
    );
  }

  const completedSteps = [1, 2, 3, 4, 5, 6]; // Jusqu'à Ta vie future complété

  const packContents = [
    { 
      icon: Target, 
      title: "Analyse de Marché Complète", 
      desc: "Validation de ton marché avec statistiques et opportunités",
      color: "from-blue-500 to-cyan-500"
    },
    { 
      icon: Users, 
      title: "Avatars Clients Détaillés", 
      desc: "3 profils clients hyper-précis pour cibler juste",
      color: "from-purple-500 to-pink-500"
    },
    { 
      icon: Sparkles, 
      title: "Tes 4 Offres Complètes", 
      desc: "Produits + Prix + Descriptions optimisées pour vendre",
      color: "from-orange-500 to-red-500"
    },
    { 
      icon: FileText, 
      title: "Page de Vente Professionnelle", 
      desc: "Une landing page prête à convertir tes visiteurs",
      color: "from-green-500 to-emerald-500"
    },
    { 
      icon: MessageSquare, 
      title: "Messages de Vente Clés en Main", 
      desc: "Scripts éprouvés pour approcher tes prospects",
      color: "from-indigo-500 to-blue-500"
    },
    { 
      icon: Mail, 
      title: "Séquence d'Emails Marketing", 
      desc: "5 emails automatiques pour nurture ton audience",
      color: "from-pink-500 to-rose-500"
    },
    { 
      icon: BarChart3, 
      title: "Stratégie Réseaux Sociaux", 
      desc: "Posts et contenus pour attirer tes premiers clients",
      color: "from-yellow-500 to-amber-500"
    },
    { 
      icon: Rocket, 
      title: "Plan 7 Jours pour ta 1ère Vente", 
      desc: "Actions concrètes jour après jour",
      color: "from-teal-500 to-cyan-500"
    }
  ];

  const bonusFeatures = [
    { icon: Shield, text: "Accès à vie" },
    { icon: Zap, text: "Support prioritaire" },
    { icon: Clock, text: "Mises à jour gratuites" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex">
      <OnboardingSidebar currentPage="PlanActionPaywall" completedSteps={completedSteps} progressInStep={0} />

      <div className="flex-1 flex flex-col lg:ml-80">
        <div className="max-w-4xl mx-auto px-6 py-12">
          
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] shadow-xl mb-6"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              🎉 Félicitations {user?.firstName} !
            </h1>
            <p className="text-xl text-gray-700 mb-6">
              Tu viens de construire toute ta stratégie.<br />
              Maintenant, accède à ton Pack Clé en Main complet.
            </p>
          </motion.div>

          {/* Price Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 rounded-3xl border-2 border-yellow-600 p-8 mb-8 shadow-2xl text-center"
          >
            <p className="text-white/90 text-lg mb-2">Accès Immédiat</p>
            <div className="text-6xl font-black text-white mb-2">97€</div>
            <p className="text-white/80 text-sm mb-4">Paiement unique • Accès à vie</p>
            
            <div className="flex justify-center gap-4 mb-6">
              {bonusFeatures.map((bonus, idx) => {
                const Icon = bonus.icon;
                return (
                  <div key={idx} className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Icon className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-semibold">{bonus.text}</span>
                  </div>
                );
              })}
            </div>

            <GlowButton
              onClick={handleGetAccess}
              disabled={isCreatingCheckout}
              size="lg"
              className="w-full md:w-auto px-12 bg-white text-yellow-600 hover:bg-gray-100 font-bold"
            >
              {isCreatingCheckout ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Redirection...
                </>
              ) : (
                <>
                  Accéder à Mon Pack Clé en Main
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </GlowButton>
          </motion.div>

          {/* Ce que tu obtiens */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              📦 Ce que tu obtiens immédiatement
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {packContents.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + idx * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm flex-shrink-0",
                        item.color
                      )}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-bold mb-1">{item.title}</h3>
                        <p className="text-gray-600 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Garantie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl border-2 border-green-200 p-8 mb-8 text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500 mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              ✅ Garantie Satisfait ou Remboursé 30 jours
            </h3>
            <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto">
              Teste le pack pendant 30 jours. Si tu ne vois pas la valeur, on te rembourse intégralement. Aucune justification nécessaire.
            </p>
          </motion.div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-center"
          >
            <p className="text-gray-600 mb-6 text-lg">
              Prêt(e) à passer à l'action ?
            </p>
            <GlowButton
              onClick={handleGetAccess}
              disabled={isCreatingCheckout}
              size="lg"
              className="px-12"
            >
              {isCreatingCheckout ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Redirection...
                </>
              ) : (
                <>
                  Oui, je veux mon Pack Clé en Main
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </GlowButton>
            <p className="text-gray-500 text-sm mt-4">
              Paiement sécurisé par Stripe • Satisfait ou remboursé 30 jours
            </p>
          </motion.div>

        </div>
      </div>
    </div>
  );
}