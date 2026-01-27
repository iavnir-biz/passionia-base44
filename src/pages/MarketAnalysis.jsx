import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useRequirePayment } from '@/components/hooks/useRequirePayment';
import { calculateProgressFromSession } from '@/utils/progressUtils';
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
  BarChart3,
  Brain,
  TrendingDown,
  Shield,
  Zap
} from 'lucide-react';
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import GlowButton from '@/components/ui/GlowButton';

export default function MarketAnalysis() {
  const { isAuthenticated, hasPurchased, isLoading: authLoading, user: authUser } = useRequirePayment();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

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
          console.log('[MarketAnalysis] complete_market_analysis:', userSession.complete_market_analysis);

          // 🔥 Lire depuis Session.complete_market_analysis (persistance garantie)
          if (isNonEmpty(userSession.complete_market_analysis)) {
            setAnalysis(userSession.complete_market_analysis);
          }
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

  const handleGenerate = async (forceRegenerate = false) => {
    if (!session?.id) {
      console.error('No session ID available');
      return;
    }

    setGenerating(true);
    try {
      console.log('[MarketAnalysis] Generating analysis for session:', session.id, 'force:', forceRegenerate);
      const { data } = await base44.functions.invoke('generateMarketAnalysisV2', {
        sessionId: session.id,
        force: forceRegenerate
      });

      console.log('[MarketAnalysis] Generation response:', data);

      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        // Recharger la session pour confirmer la sauvegarde
        await loadData();
      } else {
        console.error('Generation failed:', data);
        alert('Erreur lors de la génération. Réessaie dans quelques instants.');
      }
    } catch (error) {
      console.error('[MarketAnalysis] Error generating analysis:', error);
      alert('Erreur lors de la génération. Réessaie dans quelques instants.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white overflow-x-hidden">
      <Sidebar
        currentPage="MarketAnalysis"
        progress={calculateProgressFromSession(session)}
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 ml-0 lg:ml-72 w-full">
        <TopBar
          user={user}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="p-4 lg:p-8">
          <div className="max-w-5xl mx-auto space-y-6 lg:space-y-8">
            {!analysis ? (
              // 🔥 État vide - Bouton de génération
              <div className="py-20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-12"
                >
                  {/* Icon Noah */}
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                      rotate: [0, 2, -2, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] shadow-2xl mb-6 relative"
                  >
                    <Brain className="w-12 h-12 text-white" />

                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute inset-0 rounded-3xl border-2 border-[#61f7a2]"
                        initial={{ scale: 1, opacity: 0.6 }}
                        animate={{
                          scale: [1, 1.4, 1.8],
                          opacity: [0.6, 0.3, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.6,
                          ease: "easeOut"
                        }}
                      />
                    ))}
                  </motion.div>

                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Comprends ton marché en profondeur
                  </h1>
                  <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
                    Noah va analyser qui a besoin de ton savoir, pourquoi ces personnes sont prêtes à payer,
                    et comment structurer ton offre pour maximiser tes chances de succès.
                  </p>

                  {/* Ce qui sera généré */}
                  <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-6 mb-8 max-w-2xl mx-auto text-left border border-blue-100">
                    <h3 className="font-bold text-gray-900 mb-4 text-center">📊 Ce que tu vas obtenir :</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Validation du problème que tu résous</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Profil détaillé de qui achète</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Analyse SWOT complète (Forces, Faiblesses, Opportunités, Menaces)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Positionnement optimal sur ton marché</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Stratégies concrètes pour te démarquer</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex justify-center">
                    <GlowButton
                      onClick={handleGenerate}
                      loading={generating}
                      disabled={generating}
                      size="lg"
                      icon={Brain}
                      className=""
                    >
                      {generating ? 'Noah analyse ton marché...' : 'Générer avec Noah'}
                    </GlowButton>
                  </div>

                  {generating && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-gray-500 mt-4"
                    >
                      Ça prend environ 30-60 secondes...
                    </motion.p>
                  )}
                </motion.div>
              </div>
            ) : (
              // 🔥 Analyse générée - Affichage complet
              <div className="space-y-8">
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-left"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full mb-4">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-green-700">Analyse complète</span>
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-3">
                    Analyse de marché
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Comprendre qui a besoin de ton savoir, pourquoi, et comment ces personnes achètent aujourd'hui
                  </p>
                </motion.div>

                {/* 1. Vue d'ensemble du marché */}
                {analysis?.marketOverview && (
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
                      <h2 className="text-2xl font-bold text-gray-900">Vue d'ensemble du marché</h2>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Définition</p>
                        <p className="text-gray-900">{analysis.marketOverview.definition}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Taille du marché cible</p>
                        <p className="text-gray-900">{analysis.marketOverview.targetMarketSize}</p>
                      </div>
                      {analysis.marketOverview.trends && analysis.marketOverview.trends.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">Tendances actuelles</p>
                          <ul className="space-y-1">
                            {analysis.marketOverview.trends.map((trend, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-gray-900">
                                <span className="text-[#61f7a2] mt-1">•</span>
                                <span>{trend}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Niveau de maturité</p>
                        <span className="inline-flex px-3 py-1 bg-white rounded-lg text-gray-900 font-medium">
                          {analysis.marketOverview.maturityLevel}
                        </span>
                      </div>
                      {analysis.marketOverview.summary && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Résumé</p>
                          <p className="text-gray-900 whitespace-pre-line">{analysis.marketOverview.summary}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 2. SWOT Analysis */}
                {analysis?.swot && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-[#61f7a2]" />
                      Analyse SWOT
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Forces */}
                      {analysis.swot.strengths && analysis.swot.strengths.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                              <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Forces</h3>
                          </div>
                          <div className="space-y-4">
                            {analysis.swot.strengths.map((strength, idx) => (
                              <div key={idx} className="space-y-1">
                                <div className="flex items-start gap-2">
                                  <span className="text-green-600 mt-1 font-bold">✓</span>
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900">{strength.title}</p>
                                    <p className="text-sm text-gray-700 mt-1">{strength.description}</p>
                                    {strength.impact && (
                                      <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${strength.impact === 'Fort' ? 'bg-green-200 text-green-800' :
                                        strength.impact === 'Moyen' ? 'bg-green-100 text-green-700' :
                                          'bg-green-50 text-green-600'
                                        }`}>
                                        Impact: {strength.impact}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Faiblesses */}
                      {analysis.swot.weaknesses && analysis.swot.weaknesses.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0">
                              <TrendingDown className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Faiblesses</h3>
                          </div>
                          <div className="space-y-4">
                            {analysis.swot.weaknesses.map((weakness, idx) => (
                              <div key={idx} className="space-y-1">
                                <div className="flex items-start gap-2">
                                  <span className="text-red-600 mt-1 font-bold">!</span>
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900">{weakness.title}</p>
                                    <p className="text-sm text-gray-700 mt-1">{weakness.description}</p>
                                    {weakness.impact && (
                                      <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${weakness.impact === 'Fort' ? 'bg-red-200 text-red-800' :
                                        weakness.impact === 'Moyen' ? 'bg-red-100 text-red-700' :
                                          'bg-red-50 text-red-600'
                                        }`}>
                                        Impact: {weakness.impact}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Opportunités */}
                      {analysis.swot.opportunities && analysis.swot.opportunities.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                              <Zap className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Opportunités</h3>
                          </div>
                          <div className="space-y-4">
                            {analysis.swot.opportunities.map((opportunity, idx) => (
                              <div key={idx} className="space-y-1">
                                <div className="flex items-start gap-2">
                                  <span className="text-blue-600 mt-1 font-bold">→</span>
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900">{opportunity.title}</p>
                                    <p className="text-sm text-gray-700 mt-1">{opportunity.description}</p>
                                    {opportunity.impact && (
                                      <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${opportunity.impact === 'Fort' ? 'bg-blue-200 text-blue-800' :
                                        opportunity.impact === 'Moyen' ? 'bg-blue-100 text-blue-700' :
                                          'bg-blue-50 text-blue-600'
                                        }`}>
                                        Impact: {opportunity.impact}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Menaces */}
                      {analysis.swot.threats && analysis.swot.threats.length > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                              <Shield className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Menaces</h3>
                          </div>
                          <div className="space-y-4">
                            {analysis.swot.threats.map((threat, idx) => (
                              <div key={idx} className="space-y-1">
                                <div className="flex items-start gap-2">
                                  <span className="text-orange-600 mt-1 font-bold">⚠</span>
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900">{threat.title}</p>
                                    <p className="text-sm text-gray-700 mt-1">{threat.description}</p>
                                    {threat.impact && (
                                      <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${threat.impact === 'Fort' ? 'bg-orange-200 text-orange-800' :
                                        threat.impact === 'Moyen' ? 'bg-orange-100 text-orange-700' :
                                          'bg-orange-50 text-orange-600'
                                        }`}>
                                        Impact: {threat.impact}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 3. Positionnement et Concurrence */}
                {analysis?.competition && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Positionnement recommandé */}
                    {analysis.competition.positioning && (
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
                            <Target className="w-6 h-6 text-white" />
                          </div>
                          <h2 className="text-2xl font-bold text-gray-900">Ton positionnement optimal</h2>
                        </div>
                        <p className="text-gray-900 whitespace-pre-line leading-relaxed">
                          {analysis.competition.positioning}
                        </p>
                      </div>
                    )}

                    {/* Concurrents directs */}
                    {analysis.competition.directCompetitors && analysis.competition.directCompetitors.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-2xl p-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Users className="w-5 h-5 text-[#61f7a2]" />
                          Concurrents directs
                        </h3>
                        <div className="space-y-4">
                          {analysis.competition.directCompetitors.map((competitor, idx) => (
                            <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                              <div className="flex items-start justify-between mb-2">
                                <p className="font-bold text-gray-900">{competitor.name}</p>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${competitor.marketShare === 'Importante' ? 'bg-red-100 text-red-700' :
                                  competitor.marketShare === 'Moyenne' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                  Part de marché: {competitor.marketShare}
                                </span>
                              </div>
                              <p className="text-gray-700 text-sm mb-2">{competitor.offering}</p>
                              <p className="text-gray-600 text-sm mb-2">
                                <span className="font-semibold">Prix:</span> {competitor.priceRange}
                              </p>
                              <div className="grid md:grid-cols-2 gap-3 mt-3">
                                <div>
                                  <p className="text-xs font-semibold text-green-700 mb-1">Forces:</p>
                                  <ul className="space-y-1">
                                    {competitor.strengths?.map((str, i) => (
                                      <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                                        <span className="text-green-600">+</span>
                                        <span>{str}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-red-700 mb-1">Faiblesses:</p>
                                  <ul className="space-y-1">
                                    {competitor.weaknesses?.map((weak, i) => (
                                      <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                                        <span className="text-red-600">-</span>
                                        <span>{weak}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Concurrents indirects */}
                    {analysis.competition.indirectCompetitors && analysis.competition.indirectCompetitors.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-2xl p-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Solutions alternatives</h3>
                        <div className="space-y-3">
                          {analysis.competition.indirectCompetitors.map((competitor, idx) => (
                            <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                              <p className="font-semibold text-gray-900 mb-1">{competitor.type}</p>
                              <p className="text-sm text-gray-700">{competitor.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 4. Public Cible */}
                {analysis?.targetAudience?.segments && analysis.targetAudience.segments.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white border border-gray-200 rounded-2xl p-8"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Segments de public cible</h2>
                    </div>

                    <div className="space-y-4">
                      {analysis.targetAudience.segments.map((segment, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border-2 ${segment.priority === 'Primaire' ? 'bg-green-50 border-green-300' :
                          segment.priority === 'Secondaire' ? 'bg-blue-50 border-blue-300' :
                            'bg-gray-50 border-gray-300'
                          }`}>
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-bold text-gray-900">{segment.name}</h3>
                            <div className="flex gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${segment.priority === 'Primaire' ? 'bg-green-200 text-green-800' :
                                segment.priority === 'Secondaire' ? 'bg-blue-200 text-blue-800' :
                                  'bg-gray-200 text-gray-800'
                                }`}>
                                {segment.priority}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium bg-white text-gray-700`}>
                                Taille: {segment.size}
                              </span>
                            </div>
                          </div>

                          {segment.characteristics && segment.characteristics.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-semibold text-gray-700 mb-1">Caractéristiques:</p>
                              <ul className="space-y-1">
                                {segment.characteristics.map((char, i) => (
                                  <li key={i} className="text-sm text-gray-700 flex items-start gap-1">
                                    <span className="text-[#61f7a2]">•</span>
                                    <span>{char}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4 mt-3">
                            <div>
                              <p className="text-xs font-semibold text-gray-700">Niveau de douleur</p>
                              <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${segment.painLevel === 'Élevé' ? 'bg-red-100 text-red-700' :
                                segment.painLevel === 'Moyen' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                {segment.painLevel}
                              </span>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-700">Disposition à payer</p>
                              <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${segment.willingnessToPay === 'Élevée' ? 'bg-green-100 text-green-700' :
                                segment.willingnessToPay === 'Moyenne' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                {segment.willingnessToPay}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 5. Barrières à l'entrée */}
                {analysis?.barriers && analysis.barriers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white border border-gray-200 rounded-2xl p-8"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Barrières à l'entrée</h2>
                    </div>

                    <div className="space-y-4">
                      {analysis.barriers.map((barrier, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-bold text-gray-900">{barrier.barrier}</p>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${barrier.difficulty === 'Difficile' ? 'bg-red-100 text-red-700' :
                              barrier.difficulty === 'Modérée' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                              {barrier.difficulty}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{barrier.description}</p>
                          <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                            <p className="text-xs font-semibold text-gray-700 mb-1">Comment surmonter:</p>
                            <p className="text-sm text-gray-900">{barrier.mitigation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 6. Stratégie de Prix */}
                {analysis?.pricingStrategy && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-8"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Stratégie de Prix</h2>
                    </div>

                    {analysis.pricingStrategy.marketRanges && (
                      <div className="space-y-4 mb-6">
                        <div className="p-4 bg-white rounded-xl">
                          <p className="font-bold text-gray-900 mb-1">Fourchette basse</p>
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Prix:</span> {analysis.pricingStrategy.marketRanges.low?.range}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Exemples:</span> {analysis.pricingStrategy.marketRanges.low?.examples}
                          </p>
                        </div>
                        <div className="p-4 bg-white rounded-xl">
                          <p className="font-bold text-gray-900 mb-1">Fourchette moyenne</p>
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Prix:</span> {analysis.pricingStrategy.marketRanges.mid?.range}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Exemples:</span> {analysis.pricingStrategy.marketRanges.mid?.examples}
                          </p>
                        </div>
                        <div className="p-4 bg-white rounded-xl">
                          <p className="font-bold text-gray-900 mb-1">Fourchette haute</p>
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Prix:</span> {analysis.pricingStrategy.marketRanges.high?.range}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Exemples:</span> {analysis.pricingStrategy.marketRanges.high?.examples}
                          </p>
                        </div>
                      </div>
                    )}

                    {analysis.pricingStrategy.recommendedPositioning && (
                      <div className="p-4 bg-white rounded-xl mb-4">
                        <p className="font-bold text-gray-900 mb-2">Positionnement recommandé</p>
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          {analysis.pricingStrategy.recommendedPositioning}
                        </p>
                      </div>
                    )}

                    {analysis.pricingStrategy.priceSensitivity && (
                      <div className="p-4 bg-white rounded-xl">
                        <p className="font-bold text-gray-900 mb-1">Sensibilité au prix</p>
                        <span className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${analysis.pricingStrategy.priceSensitivity === 'Élevée' ? 'bg-red-100 text-red-700' :
                          analysis.pricingStrategy.priceSensitivity === 'Moyenne' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                          {analysis.pricingStrategy.priceSensitivity}
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 7. Canaux de Distribution */}
                {analysis?.distributionChannels && analysis.distributionChannels.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white border border-gray-200 rounded-2xl p-8"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-[#61f7a2] flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Canaux de Distribution Recommandés</h2>
                    </div>

                    <div className="space-y-4">
                      {analysis.distributionChannels
                        .sort((a, b) => {
                          const priorityOrder = { 'Haute': 1, 'Moyenne': 2, 'Basse': 3 };
                          return priorityOrder[a.priority] - priorityOrder[b.priority];
                        })
                        .map((channel, idx) => (
                          <div key={idx} className={`p-4 rounded-xl border-2 ${channel.priority === 'Haute' ? 'bg-green-50 border-green-300' :
                            channel.priority === 'Moyenne' ? 'bg-blue-50 border-blue-300' :
                              'bg-gray-50 border-gray-300'
                            }`}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{idx + 1}</span>
                                <h3 className="font-bold text-gray-900">{channel.channel}</h3>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${channel.priority === 'Haute' ? 'bg-green-200 text-green-800' :
                                channel.priority === 'Moyenne' ? 'bg-blue-200 text-blue-800' :
                                  'bg-gray-200 text-gray-800'
                                }`}>
                                {channel.priority}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-3">{channel.description}</p>

                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <p className="text-xs font-semibold text-gray-700 mb-1">Difficulté</p>
                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${channel.difficulty === 'Difficile' ? 'bg-red-100 text-red-700' :
                                  channel.difficulty === 'Modérée' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                  {channel.difficulty}
                                </span>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-700 mb-1">Coût</p>
                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${channel.cost === 'Coûteux' ? 'bg-red-100 text-red-700' :
                                  channel.cost === 'Peu coûteux' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                  {channel.cost}
                                </span>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-700 mb-1">Délai</p>
                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${channel.timeToResults === 'Long terme' ? 'bg-red-100 text-red-700' :
                                  channel.timeToResults === 'Moyen terme' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                  {channel.timeToResults}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </motion.div>
                )}

                {/* 8. Risques et Mitigation */}
                {analysis?.risks && analysis.risks.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-white border border-gray-200 rounded-2xl p-8"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Risques et Plan d'Atténuation</h2>
                    </div>

                    <div className="space-y-4">
                      {analysis.risks.map((risk, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-bold text-gray-900 flex-1">{risk.risk}</p>
                            <div className="flex gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${risk.probability === 'Élevée' ? 'bg-red-100 text-red-700' :
                                risk.probability === 'Moyenne' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                P: {risk.probability}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${risk.impact === 'Élevé' ? 'bg-red-100 text-red-700' :
                                risk.impact === 'Moyen' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                I: {risk.impact}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                            <p className="text-xs font-semibold text-gray-700 mb-1">Plan d'atténuation:</p>
                            <p className="text-sm text-gray-900">{risk.mitigation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Bouton regénérer (optionnel) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center pt-4"
                >
                  <button
                    onClick={() => handleGenerate(true)}
                    disabled={generating}
                    className="text-gray-500 hover:text-gray-700 text-sm underline transition-colors"
                  >
                    {generating ? 'Régénération en cours...' : 'Régénérer l\'analyse'}
                  </button>
                </motion.div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}