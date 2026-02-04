import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Crown,
  CheckCircle,
  Calendar,
  Shield,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function DoneForYouElite() {
  const navigate = useNavigate();

  // Données scarcity
  const placesRestantes = 2;
  const placesTotal = 5;
  const pourcentage = ((placesTotal - placesRestantes) / placesTotal) * 100;

  const handleBookCall = () => {
    navigate(createPageUrl('Booking'));
  };

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
          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            <Crown className="w-3 h-3" />
            CHEMIN 3
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          
          {/* COLONNE GAUCHE */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Titre + Prix */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 text-gray-900">
                DONE FOR YOU ELITE
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Pour ceux qui veulent aller plus vite
              </p>
              
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-6xl md:text-7xl font-extrabold text-[#61f7a2]">
                  4000€
                </span>
              </div>
              <p className="text-gray-500">
                Paiement unique <span className="text-gray-900 font-medium">(ou 3x 1400€ sans frais)</span>
              </p>
            </div>

            {/* Encadré Scarcity */}
            <div className="bg-orange-50 border-2 border-orange-400 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-orange-500" />
                <span className="font-bold text-gray-900">🔥 SEULEMENT {placesRestantes} PLACES CE MOIS-CI</span>
              </div>
              
              <p className="text-gray-700 mb-3">
                Places février: <strong className="text-gray-900">{placesTotal - placesRestantes}/{placesTotal}</strong>
              </p>
              
              {/* Barre de progression */}
              <div className="w-full h-3 bg-gray-200 rounded-full mb-4 overflow-hidden">
                <div 
                  className="h-full bg-[#61f7a2] rounded-full transition-all duration-500"
                  style={{ width: `${pourcentage}%` }}
                />
              </div>
              
              <p className="text-gray-700">
                Prix mars: <strong className="text-gray-900">4500€</strong> <span className="text-orange-600">(+500€)</span>
              </p>
              <p className="text-orange-600 text-sm mt-1 font-medium">
                Réservez maintenant, économisez 500€
              </p>
            </div>

            {/* Encadré CTA */}
            <div className="bg-gray-900 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-5 h-5 text-[#61f7a2]" />
                <span className="font-bold text-white">⚡ ON S'OCCUPE DE TOUT</span>
              </div>

              <button
                onClick={handleBookCall}
                className="w-full bg-[#61f7a2] hover:bg-[#4de88f] text-gray-900 font-bold py-5 px-8 rounded-xl mb-4 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-3 text-lg"
              >
                <Calendar className="w-6 h-6" />
                Réserver ma place
                <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-gray-400 text-center">
                Business opérationnel en <strong className="text-white">30 jours</strong>
              </p>
            </div>
          </motion.div>

          {/* COLONNE DROITE */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              ON CRÉE TOUT POUR VOUS
            </h2>
            <p className="text-sm text-gray-500 mb-8">
              Sans que vous leviez le petit doigt
            </p>

            <div className="space-y-6">
              {/* Stratégie complète */}
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-gray-900">STRATÉGIE COMPLÈTE</span>
                  <span className="text-gray-500 ml-2">(Semaine 1)</span>
                </div>
              </div>

              {/* Création professionnelle */}
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-gray-900">CRÉATION PROFESSIONNELLE</span>
                  <span className="text-gray-500 ml-2">(Semaines 2-3)</span>
                </div>
              </div>

              {/* Setup technique */}
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-gray-900">SETUP TECHNIQUE CLÉ EN MAIN</span>
                  <span className="text-gray-500 ml-2">(Semaine 4)</span>
                </div>
              </div>

              {/* Accompagnement VIP */}
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-gray-900">ACCOMPAGNEMENT VIP</span>
                  <span className="text-gray-500 ml-2">(6 mois)</span>
                </div>
              </div>
            </div>

            {/* Séparateur */}
            <div className="border-t border-gray-200 my-8" />

            {/* Garantie */}
            <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-bold text-gray-900">🎁 GARANTIE RÉSULTATS EXTRÊME</span>
              </div>
              <p className="text-gray-900 font-bold text-lg mb-1">
                2000€ de CA en 60 jours
              </p>
              <p className="text-gray-600 text-sm">
                OU remboursement intégral
              </p>
            </div>

            {/* Séparateur */}
            <div className="border-t border-gray-200 my-8" />

            {/* Valeur */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">💰 Valeur réelle</span>
                <span className="font-bold text-gray-900">8 000€</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">🔥 Vous payez aujourd'hui</span>
                <span className="font-bold text-[#61f7a2] text-xl">4000€</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">📉 Économie</span>
                <span className="font-bold text-green-600">4000€ (50%)</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}