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

  const handleGenerate = async () => {
    if (!session?.id) {
      console.error('No session ID available');
      return;
    }
    
    setGenerating(true);
    try {
      console.log('[MarketAnalysis] Generating analysis for session:', session.id);
      const { data } = await base44.functions.invoke('generateMarketAnalysisV2', {
        sessionId: session.id
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
          subtitle="Comprendre qui a besoin de ton savoir, pourquoi, et comment ces personnes achètent aujourd'hui"
          user={user}
        />
        
        <main className="p-8">
          <div className="max-w-5xl mx-auto space-y-8">
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

                {/* 1. Résumé Express */}
                {analysis?.resume_express && (
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
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Forces */}
                      <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">Forces</h3>
                        </div>
                        <ul className="space-y-2">
                          {analysis.swot.forces?.map((force, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-700">
                              <span className="text-green-600 mt-1">✓</span>
                              <span>{force}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Faiblesses */}
                      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
                            <TrendingDown className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">Faiblesses</h3>
                        </div>
                        <ul className="space-y-2">
                          {analysis.swot.faiblesses?.map((faiblesse, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-700">
                              <span className="text-red-600 mt-1">!</span>
                              <span>{faiblesse}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Opportunités */}
                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">Opportunités</h3>
                        </div>
                        <ul className="space-y-2">
                          {analysis.swot.opportunites?.map((opp, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-700">
                              <span className="text-blue-600 mt-1">→</span>
                              <span>{opp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Menaces */}
                      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">Menaces</h3>
                        </div>
                        <ul className="space-y-2">
                          {analysis.swot.menaces?.map((menace, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-700">
                              <span className="text-orange-600 mt-1">⚠</span>
                              <span>{menace}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 3. Positionnement */}
                {analysis?.positionnement && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-8"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Ton positionnement optimal</h2>
                    </div>
                    
                    {analysis.positionnement.angle_unique && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Angle unique</p>
                        <p className="text-gray-900 text-lg">{analysis.positionnement.angle_unique}</p>
                      </div>
                    )}
                    
                    {analysis.positionnement.differentiation && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Comment te différencier</p>
                        <p className="text-gray-900">{analysis.positionnement.differentiation}</p>
                      </div>
                    )}

                    {analysis.positionnement.message_cle && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Message clé</p>
                        <p className="text-gray-900 font-medium">{analysis.positionnement.message_cle}</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 4. Stratégies concrètes */}
                {analysis?.strategies && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white border border-gray-200 rounded-2xl p-8"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Stratégies concrètes</h2>
                    </div>
                    
                    <div className="space-y-4">
                      {analysis.strategies.map((strategie, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                          <div className="w-8 h-8 rounded-lg bg-[#61f7a2] flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">{idx + 1}</span>
                          </div>
                          <div>
                            <p className="text-gray-900 font-medium mb-1">{strategie.titre}</p>
                            <p className="text-gray-600 text-sm">{strategie.description}</p>
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
                    onClick={handleGenerate}
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