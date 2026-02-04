import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, X, Check } from 'lucide-react';

export default function VotreForce() {
  const notThese = [
    'VOS DIPLÔMES',
    'VOTRE TECHNIQUE'
  ];

  const butThese = [
    'VOTRE VÉCU',
    'VOS EXPÉRIENCES',
    'VOS COMPÉTENCES HUMAINES',
    'QUELQUE CHOSE QUE VOUS AVEZ TRAVERSÉ'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="py-6 px-5 border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center shadow-lg shadow-[#61f7a2]/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">PASSION IA</span>
          </div>
          <span className="bg-[#61f7a2] text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full">
            PROTOCOLE QUICKWIN
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        {/* Titre principal en haut à droite style */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-right mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#61f7a2]">
            VOTRE FORCE EN 2026
          </h1>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10 items-center">
          
          {/* Colonne gauche */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-10"
          >
            {/* CE N'EST PAS */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                CE N'EST PAS
              </h2>
              <div className="space-y-4">
                {notThese.map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <X className="w-5 h-5 text-red-500" />
                    </div>
                    <span className="text-lg font-semibold text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* MAIS... */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                MAIS...
              </h2>
              <div className="space-y-4">
                {butThese.map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + 0.1 * index }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#61f7a2]/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-[#61f7a2]" />
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Colonne droite - Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <div className="relative">
              {/* Étoile décorative */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -top-4 -left-4 z-10"
              >
                <Sparkles className="w-8 h-8 text-[#61f7a2]" />
              </motion.div>
              
              {/* Image */}
              <div className="rounded-3xl overflow-hidden border-4 border-[#61f7a2] shadow-2xl shadow-[#61f7a2]/20">
                <img
                  src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=500&h=400&fit=crop"
                  alt="Votre force"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}