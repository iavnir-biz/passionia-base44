import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Search, 
  AlertCircle, 
  CheckCircle, 
  Target,
  Loader2,
  Sparkles,
  Heart,
  User as UserIcon,
  BarChart3
} from 'lucide-react';
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import GlowButton from '@/components/ui/GlowButton';

export default function MarketAnalysis() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const isNonEmpty = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return true;
    if (typeof value === 'boolean') return true;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return false;
  };

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (currentUser?.sessionId) {
        const sessions = await base44.entities.Session.filter({ id: currentUser.sessionId });
        if (sessions.length > 0) {
          const userSession = sessions[0];
          setSession(userSession);
          
          console.log('[MarketAnalysis] Session loaded:', userSession);
          console.log('[MarketAnalysis] market_validation:', userSession.market_validation);
          
          // 🔥 DB-first: lire depuis Session.market_validation
          if (isNonEmpty(userSession.market_validation)) {
            setAnalysis(userSession.market_validation);
          }
          
          // 🧪 QA CHECK (temporary)
          console.log('[DB-FIRST]', {
            page: 'MarketAnalysis',
            sessionId: currentUser.sessionId,
            hasData: isNonEmpty(userSession.market_validation)
          });
        } else {
          console.error('[MarketAnalysis] No session found for ID:', currentUser.sessionId);
        }
      } else {
        console.error('[MarketAnalysis] No sessionId on user:', currentUser);
      }
    } catch (error) {
      console.error('[MarketAnalysis] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!session?.id) {
      console.error('No session ID available');
      return;
    }
    
    setGenerating(true);
    try {
      console.log('Generating analysis for session:', session.id);
      const { data } = await base44.functions.invoke('generateMarketAnalysisV2', {
        sessionId: session.id
      });

      console.log('Generation response:', data);

      if (data.success) {
        setAnalysis(data.analysis);
        // Recharger la session pour confirmer la sauvegarde
        await loadData();
      } else {
        console.error('Generation failed:', data);
        alert('Erreur lors de la génération. Réessaie dans quelques instants.');
      }
    } catch (error) {
      console.error('Error generating analysis:', error);
      alert('Erreur lors de la génération. Réessaie dans quelques instants.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar currentPage="MarketAnalysis" />
        <div className="flex-1 ml-72">
          <div className="flex items-center justify-center h-screen">
            <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar currentPage="MarketAnalysis" />
      
      <div className="flex-1 ml-72">
        <TopBar 
          title="Analyse de marché" 
          subtitle=""
          user={user}
        />
        
        <main className="p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            {!analysis ? (
              <div className="py-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Comprends ton marché
                </h1>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  Noah va analyser qui a besoin de ton savoir, pourquoi, et comment ces personnes achètent aujourd'hui.
                </p>
                <div className="flex justify-center">
                  <GlowButton
                    onClick={handleGenerate}
                    loading={generating}
                    disabled={generating}
                    size="lg"
                  >
                    Lancer l'analyse
                  </GlowButton>
                </div>
              </motion.div>
              </div>
            ) : (
              <div className="space-y-8">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-left"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full mb-4">
                  <BarChart3 className="w-4 h-4 text-[#61f7a2]" />
                  <span className="text-xs font-medium text-gray-700">Analyse stratégique</span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  Analyse de marché
                </h1>
                <p className="text-gray-600 text-lg">
                  Comprendre qui a besoin de ton savoir, pourquoi, et comment ces personnes achètent aujourd'hui
                </p>
              </motion.div>

              {/* 1. Résumé Express */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#61f7a2] flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Validation rapide</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Le problème</p>
                    <p className="text-gray-900">{analysis.resume_express.probleme_principal}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Qui le vit</p>
                    <p className="text-gray-900">{analysis.resume_express.qui_vit_ce_probleme}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Pourquoi c'est réel</p>
                    <p className="text-gray-900">{analysis.resume_express.pourquoi_reel}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Pourquoi c'est monétisable</p>
                    <p className="text-gray-900">{analysis.resume_express.pourquoi_monetisable}</p>
                  </div>
                </div>
              </motion.div>

              {/* 2. Demande existante */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Search className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Signes concrets de demande</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Types de recherches</p>
                    <ul className="space-y-1">
                      {analysis.demande_existante.types_recherches.map((r, i) => (
                        <li key={i} className="text-gray-600 text-sm">• {r}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Questions récurrentes</p>
                    <ul className="space-y-1">
                      {analysis.demande_existante.questions_recurrentes.map((q, i) => (
                        <li key={i} className="text-gray-600 text-sm">• {q}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-gray-900 font-medium">{analysis.demande_existante.interpretation}</p>
                </div>
              </motion.div>

              {/* 3. Solutions actuelles */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Ce qui existe déjà</h2>
                </div>

                <div className="space-y-4 mb-6">
                  {analysis.solutions_actuelles.solutions.map((sol, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <p className="font-semibold text-gray-900 mb-2">{sol.type}</p>
                      <p className="text-gray-600 text-sm mb-2">✅ {sol.aide_comment}</p>
                      <p className="text-gray-600 text-sm">⚠️ {sol.limite}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <p className="text-gray-900 font-medium">{analysis.solutions_actuelles.conclusion}</p>
                </div>
              </motion.div>

              {/* 4. Frictions majeures */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Les vraies douleurs du marché</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="font-semibold text-blue-900 mb-2">🟦 Fonctionnelles</p>
                    <ul className="space-y-1">
                      {analysis.frictions_majeures.fonctionnelles.map((f, i) => (
                        <li key={i} className="text-gray-700 text-sm">• {f}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <p className="font-semibold text-purple-900 mb-2">🟪 Émotionnelles</p>
                    <ul className="space-y-1">
                      {analysis.frictions_majeures.emotionnelles.map((e, i) => (
                        <li key={i} className="text-gray-700 text-sm">• {e}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="font-semibold text-yellow-900 mb-2">🟨 Identitaires</p>
                    <ul className="space-y-1">
                      {analysis.frictions_majeures.identitaires.map((id, i) => (
                        <li key={i} className="text-gray-700 text-sm">• {id}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="font-semibold text-red-900 mb-2">🟥 Financières</p>
                    <ul className="space-y-1">
                      {analysis.frictions_majeures.financieres.map((fin, i) => (
                        <li key={i} className="text-gray-700 text-sm">• {fin}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* 5. Pourquoi ton savoir vaut */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-[#61f7a2]/10 to-green-50 border border-[#61f7a2]/30 rounded-2xl p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-[#61f7a2]" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Pourquoi ton savoir a de la valeur</h2>
                </div>

                <ul className="space-y-3 mb-6">
                  {analysis.pourquoi_ton_savoir_vaut.raisons.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#61f7a2] mt-0.5 flex-shrink-0" />
                      <span className="text-gray-900">{r}</span>
                    </li>
                  ))}
                </ul>

                <div className="bg-white border border-[#61f7a2]/30 rounded-xl p-4">
                  <p className="text-gray-900 font-bold text-lg">{analysis.pourquoi_ton_savoir_vaut.message_cle}</p>
                </div>
              </motion.div>

              {/* 6. Profils acheteurs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Qui peut acheter</h2>
                </div>

                <div className="space-y-4">
                  {analysis.profils_acheteurs.map((profil, i) => (
                    <div key={i} className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <UserIcon className="w-5 h-5 text-indigo-600" />
                        <p className="font-bold text-gray-900">{profil.type}</p>
                      </div>
                      <p className="text-gray-700 mb-2">{profil.description}</p>
                      <p className="text-gray-600 text-sm"><strong>Besoins :</strong> {profil.besoins}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* 7. Comportement d'achat */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Target className="w-6 h-6 text-orange-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Comment ils achètent</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <p className="font-semibold text-gray-900 mb-3">Déclencheurs</p>
                    <ul className="space-y-2">
                      {analysis.comportement_achat.declencheurs.map((d, i) => (
                        <li key={i} className="text-gray-600 text-sm">✅ {d}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900 mb-3">Freins</p>
                    <ul className="space-y-2">
                      {analysis.comportement_achat.freins.map((f, i) => (
                        <li key={i} className="text-gray-600 text-sm">⚠️ {f}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900 mb-3">Attentes</p>
                    <ul className="space-y-2">
                      {analysis.comportement_achat.attentes.map((a, i) => (
                        <li key={i} className="text-gray-600 text-sm">💡 {a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* 8. Maturité du marché */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">État du marché</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Niveau de maturité</p>
                    <p className="text-gray-900 text-lg font-bold capitalize">{analysis.maturite_marche.niveau}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">L'opportunité</p>
                    <p className="text-gray-900">{analysis.maturite_marche.opportunite}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Pourquoi maintenant</p>
                    <p className="text-gray-900">{analysis.maturite_marche.pourquoi_maintenant}</p>
                  </div>
                </div>
              </motion.div>

              {/* 9. Synthèse finale */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#61f7a2] flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold">Conclusion</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-300 mb-1">Ce qui est confirmé</p>
                    <p className="text-white">{analysis.synthese_finale.ce_qui_est_confirme}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-300 mb-1">Pourquoi c'est viable</p>
                    <p className="text-white">{analysis.synthese_finale.pourquoi_viable}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-300 mb-1">À quelles conditions</p>
                    <p className="text-white">{analysis.synthese_finale.conditions_simples}</p>
                  </div>
                  
                  <div className="bg-[#61f7a2]/20 border border-[#61f7a2] rounded-xl p-5 mt-6">
                    <p className="text-white font-bold text-lg">{analysis.synthese_finale.message_conclusion}</p>
                  </div>
                </div>
              </motion.div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}