import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Brain, Target, TrendingUp, FileText, Rocket, Check, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Target,
    color: "text-blue-500",
    bg: "bg-blue-50",
    title: "On valide ton idee ensemble",
    desc: "Je verifie si ta passion peut se vendre — avec de la vraie demande.",
  },
  {
    icon: TrendingUp,
    color: "text-pink-500",
    bg: "bg-pink-50",
    title: "On estime ton potentiel",
    desc: "Combien tu peux generer, avec ton savoir et ton marche.",
  },
  {
    icon: FileText,
    color: "text-amber-500",
    bg: "bg-amber-50",
    title: "Je cree tes 4 offres",
    desc: "Offres, prix, page de vente, messages, emails — tout est pret.",
  },
  {
    icon: Rocket,
    color: "text-green-500",
    bg: "bg-green-50",
    title: "Ton plan d'action sur 7 jours",
    desc: "Une action par jour. Tu sais exactement quoi faire.",
  },
];

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">

        {/* Noah Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <div className="w-[72px] h-[72px] rounded-2xl bg-[#61f7a2] flex items-center justify-center shadow-lg shadow-[#61f7a2]/30">
              <Brain size={36} className="text-white" />
            </div>
            <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-[#fafafa] animate-pulse" />
          </div>
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-[26px] font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
            Salut, moi c'est Noah.
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-4">
            Je suis ton associe IA. A partir de maintenant, on construit <span className="text-gray-900 font-semibold">ensemble</span> ton activite en ligne.
          </p>
          <p className="text-gray-900 font-semibold text-[15px]">
            Voici comment on va travailler :
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
          onClick={() => navigate(createPageUrl("Onboarding"))}
          className="w-full flex items-center justify-center gap-2.5 py-[18px] px-6 bg-gradient-to-b from-gray-900 to-black text-white rounded-2xl text-[17px] font-bold shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-[#61f7a2]/20 hover:-translate-y-0.5 transition-all active:scale-[0.98]"
        >
          Commencer avec Noah
          <ArrowRight className="w-5 h-5" />
        </motion.button>

        {/* Micro social proof */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-gray-400 mt-4"
        >
          Rejoins les entrepreneurs qui monetisent deja leur savoir.
        </motion.p>
      </div>
    </div>
  );
}