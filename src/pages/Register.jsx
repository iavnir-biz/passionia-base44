import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Sparkles, Lock, Zap } from 'lucide-react';
import { NoahBrainIcon } from '@/components/NoahBrainIcon';

const benefits = [
  "Tes 4 offres sur-mesure générées par IA",
  "Messages de vente prêts à copier-coller",
  "Plan d'action 7 jours pour ta première vente",
  "Page de vente complète (formule PSSO)",
];

export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth, navigateToLogin } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (isAuthenticated) {
      redirectAfterAuth();
    } else {
      setChecking(false);
    }
  }, [isAuthenticated, isLoadingAuth]);

  const redirectAfterAuth = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      const hasProfile = profiles.length > 0 && profiles[0].first_name;
      if (!hasProfile) { navigate(createPageUrl('SetupProfile')); return; }
      const sessionId = user.sessionId || localStorage.getItem('passionia_active_session_id');
      if (sessionId) {
        const sessions = await base44.entities.Session.filter({ id: sessionId });
        if (sessions.length > 0 && sessions[0].is_onboarding_done) { navigate(createPageUrl('Dashboard')); return; }
      }
      navigate(createPageUrl('OnboardingFirstName'));
    } catch { navigate(createPageUrl('SetupProfile')); }
  };

  if (isLoadingAuth || checking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-[#61f7a2] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <NoahBrainIcon size={80} isThinking={false} />
        </div>

        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-[#61f7a2]/15 text-[#1a9e5c] border border-[#61f7a2]/40 rounded-full px-4 py-2 text-sm font-semibold">
            <CheckCircle className="w-4 h-4" />
            Paiement confirmé
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Crée ton accès maintenant
          </h1>
          <p className="text-gray-500 text-center text-sm mb-8 leading-relaxed">
            Ton paiement a bien été reçu. Crée ton compte pour accéder à Noah et générer tes premières offres.
          </p>

          <div className="bg-gray-50 rounded-2xl p-5 mb-8 space-y-3">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#61f7a2]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-3 h-3 text-[#1a9e5c]" />
                </div>
                <span className="text-sm text-gray-700 leading-relaxed">{b}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigateToLogin()}
            className="w-full bg-[#1a1a1a] hover:bg-black text-white font-semibold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <Zap className="w-5 h-5 text-[#61f7a2]" />
            Créer mon compte gratuit
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center gap-2 mt-5 text-gray-400 text-xs">
            <Lock className="w-3 h-3" />
            <span>Accès sécurisé · Données protégées</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 text-gray-500 text-sm">
          <Sparkles className="w-4 h-4 text-[#61f7a2]" />
          <span>Rejoint par +1 200 créateurs de contenu</span>
        </div>
      </motion.div>
    </div>
  );
}
