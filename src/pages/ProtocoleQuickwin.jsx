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

          {/* ORDER BUMP - Pack Réseaux Sociaux */}
          <div className="px-8 md:px-10 pb-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl p-5 cursor-pointer transition-all duration-300 ${
                hasOrderBump
                  ? 'bg-gradient-to-br from-[#61f7a2]/20 to-green-100 border-4 border-[#61f7a2] shadow-lg shadow-[#61f7a2]/20'
                  : 'bg-white border-4 border-[#61f7a2] hover:shadow-lg hover:shadow-[#61f7a2]/10'
              }`}
              onClick={() => setShowOrderBumpPopup(true)}
            >
              {/* Badge */}
              <div className="flex justify-center mb-3">
                <span className="bg-[#61f7a2] text-gray-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Gift className="w-3 h-3" />
                  OFFRE SPÉCIALE
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Checkbox visuelle */}
                <div
                  className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    hasOrderBump
                      ? 'bg-[#61f7a2] border-[#61f7a2]'
                      : 'border-gray-300 bg-white'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setHasOrderBump(!hasOrderBump);
                  }}
                >
                  {hasOrderBump && <CheckCircle className="w-5 h-5 text-white" />}
                </div>

                {/* Icône */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#61f7a2] to-green-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎬</span>
                </div>

                {/* Contenu */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    🎁 Ajoute le Pack Réseaux Sociaux
                  </h3>
                  <p className="text-gray-600 text-sm mb-1">
                    100+ Templates prêts à poster
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-[#61f7a2]">+37€</span>
                    <span className="text-gray-400 line-through text-xs">147€</span>
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                      -75%
                    </span>
                  </div>
                </div>

                {/* Bouton détails */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOrderBumpPopup(true);
                  }}
                  className="px-3 py-1.5 bg-[#61f7a2]/20 text-[#61f7a2] font-semibold rounded-lg hover:bg-[#61f7a2]/30 transition-colors text-sm flex items-center gap-1"
                >
                  Détails
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {hasOrderBump && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 pt-3 border-t border-[#61f7a2]/30"
                >
                  <p className="text-[#61f7a2] font-semibold text-center flex items-center justify-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Pack Réseaux Sociaux ajouté !
                  </p>
                </motion.div>
              )}
            </motion.div>
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
                    Redirection vers le paiement...
                  </>
                ) : (
                  <>
                    Obtenir le Générateur Complet — {totalPrice}€
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-gray-400 text-sm mt-4 flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                Paiement sécurisé
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* POPUP Order Bump Détails */}
      {showOrderBumpPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowOrderBumpPopup(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-[#61f7a2] to-green-500 p-6 rounded-t-3xl relative">
              <button
                onClick={() => setShowOrderBumpPopup(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="text-center">
                <span className="text-5xl mb-3 block">🎬</span>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Pack Réseaux Sociaux - 100+ Templates
                </h2>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl font-black text-white">+37€</span>
                  <span className="text-white/70 line-through">Valeur 147€</span>
                </div>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-4">
              {/* Instagram/TikTok */}
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-200">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-lg">📱</span>
                  Instagram / TikTok
                </h3>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                    <span>30 scripts Reels adaptés à ton offre</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                    <span>20 hooks viraux pour capter l'attention</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                    <span>15 légendes de posts qui convertissent</span>
                  </li>
                </ul>
              </div>

              {/* Carrousels */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-lg">🎨</span>
                  Carrousels
                </h3>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                    <span>15 templates Canva de carrousels éducatifs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                    <span>Copywriting déjà fait, tu personnalises juste</span>
                  </li>
                </ul>
              </div>

              {/* Stories */}
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-200">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-lg">📖</span>
                  Stories
                </h3>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                    <span>20 séquences de stories pour vendre</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                    <span>Stratégie "Story to DM to Sale"</span>
                  </li>
                </ul>
              </div>

              {/* BONUS */}
              <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl p-4 border-2 border-yellow-400">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
                    BONUS
                  </span>
                </div>
                <ul className="space-y-1 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <Gift className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="font-medium">Calendrier de contenu 30 jours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Gift className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="font-medium">Guide "Poster sans se montrer"</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 rounded-b-3xl border-t border-gray-200">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setHasOrderBump(true);
                    setShowOrderBumpPopup(false);
                  }}
                  className="flex-1 py-3 px-6 bg-[#61f7a2] text-gray-900 font-bold rounded-xl hover:bg-[#4de88f] transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Ajouter au panier
                </button>
                <button
                  onClick={() => setShowOrderBumpPopup(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Non merci
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}