import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Zap, CheckCircle, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function SkoolAbonnement() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(null);

  // Données scarcity
  const membresActuels = 74;
  const membresMax = 80;
  const placesRestantes = membresMax - membresActuels;
  const pourcentage = Math.round((membresActuels / membresMax) * 100);

  const SKOOL_URL = 'https://www.skool.com/ia-pour-tous-6043/about?ref=8a2dca11af9048e6940087b263136daa';

  const handleSkoolRedirect = () => {
    window.open(SKOOL_URL, '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="py-6 px-5 border-b border-gray-200">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center shadow-lg shadow-[#61f7a2]/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">PASSION IA</span>
          </div>
          <span className="bg-[#61f7a2] text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full">
            CHEMIN 2
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          
          {/* COLONNE GAUCHE */}
          <div className="space-y-8">
            {/* Titre + Prix */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                L'ABONNEMENT SKOOL
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Construisez votre business avec nous
              </p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-6xl md:text-7xl font-extrabold text-[#61f7a2]">
                  37€
                </span>
                <span className="text-2xl text-gray-600">/mois</span>
              </div>
              <p className="text-gray-500 italic">
                Prix verrouillé à vie à votre inscription
              </p>
            </div>

            {/* Encadré Scarcity */}
            <div className="bg-orange-50 border-2 border-orange-400 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <span className="font-bold text-gray-900">PLACES LIMITÉES</span>
              </div>
              
              <p className="text-gray-900 mb-3">
                Membres actuels: <strong>{membresActuels}/{membresMax}</strong>
              </p>
              
              {/* Barre de progression */}
              <div className="w-full h-3 bg-gray-200 rounded-full mb-4 overflow-hidden">
                <div 
                  className="h-full bg-[#61f7a2] rounded-full transition-all duration-500"
                  style={{ width: `${pourcentage}%` }}
                />
              </div>
              
              <p className="text-gray-900">
                Le tarif augmentera à <strong>47€</strong> dès 80 membres.
                <br />
                <span className="text-orange-600 font-semibold">Plus que {placesRestantes} places.</span>
              </p>
            </div>

            {/* Encadré CTA */}
            <div className="bg-gray-900 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-5 h-5 text-[#61f7a2]" />
                <span className="text-white font-bold">2 OPTIONS DISPONIBLES</span>
              </div>

              {/* Bouton Standard */}
              <button
                onClick={() => handleCheckout('standard')}
                disabled={isProcessing}
                className="w-full bg-[#61f7a2] hover:bg-[#4de88f] text-gray-900 font-bold py-4 px-6 rounded-xl mb-4 transition-all hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isProcessing === 'standard' ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Redirection...
                  </span>
                ) : (
                  <>
                    <span className="block text-lg">Standard - 37€/mois</span>
                    <span className="block text-sm opacity-70">→ Accès mensuel</span>
                  </>
                )}
              </button>

              {/* Bouton Premium */}
              <button
                onClick={() => handleCheckout('premium')}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-6 rounded-xl mb-4 transition-all hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isProcessing === 'premium' ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Redirection...
                  </span>
                ) : (
                  <>
                    <span className="block text-lg">Premium - 370€/an</span>
                    <span className="block text-sm opacity-80">→ 2 mois offerts + bonus</span>
                  </>
                )}
              </button>

              <p className="text-gray-400 text-sm text-center">
                Accès immédiat
              </p>
            </div>

            {/* Lien vers comparaison */}
            <button
              onClick={() => navigate(createPageUrl('SkoolComparaison'))}
              className="text-[#61f7a2] font-semibold hover:underline"
            >
              Voir la comparaison Standard vs Premium →
            </button>
          </div>

          {/* COLONNE DROITE - CE QUI EST INCLUS */}
          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              CE QUI EST INCLUS EXACTEMENT
            </h2>
            <p className="text-sm mb-8">
              <span className="text-[#61f7a2] font-bold">100% personnalisé à votre profil</span>
            </p>

            <div className="space-y-6">
              {/* Générateur illimité */}
              <div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                  <span className="font-bold text-gray-900">GÉNÉRATEUR ILLIMITÉ</span>
                </div>
              </div>

              {/* 2 Lives par semaine */}
              <div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                  <span className="font-bold text-gray-900">2 LIVES PAR SEMAINE</span>
                  <span className="text-gray-600 text-sm">(aide-vente, création de cours...)</span>
                </div>
              </div>

              {/* Formation complète */}
              <div>
                <div className="flex items-start gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                  <span className="font-bold text-gray-900">ACCÈS À NOS VIDÉOS DE FORMATION COMPLÈTES</span>
                </div>
                <ul className="ml-8 space-y-1 text-gray-600 text-sm">
                  <li>• Module Setup technique</li>
                  <li>• Module Création de produits</li>
                  <li>• Module Pages de vente</li>
                  <li>• Module Systèmes de paiement</li>
                  <li>• Module Publicités</li>
                  <li>• Module Automatisation email</li>
                  <li>• etc.</li>
                </ul>
              </div>

              {/* Templates */}
              <div>
                <div className="flex items-start gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                  <span className="font-bold text-gray-900">ACCÈS À TOUTES LES RESSOURCES ET TEMPLATES</span>
                </div>
              </div>

              {/* Communauté */}
              <div>
                <div className="flex items-start gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                  <span className="font-bold text-gray-900">COMMUNAUTÉ ACTIVE 24/7</span>
                </div>
                <p className="ml-8 text-gray-600 text-sm">
                  Networking, support, partage de résultats
                </p>
              </div>

              {/* Prix verrouillé */}
              <div>
                <div className="flex items-start gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                  <span className="font-bold text-gray-900">PRIX VERROUILLÉ À VIE</span>
                </div>
                <p className="ml-8 text-gray-600 text-sm">
                  Vous payez 37€/mois même si le prix monte à 47€, 67€ voire plus
                </p>
              </div>
            </div>

            {/* Séparateur */}
            <div className="border-t border-gray-200 my-8" />

            {/* Bonus Premium */}
            <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
              <h3 className="font-bold text-purple-700 mb-4">
                ⭐ BONUS PREMIUM (paiement annuel 370€/an)
              </h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">⭐</span>
                  <span>30min cerveau collectif et décision stratégique</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">⭐</span>
                  <span>Groupe WhatsApp VIP</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">⭐</span>
                  <span><strong>Économie: 74€/an</strong> vs mensuel</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}