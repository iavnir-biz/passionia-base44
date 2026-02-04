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
  Star
} from 'lucide-react';

export default function ProtocoleQuickwin() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const { data } = await base44.functions.invoke('createCheckoutChoice', {
        priceId: 'price_quickwin_67'
      });

      if (data.success && data.url) {
        window.top.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-4 px-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-[#61f7a2]" />
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
          <div className="p-8 md:p-10 relative">
            {/* Image coin supérieur droit */}
            <div className="absolute top-6 right-6 w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden shadow-lg hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
                alt="Entrepreneur"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="pr-0 md:pr-48">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                GÉNÉRATEUR COMPLET
              </h1>
              
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl md:text-5xl font-black text-[#61f7a2]">67€</span>
                <span className="text-gray-500 font-medium">ONE-TIME</span>
              </div>

              <p className="text-xl text-gray-700 font-medium">
                Votre première vente en moins de 7 jours
              </p>
            </div>
          </div>

          {/* Ce qui est inclus */}
          <div className="px-8 md:px-10 pb-8">
            <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                CE QUI EST INCLUS EXACTEMENT
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Dans le générateur IA - 100% personnalisé à votre profil
              </p>

              {/* 10 Générations */}
              <div className="mb-6">
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                  <span className="font-bold text-gray-900">10 GÉNÉRATIONS BUSINESS COMPLÈTES</span>
                </div>
                <ul className="ml-8 space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    Analyse de marché détaillée
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    3 avatars clients précis
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    4 offres structurées avec prix
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    4 messages de vente (angles différents)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    Page de vente rédigée (copy complet)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    8 emails marketing ready-to-send
                  </li>
                </ul>
              </div>

              {/* Plan d'action */}
              <div>
                <div className="flex items-start gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-gray-900">PLAN D'ACTION "PREMIÈRE VENTE"</span>
                    <p className="text-gray-600 mt-1">Guide jour par jour + scripts</p>
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