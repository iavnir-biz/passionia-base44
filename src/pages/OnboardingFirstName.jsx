import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Brain, ArrowRight, Loader2, Sparkles } from "lucide-react";

export default function OnboardingFirstName() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    checkExisting();
  }, []);

  const checkExisting = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(window.location.href);
        return;
      }
      const user = await base44.auth.me();
      // Pre-fill if we already have the firstName
      if (user.firstName) {
        setFirstName(user.firstName);
      }
      const stored = localStorage.getItem("onboarding_firstName");
      if (stored && !user.firstName) {
        setFirstName(stored);
      }
    } catch (e) {
      // Not logged in — redirect to login
      base44.auth.redirectToLogin(window.location.href);
      return;
    } finally {
      setInitialLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!firstName.trim() || loading) return;
    setLoading(true);
    try {
      const cleanName = firstName.trim().slice(0, 50);
      localStorage.setItem("onboarding_firstName", cleanName);
      await base44.auth.updateMe({ firstName: cleanName });
      navigate(createPageUrl("OnboardingDynamic"));
    } catch (e) {
      console.error("Error saving firstName:", e);
      // Navigate anyway — the name is in localStorage
      navigate(createPageUrl("OnboardingDynamic"));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleContinue();
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-[#61f7a2]" />
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
          className="text-center mb-8"
        >
          <h1 className="text-[26px] font-extrabold text-gray-900 tracking-tight leading-tight mb-2">
            Avant de commencer...
          </h1>
          <p className="text-gray-500 text-[15px] leading-relaxed">
            Comment tu t'appelles ? Je veux pouvoir m'adresser à toi directement.
          </p>
        </motion.div>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6"
        >
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ton prénom..."
            autoFocus
            maxLength={50}
            className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl text-[17px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#61f7a2] focus:ring-4 focus:ring-[#61f7a2]/15 transition-all text-center font-medium"
          />
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          onClick={handleContinue}
          disabled={!firstName.trim() || loading}
          className="w-full flex items-center justify-center gap-2.5 py-[18px] px-6 bg-gradient-to-b from-gray-900 to-black text-white rounded-2xl text-[17px] font-bold shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-[#61f7a2]/20 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              C'est parti
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>

        {/* Reassurance */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 mt-5"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#61f7a2]" />
          <span className="text-xs text-gray-400 font-medium">
            Ton prénom sera utilisé pour personnaliser tout ton parcours.
          </span>
        </motion.div>
      </div>
    </div>
  );
}