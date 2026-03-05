import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Brain, ArrowRight, Loader2 } from "lucide-react";

export default function OnboardingFirstName() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          base44.auth.redirectToLogin(createPageUrl("OnboardingFirstName"));
          return;
        }

        // Check if user already has a profile with first_name
        const profiles = await base44.entities.UserProfile.list();
        if (profiles.length > 0 && profiles[0].first_name) {
          // Already has a name, go to dynamic onboarding
          navigate(createPageUrl("OnboardingDynamic"), { replace: true });
          return;
        }
      } catch (e) {
        console.error("Init error:", e);
      }
      setLoading(false);
    }
    init();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || saving) return;

    setSaving(true);
    try {
      const profiles = await base44.entities.UserProfile.list();
      if (profiles.length > 0) {
        await base44.entities.UserProfile.update(profiles[0].id, { first_name: firstName.trim() });
      } else {
        await base44.entities.UserProfile.create({ first_name: firstName.trim() });
      }
      navigate(createPageUrl("OnboardingDynamic"));
    } catch (err) {
      console.error("Save error:", err);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* Noah Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div className="w-[72px] h-[72px] rounded-2xl bg-[#61f7a2] flex items-center justify-center shadow-lg shadow-[#61f7a2]/30">
              <Brain size={36} className="text-white" />
            </div>
            <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-[#fafafa] animate-pulse" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center mb-10"
        >
          <h1 className="text-[26px] font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
            Avant de commencer...
          </h1>
          <p className="text-gray-500 text-[15px] leading-relaxed">
            Comment tu t'appelles ? Je veux pouvoir m'adresser à toi directement. 😊
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ton prénom"
              autoFocus
              className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl text-[17px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#61f7a2]/50 focus:border-[#61f7a2] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!firstName.trim() || saving}
            className="w-full flex items-center justify-center gap-2.5 py-[18px] px-6 bg-gradient-to-b from-gray-900 to-black text-white rounded-2xl text-[17px] font-bold shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-[#61f7a2]/20 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Continuer
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </motion.form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-gray-400 mt-6"
        >
          Ton prénom est utilisé uniquement pour personnaliser ton expérience.
        </motion.p>
      </div>
    </div>
  );
}