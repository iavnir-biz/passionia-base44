import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Sparkles,
  CheckCircle,
  ArrowRight,
  Loader2,
  Shield,
  Zap,
  Star,
  Gift,
  X
} from 'lucide-react';

export default function ProtocoleQuickwin() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasOrderBump, setHasOrderBump] = useState(false);
  const [showOrderBumpPopup, setShowOrderBumpPopup] = useState(false);

  // Prix
  const BASE_PRICE = 67;
  const ORDER_BUMP_PRICE = 37;
  const totalPrice = hasOrderBump ? BASE_PRICE + ORDER_BUMP_PRICE : BASE_PRICE;

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const { data } = await base44.functions.invoke('createCheckout', {
        hasOrderBump: hasOrderBump
      });

      if (data.success && data.url) {
        window.top.location.href = data.url;
      } else {
        alert('Erreur: impossible de créer la session de paiement');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-4 px-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center shadow-lg shadow-[#61f7a2]/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">PROTOCOLE QUICKWIN</span>
          </div>
          <span className="text-sm text-gray-500 font-medium">Chemin 1</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-5 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden"
        >
          {/* Hero Section */}
          <div className="p-8 md:p-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              GÉNÉRATEUR COMPLET
            </h1>
            
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl md:text-5xl font-black text-[#61f7a2]">{totalPrice}€</span>
              <span className="text-gray-500 font-medium">ONE-TIME</span>
              {hasOrderBump && (
                <span className="text-sm text-gray-400 line-through ml-2">104€</span>
              )}
            </div>

            <p className="text-xl text-gray-700 font-medium">
              Votre première vente en moins de 7 jours
            </p>
          </div>

          {/* Ce qui est inclus */}
          <div className="px-8 md:px-10 pb-8">
            <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                CE QUI EST INCLUS EXACTEMENT
              </h2>
              <p className="text-sm mb-6">
                <span className="text-[#61f7a2] font-bold">100% personnalisé à votre profil</span>
              </p>

              {/* Générateur complet */}
              <div className="mb-6">
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                  <span className="font-bold text-gray-900">GÉNÉRATEUR COMPLET (jusqu'à 5 générations maximum)</span>
                </div>
                <ul className="ml-8 space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    Analyse de marché détaillée
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    3 avatars de vos futurs acheteurs
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    Les 4 offres détaillées de votre Full Stack Offer
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    Les messages pour vendre dès demain (angles différents)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    Les pages de vente rédigées pour chaque offre
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    Séquence complète de 8 emails marketing ready-to-send
                  </li>
                </ul>
              </div>

              {/* Plan d'action */}
              <div className="mb-6">
                <div className="flex items-start gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-gray-900">PLAN D'ACTION "PREMIÈRE VENTE EN 7 JOURS"</span>
                    <p className="text-gray-600 mt-1">Guide jour par jour + scripts + checklist</p>
                  </div>
                </div>
              </div>

              {/* Tableau de bord */}
              <div>
                <div className="flex items-start gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-gray-900">TABLEAU DE BORD GAMIFIÉ</span>
                    <p className="text-gray-600 mt-1">Suivi de progression étape par étape</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Garantie */}
          <div className="px-8 md:px-10 pb-8">
            <div className="bg-gradient-to-br from-[#61f7a2]/10 to-green-50 rounded-2xl p-6 border-2 border-[#61f7a2]/30">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#61f7a2] flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    🎁 GARANTIE 30 JOURS
                  </h3>
                  <p className="text-gray-700 mt-1">
                    Faites 67€ de CA ou remboursé intégral<br />
                    <span className="text-gray-500">(1 seule vente suffit !)</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="px-8 md:px-10 pb-10">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-[#61f7a2]" />
                <span className="text-white font-bold">LE CHOIX RECOMMANDÉ</span>
              </div>


              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full py-4 px-8 bg-[#61f7a2] hover:bg-[#4de88f] text-gray-900 font-bold text-lg rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Redirection...
                  </>
                ) : (
                  <>
                    Obtenir le Générateur Complet
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-gray-500 text-sm mt-4">
                Accès immédiat
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}