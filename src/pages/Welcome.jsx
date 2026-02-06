import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Target, TrendingUp, FileText, Rocket, Check, ArrowRight, Zap } from "lucide-react";

const steps = [
  {
    icon: Target,
    color: "text-blue-500",
    bg: "bg-blue-50",
    title: "Ton idee, validee par l'IA",
    desc: "On verifie que ta passion a un vrai marche — et des clients prets a payer.",
  },
  {
    icon: TrendingUp,
    color: "text-pink-500",
    bg: "bg-pink-50",
    title: "Ton potentiel de revenus",
    desc: "Une estimation realiste de ce que tu peux generer des le premier mois.",
  },
  {
    icon: FileText,
    color: "text-amber-500",
    bg: "bg-amber-50",
    title: "4 offres pretes a vendre",
    desc: "Prix, page de vente, emails, messages — tout genere et personnalise pour toi.",
  },
  {
    icon: Rocket,
    color: "text-green-500",
    bg: "bg-green-50",
    title: "Un plan d'action sur 7 jours",
    desc: "Chaque jour, une action claire. Tu sais exactement quoi faire pour lancer.",
  },
];

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-[26px] font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
            Transforme ta passion<br />en activite rentable.
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            En <span className="text-gray-900 font-semibold">5 minutes</span>, tu repars avec un business valide, des offres pretes et un plan d'action concret.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="flex flex-col gap-3 mb-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="flex items-start gap-4 bg-white rounded-2xl p-[18px] border border-gray-100 hover:border-gray-200 transition-all"
              >
                <div className="relative flex-shrink-0">
                  <div className={`w-12 h-12 rounded-xl ${step.bg} flex items-center justify-center`}>
                    <Icon className={`w-[22px] h-[22px] ${step.color}`} />
                  </div>
                  <div className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-md bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                    {i + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-bold text-gray-900 tracking-tight mb-0.5">
                    {step.title}
                  </h3>
                  <p className="text-[13px] text-gray-500 leading-snug">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Reassurance */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-5 mb-6"
        >
          {["100% gratuit", "5 minutes", "Personnalise"].map((text, i) => (
            <div key={i} className="flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-[#3dd67a]" strokeWidth={3} />
              <span className="text-xs text-gray-400 font-medium">{text}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          onClick={() => navigate(createPageUrl("OnboardingFirstName"))}
          className="w-full flex items-center justify-center gap-2.5 py-[18px] px-6 bg-gradient-to-b from-gray-900 to-black text-white rounded-2xl text-[17px] font-bold shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-[#61f7a2]/20 hover:-translate-y-0.5 transition-all active:scale-[0.98]"
        >
          C'est parti
          <ArrowRight className="w-5 h-5" />
        </motion.button>

        {/* Signup mention */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-1.5 mt-4"
        >
          <Zap className="w-3.5 h-3.5 text-[#61f7a2]" />
          <span className="text-xs text-gray-400">
            Cree ton compte en 10 secondes, et on attaque.
          </span>
        </motion.div>
      </div>
    </div>
  );
}
