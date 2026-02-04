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
  Star,
  Gift,
  TrendingUp,
  Users,
  Clock,
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
      {/* Header */}
      <div className="py-6 px-5 border-b border-gray-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center shadow-lg shadow-[#61f7a2]/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white">PASSION IA</span>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full">
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
              <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                DONE FOR YOU ELITE
              </h1>
              <p className="text-xl text-gray-400 mb-8">
                Pour ceux qui veulent aller plus vite
              </p>
              
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-6xl md:text-7xl font-extrabold text-white">
                  4000€
                </span>
              </div>
              <p className="text-gray-400">
                Paiement unique <span className="text-yellow-400">(ou 3x 1400€ sans frais)</span>
              </p>
            </div>

            {/* Encadré Scarcity */}
            <div className="bg-gradient-to-br from-red-900/40 to-orange-900/40 border-2 border-red-500/50 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-red-400" />
                <span className="font-bold text-white">🔥 SEULEMENT {placesRestantes} PLACES CE MOIS-CI</span>
              </div>
              
              <p className="text-gray-300 mb-3">
                Places février: <strong className="text-white">{placesTotal - placesRestantes}/{placesTotal}</strong>
              </p>
              
              {/* Barre de progression */}
              <div className="w-full h-3 bg-gray-700 rounded-full mb-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${pourcentage}%` }}
                />
              </div>
              
              <p className="text-gray-300">
                Prix mars: <strong className="text-white">4500€</strong> <span className="text-red-400">(+500€)</span>
              </p>
              <p className="text-yellow-400 text-sm mt-1">
                Réservez maintenant, économisez 500€
              </p>
            </div>

            {/* Encadré CTA */}
            <div className="bg-gradient-to-br from-yellow-900/30 to-amber-900/30 border-2 border-yellow-500/50 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="font-bold text-white">⚡ ON S'OCCUPE DE TOUT</span>
              </div>

              <button
                onClick={handleBookCall}
                className="w-full bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:via-amber-400 hover:to-yellow-500 text-gray-900 font-bold py-5 px-8 rounded-xl mb-4 transition-all hover:-translate-y-1 shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-3 text-lg"
              >
                <Calendar className="w-6 h-6" />
                Réserver ma place
                <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-gray-400 text-center">
                Business opérationnel en <strong className="text-white">30 jours</strong>
              </p>
              <p className="text-gray-500 text-sm text-center mt-1">
                Accès immédiat au calendrier
              </p>
            </div>
          </motion.div>

          {/* COLONNE DROITE */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                ON CRÉE TOUT POUR VOUS
              </h2>
              <p className="text-gray-400">
                Sans que vous leviez le petit doigt
              </p>
            </div>

            {/* Semaine 1 */}
            <div className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700">
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-[#61f7a2] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white">STRATÉGIE COMPLÈTE <span className="text-gray-500 font-normal">(Semaine 1)</span></h3>
                </div>
              </div>
              <ul className="ml-9 space-y-1 text-gray-400">
                <li>• Étude de marché approfondie</li>
                <li>• Avatar client précis</li>
                <li>• Offre irrésistible structurée</li>
                <li>• Plan de lancement 90 jours</li>
              </ul>
            </div>

            {/* Semaines 2-3 */}
            <div className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700">
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-[#61f7a2] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white">CRÉATION PROFESSIONNELLE <span className="text-gray-500 font-normal">(Semaines 2-3)</span></h3>
                </div>
              </div>
              <ul className="ml-9 space-y-1 text-gray-400">
                <li>• Copywriting complet (page de vente + 8 emails)</li>
                <li>• Design & branding</li>
                <li>• Création du produit</li>
              </ul>
            </div>

            {/* Semaine 4 */}
            <div className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700">
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-[#61f7a2] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white">SETUP TECHNIQUE CLÉ EN MAIN <span className="text-gray-500 font-normal">(Semaine 4)</span></h3>
                </div>
              </div>
              <ul className="ml-9 space-y-1 text-gray-400">
                <li>• Tunnel de vente opérationnel</li>
                <li>• Paiements Stripe configurés</li>
                <li>• Automatisation email programmée</li>
                <li>• Tracking & analytics installés</li>
              </ul>
            </div>

            {/* Accompagnement VIP */}
            <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-2xl p-5 border border-purple-500/30">
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white">ACCOMPAGNEMENT VIP <span className="text-purple-400 font-normal">(6 mois)</span></h3>
                </div>
              </div>
              <ul className="ml-9 space-y-1 text-gray-300">
                <li>• 2 calls stratégiques par mois (12 au total)</li>
                <li>• Support prioritaire sous 24h</li>
                <li className="text-yellow-400">• Skool Premium GRATUIT À VIE (valeur: 1164€/an)</li>
                <li className="text-yellow-400">• Générateur illimité À VIE</li>
                <li>• Groupe WhatsApp VIP exclusif</li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Section Garantie + Valeur */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 space-y-6"
        >
          {/* Séparateur */}
          <div className="border-t border-gray-800 pt-8" />

          {/* Garantie */}
          <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-2xl p-6 md:p-8 border-2 border-green-500/50 text-center">
            <div className="inline-flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full mb-4">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-bold">🎁 GARANTIE RÉSULTATS EXTRÊME</span>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
              2000€ de CA en 60 jours
            </h3>
            <p className="text-gray-300 text-lg">
              OU remboursement intégral <span className="text-green-400 font-bold">+ 1000€ de dédommagement</span>
            </p>
          </div>

          {/* Valeur */}
          <div className="bg-gray-800/50 rounded-2xl p-6 md:p-8 border border-gray-700">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-gray-400 mb-1">💰 VALEUR RÉELLE</p>
                <p className="text-3xl font-bold text-white">12 343€</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">🔥 VOUS PAYEZ</p>
                <p className="text-3xl font-bold text-yellow-400">4000€</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">📉 ÉCONOMIE</p>
                <p className="text-3xl font-bold text-green-400">8343€ <span className="text-lg">(68%)</span></p>
              </div>
            </div>
          </div>

          {/* CTA Final */}
          <div className="text-center pt-4">
            <button
              onClick={handleBookCall}
              className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:via-amber-400 hover:to-yellow-500 text-gray-900 font-bold py-5 px-12 rounded-xl transition-all hover:-translate-y-1 shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-3 text-lg mx-auto"
            >
              <Calendar className="w-6 h-6" />
              Réserver mon appel stratégique
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-gray-500 mt-4">
              Appel de 30 minutes • Sans engagement
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}