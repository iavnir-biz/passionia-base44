import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Zap, User, BookOpen, TrendingUp, Link } from 'lucide-react';

export default function AgentNoah() {
  const features = [
    { icon: '🧠', label: 'Meilleur de chaque IA' },
    { icon: '🎯', label: '100% personnalisé' },
    { icon: '💰', label: 'Spécialisé en monétisation de savoir' },
    { icon: '📚', label: "Bibliothèque d'élite" },
    { icon: '📈', label: 'Évolue avec toi' },
    { icon: '🔗', label: 'Branché à nos systèmes' }
  ];

  return (
    <div className="min-h-screen bg-[#0f1129]">
      {/* Header */}
      <div className="py-6 px-5 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center shadow-lg shadow-[#61f7a2]/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white">PROTOCOLE QUICKWIN</span>
          </div>
          <div className="flex-1 h-px bg-white/20 ml-4" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          
          {/* Colonne gauche */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Titre */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 leading-tight">
              ET CETTE TECHNO EST PILOTÉE<br />
              PAR NOTRE <span className="text-[#61f7a2]">AGENT IA</span>{' '}
              <span className="text-[#61f7a2]">NOAH</span>.
            </h1>

            {/* Description */}
            <p className="text-gray-400 text-lg leading-relaxed">
              Noah n'est pas une simple IA.{' '}
              <span className="text-white font-semibold">C'est ton copilote business</span>{' '}
              qui combine les meilleurs modèles d'IA du marché, enrichi par l'expertise et adapté à TON projet unique.
            </p>
          </motion.div>

          {/* Colonne droite - Schéma */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative flex items-center justify-center min-h-[400px]"
          >
            {/* Container du schéma */}
            <div className="relative flex items-center">
              {/* Icône centrale Noah */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="w-20 h-20 rounded-2xl bg-[#61f7a2] flex items-center justify-center shadow-xl shadow-[#61f7a2]/30 relative z-10 flex-shrink-0"
              >
                <Brain className="w-10 h-10 text-white" />
              </motion.div>

              {/* Lignes SVG */}
              <svg width="80" height="320" className="flex-shrink-0" style={{ marginLeft: '-10px' }}>
                {features.map((_, index) => {
                  const startY = 160;
                  const endY = 30 + index * 52;
                  return (
                    <motion.path
                      key={index}
                      d={`M 10 ${startY} Q 40 ${startY} 70 ${endY}`}
                      stroke="#61f7a2"
                      strokeWidth="2"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                    />
                  );
                })}
              </svg>

              {/* Features avec points */}
              <div className="flex flex-col gap-3 ml-2">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#61f7a2] flex items-center justify-center shadow-lg shadow-[#61f7a2]/30 flex-shrink-0">
                      <span className="text-lg">{feature.icon}</span>
                    </div>
                    <span className="text-white font-medium whitespace-nowrap text-sm md:text-base">
                      {feature.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}