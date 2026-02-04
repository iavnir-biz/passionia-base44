import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Lightbulb } from 'lucide-react';

export default function MonetiserSavoir() {
  const categories = [
    {
      label: 'UNE PASSION',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop'
    },
    {
      label: 'UNE EXPÉRIENCE',
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=200&fit=crop'
    },
    {
      label: 'UNE COMPÉTENCE',
      image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=200&h=200&fit=crop'
    },
    {
      label: 'UN VÉCU',
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=200&fit=crop'
    },
    {
      label: 'UN TALENT',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop'
    },
    {
      label: 'UNE TRANSFORMATION',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop'
    },
    {
      label: 'UN SAVOIR-FAIRE',
      image: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=200&h=200&fit=crop'
    },
    {
      label: 'UN SAVOIR',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop'
    },
    {
      label: 'UN SAVOIR-ÊTRE',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="py-6 px-5 border-b border-gray-200">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
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

      <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        {/* Titre principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            MONÉTISER SON SAVOIR,<br />
            CE N'EST PAS <span className="text-[#61f7a2]">"ENSEIGNER"</span>.
          </h1>
          <p className="text-xl text-gray-600">
            👉 C'est aider quelqu'un à résoudre un problème précis{' '}
            <span className="underline decoration-[#61f7a2] decoration-2 underline-offset-4 font-semibold text-gray-900">
              avec une solution
            </span> !
          </p>
        </motion.div>

        {/* Grille des catégories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6 mb-12"
        >
          {categories.slice(0, 6).map((cat, index) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-[#61f7a2] shadow-lg shadow-[#61f7a2]/20 mb-3">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs md:text-sm font-bold text-gray-900 text-center">
                {cat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Deuxième ligne */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4 md:gap-6 mb-12"
        >
          {categories.slice(6).map((cat, index) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + 0.1 * index }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-[#61f7a2] shadow-lg shadow-[#61f7a2]/20 mb-3">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs md:text-sm font-bold text-gray-900 text-center">
                {cat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Encadré citation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-[#61f7a2] rounded-2xl p-6 md:p-8 text-center">
            <div className="flex items-start justify-center gap-2 mb-2">
              <Lightbulb className="w-6 h-6 text-gray-900 flex-shrink-0" />
              <p className="text-gray-900 text-lg md:text-xl">
                <span className="font-normal">VOUS N'AVEZ PAS BESOIN D'ÊTRE "EXPERT".</span>
              </p>
            </div>
            <p className="text-gray-900 text-xl md:text-2xl font-bold">
              VOUS AVEZ JUSTE BESOIN D'AVOIR UN COUP D'AVANCE SUR QUELQU'UN.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}