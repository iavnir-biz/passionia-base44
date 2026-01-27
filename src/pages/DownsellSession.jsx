import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Target,
  MessageCircle,
  FileCheck,
  Shield,
  CheckCircle,
  Loader2,
  Clock,
  Gift,
  X,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

export default function DownsellSession() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  // Données dynamiques
  const firstName = user?.firstName || user?.full_name?.split(' ')[0] || 'Toi';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const sessions = await base44.entities.Session.filter({ created_by: currentUser.email });

      if (sessions.length > 0) {
        const userSession = sessions[0];
        setSession(userSession);

        // Si l'utilisateur a déjà vu/accepté l'upsell, redirect
        if (userSession.upsell_accepted === true || userSession.downsell_accepted === true) {
          console.log('[DownsellSession] Already purchased, redirecting to Dashboard');
          navigate(createPageUrl('Dashboard'));
          return;
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDownsell = async () => {
    setIsCreatingCheckout(true);
    try {
      const { data } = await base44.functions.invoke('createCheckoutDownsell', {
        sessionId: session?.id,
        downsellPrice: 19700,
        type: 'session_declic'
      });

      if (data?.url) {
        window.top.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Erreur lors de la redirection vers le paiement');
      setIsCreatingCheckout(false);
    }
  };

  const handleDeclineDownsell = async () => {
    try {
      // Sauvegarder le refus total dans la session
      if (session) {
        await base44.entities.Session.update(session.id, {
          has_seen_upsell: true,
          has_seen_downsell: true,
          downsell_refused_at: new Date().toISOString()
        });
      }
      localStorage.removeItem('upsell_timer_start');
      console.log('[DownsellSession] Downsell declined, redirecting to Dashboard');
      navigate(createPageUrl('Dashboard'));
    } catch (error) {
      console.error('Error declining downsell:', error);
      navigate(createPageUrl('Dashboard'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const inclusions = [
    {
      icon: Target,
      iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      title: '1 Session strategique de 45 min',
      details: [
        'Audit complet de ton offre et positionnement',
        'Validation de ta cible et de ton pricing',
        "Plan d'action clair pour tes 30 prochains jours",
        'Tu repars avec une roadmap concrete'
      ]
    },
    {
      icon: MessageCircle,
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      title: '14 jours de support WhatsApp',
      details: [
        'Pose tes questions apres la session',
        'Feedback sur tes premieres actions',
        'Deblocage si tu es coince',
        'On reste disponibles 2 semaines'
      ]
    },
    {
      icon: FileCheck,
      iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600',
      title: '1 Revue de document incluse',
      details: [
        'Envoie-nous ta page de vente OU ton message de prospection',
        'On te fait un retour detaille ecrit',
        'Corrections et suggestions concretes'
      ]
    }
  ];

  const comparatif = [
    { feature: 'Sessions', vip: '3 x 45 min', declic: '1 x 45 min' },
    { feature: 'WhatsApp', vip: '30 jours', declic: '14 jours' },
    { feature: 'Creation tech', vip: true, declic: false },
    { feature: 'Revues', vip: 'Illimitees', declic: '1 document' },
    { feature: 'Roadmap', vip: 'Complete', declic: 'Simplifiee' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-white py-8 px-4 overflow-y-auto">
      <div className="max-w-3xl mx-auto">

        {/* SECTION 1: HEADER DOWNSELL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Attends {firstName} — On comprend.
          </h1>

          <div className="text-lg text-gray-600 max-w-2xl mx-auto space-y-3">
            <p>
              497€, c'est un investissement. Et peut-etre que tu n'as pas besoin de tout l'accompagnement VIP pour demarrer.
            </p>
            <p className="text-base">
              Mais partir sans <strong className="text-gray-800">AUCUN accompagnement</strong> ? C'est le meilleur moyen de rejoindre les 90% qui n'obtiennent jamais de resultats.
            </p>
            <p className="text-emerald-600 font-medium">
              On a une solution intermediaire pour toi...
            </p>
          </div>
        </motion.div>

        {/* SECTION 2: CARD OFFRE DOWNSELL */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative bg-white rounded-3xl border-2 border-blue-300 shadow-2xl overflow-hidden mb-8"
        >
          {/* Badge */}
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
              <Target className="w-3 h-3" />
              DERNIERE CHANCE - OFFRE ALLEGEE
            </div>
          </div>

          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-6 border-b border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-8 h-8 text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-900">
                Session Declic + 14 jours de support
              </h2>
            </div>
            <p className="text-lg text-gray-700 font-medium">avec Alfred & Damien</p>
            <p className="text-gray-600 mt-2">
              L'essentiel pour valider ton offre et partir sur de bonnes bases.<br />
              <strong>Sans l'engagement du coaching complet.</strong>
            </p>
          </div>

          {/* SECTION 3: CE QUI EST INCLUS */}
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ce qui est inclus :</h3>

            {inclusions.map((item, idx) => (
              <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {item.title}
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {item.details.map((detail, detailIdx) => (
                      <li key={detailIdx} className="flex items-start gap-2">
                        <span className="text-gray-400 mt-1">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* SECTION 4: COMPARATIF VISUEL */}
          <div className="mx-6 mb-6 p-5 bg-gray-50 rounded-2xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Comparatif</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-gray-500"></th>
                    <th className="text-center py-3 px-2">
                      <div className="font-bold text-gray-900">Coaching VIP</div>
                      <div className="text-xs text-gray-500">(497€)</div>
                    </th>
                    <th className="text-center py-3 px-2 bg-blue-50 rounded-t-lg">
                      <div className="font-bold text-blue-600">Session Declic</div>
                      <div className="text-xs text-blue-500">(197€)</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparatif.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-3 px-2 font-medium text-gray-700">{row.feature}</td>
                      <td className="py-3 px-2 text-center text-gray-600">
                        {typeof row.vip === 'boolean' ? (
                          row.vip ? (
                            <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 mx-auto" />
                          )
                        ) : (
                          row.vip
                        )}
                      </td>
                      <td className="py-3 px-2 text-center text-gray-600 bg-blue-50">
                        {typeof row.declic === 'boolean' ? (
                          row.declic ? (
                            <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 mx-auto" />
                          )
                        ) : (
                          row.declic
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center gap-4 mt-4">
              <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full">COMPLET</span>
              <span className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-medium">ESSENTIEL</span>
            </div>
          </div>

          {/* SECTION 5: PRIX DOWNSELL */}
          <div className="mx-6 mb-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Valeur de cette formule : 397€</p>

              <p className="text-sm font-medium text-gray-700 mb-2">🎁 TON PRIX AUJOURD'HUI :</p>

              <p className="text-5xl font-bold text-blue-500 mb-4">197€</p>

              <div className="inline-flex items-center gap-2 bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-full">
                <Gift className="w-4 h-4" />
                Tu economises 200€
              </div>
            </div>
          </div>
        </motion.div>

        {/* SECTION 6: URGENCE DOWNSELL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mb-6"
        >
          <div className="text-center p-5 rounded-2xl border-2 bg-amber-50 border-amber-300">
            <div className="flex items-center justify-center gap-2 text-amber-700 mb-2">
              <Clock className="w-5 h-5" />
              <span className="font-bold">Cette offre est uniquement disponible MAINTENANT.</span>
            </div>
            <p className="text-sm text-amber-600">
              Si tu quittes cette page, tu ne reverras plus jamais ce prix.
            </p>
          </div>
        </motion.div>

        {/* SECTION 7: CTA DOWNSELL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-4 mb-6"
        >
          {/* CTA Principal */}
          <motion.button
            onClick={handleAcceptDownsell}
            disabled={isCreatingCheckout}
            className="w-full py-5 px-8 rounded-2xl text-lg font-bold transition-all duration-300 flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg hover:shadow-blue-300/50 hover:scale-[1.02] active:scale-[0.98]"
            animate={!isCreatingCheckout ? {
              boxShadow: ['0 0 20px rgba(59, 130, 246, 0.3)', '0 0 40px rgba(59, 130, 246, 0.5)', '0 0 20px rgba(59, 130, 246, 0.3)']
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {isCreatingCheckout ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <CheckCircle className="w-6 h-6" />
            )}
            {isCreatingCheckout ? 'Redirection...' : 'OUI, je prends la Session Declic — 197€'}
          </motion.button>

          {/* CTA Secondaire - vers Dashboard */}
          <button
            onClick={handleDeclineDownsell}
            disabled={isCreatingCheckout}
            className="w-full py-3 px-6 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all text-sm"
          >
            Non merci, je me lance vraiment seul →
          </button>
        </motion.div>

        {/* Garanties */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-wrap justify-center gap-6 text-sm text-gray-500"
        >
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-blue-500" />
            <span>Paiement securise</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-blue-500" />
            <span>Satisfait ou rembourse 14 jours</span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
