import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function EtComment() {
  const formats = [
    'Produits Digitaux',
    'Communauté Privé',
    'Cours en Live',
    'Formation en ligne',
    'Accompagnement',
    'Présentiel'
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
        <div className="grid md:grid-cols-2 gap-10 items-center">
          
          {/* Colonne gauche */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Titre */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              ET <span className="text-[#61f7a2]">COMMENT</span> ?
            </h1>
            <p className="text-lg text-gray-600 mb-10">
              Il existe une multitude de formats pour partager votre expertise et créer une communauté engagée.
            </p>

            {/* Grille des formats */}
            <div className="grid grid-cols-2 gap-4">
              {formats.map((format, index) => (
                <motion.div
                  key={format}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-gray-50 border-2 border-gray-200 rounded-2xl px-6 py-4 text-center hover:border-[#61f7a2] hover:bg-[#61f7a2]/5 transition-all cursor-default"
                >
                  <span className="font-semibold text-gray-900">{format}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Colonne droite - Images */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            {/* Image principale */}
            <div className="relative">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6930250f9337193d59c1dcf5/33d43f097_Capturedecran2026-02-04a194344.png"
                alt="Communauté"
                className="rounded-2xl shadow-2xl w-full"
              />
              
              {/* Carte superposée 1 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-3 border border-gray-100"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#61f7a2] flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Formation validée</p>
                    <p className="text-[10px] text-gray-500">+1,879 élèves</p>
                  </div>
                </div>
              </motion.div>

              {/* Carte superposée 2 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-3 border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop" className="w-8 h-8 rounded-full border-2 border-white" alt="" />
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop" className="w-8 h-8 rounded-full border-2 border-white" alt="" />
                    <img src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=32&h=32&fit=crop" className="w-8 h-8 rounded-full border-2 border-white" alt="" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Communauté active</p>
                    <p className="text-[10px] text-gray-500">1,372 membres</p>
                  </div>
                </div>
              </motion.div>

              {/* Badge stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="absolute bottom-4 right-4 bg-[#61f7a2] rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 text-xs font-bold">+420</span>
                  <span className="text-gray-900/70 text-[10px]">ce mois</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}