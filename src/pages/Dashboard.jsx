import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useRequirePayment } from '@/components/hooks/useRequirePayment';
import { useSessionManager } from '@/components/hooks/useSessionManager';
import { calculateProgressFromSession, getCurrentDay } from '@/utils/progressUtils';
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  ArrowRight,
  CheckCircle,
  User,
  MessageCircle,
  Send,
  Package,
  Users,
  FileText,
  Loader2,
  Clock,
  Sparkles,
  Plus,
  Lock,
  ChevronDown,
  Download,
  DollarSign,
  Heart,
  Zap,
  TrendingUp
} from "lucide-react";
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import ProgressBar from '@/components/ui/ProgressBar';
import GlowButton from '@/components/ui/GlowButton';
import SessionCard from '@/components/sessions/SessionCard';
import SessionCounter from '@/components/sessions/SessionCounter';
import SessionPaywallModal from '@/components/sessions/SessionPaywallModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, hasPurchased, isLoading: authLoading } = useRequirePayment();

  const {
    sessions,
    activeSessionId,
    activeSession,
    loading: sessionsLoading,
    current,
    max,
    has_purchased: isPaid,
    canCreate,
    loadSessions,
    createSession,
    renameSession,
    switchSession
  } = useSessionManager();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [fullSession, setFullSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallType, setPaywallType] = useState('upgrade_required');

  // Session view mode
  const [viewMode, setViewMode] = useState('detail'); // 'detail' | 'grid'

  // Onboarding recap toggle
  const [showOnboardingRecap, setShowOnboardingRecap] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated]);

  // Load full session data when activeSessionId changes
  useEffect(() => {
    if (activeSessionId) {
      loadFullSession(activeSessionId);
    }
  }, [activeSessionId]);

  // Polling si generation en cours
  useEffect(() => {
    if (fullSession?.generation_in_progress) {
      const interval = setInterval(() => {
        loadFullSession(activeSessionId);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [fullSession?.generation_in_progress, activeSessionId]);

  const loadUserData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const profiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      }

      if (profiles.length === 0 || !profiles[0].first_name) {
        navigate(createPageUrl('SetupProfile') + '?redirect=Dashboard');
        return;
      }
    } catch (error) {
      console.error('[Dashboard] Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFullSession = useCallback(async (sessionId) => {
    if (!sessionId) return;
    try {
      const sessions = await base44.entities.Session.filter({ id: sessionId });
      if (sessions.length > 0) {
        setFullSession(sessions[0]);
      }
    } catch (err) {
      console.error('[Dashboard] Error loading full session:', err);
    }
  }, []);

  // Session actions
  const handleCreateSession = async () => {
    if (!canCreate) {
      setPaywallType(isPaid ? 'limit_reached' : 'upgrade_required');
      setPaywallOpen(true);
      return;
    }

    const result = await createSession();
    if (result.success) {
      navigate(createPageUrl('OnboardingFirstName'));
    } else if (result.error === 'upgrade_required') {
      setPaywallType('upgrade_required');
      setPaywallOpen(true);
    } else if (result.error === 'limit_reached') {
      setPaywallType('limit_reached');
      setPaywallOpen(true);
    }
  };

  const handleSelectSession = (sessionId) => {
    switchSession(sessionId);
    setViewMode('detail');
  };

  // Download all documents
  const handleDownloadAll = () => {
    if (!fullSession) return;

    const sections = [];
    const sessionName = activeSession?.session_name || 'Session';
    const skill = fullSession.skill || fullSession.onboarding_full?.coreSkill || '';

    sections.push(`=== ${sessionName} - Documents generes par Noah ===`);
    sections.push(`Competence : ${skill}`);
    sections.push(`Date : ${new Date().toLocaleDateString('fr-FR')}`);
    sections.push('');

    // SWOT
    if (fullSession.complete_market_analysis) {
      sections.push('━━━ ANALYSE SWOT ━━━');
      const ma = fullSession.complete_market_analysis;
      if (ma.market_overview) {
        sections.push(`Marche : ${ma.market_overview.definition || ''}`);
        sections.push(`Taille : ${ma.market_overview.size || ''}`);
      }
      if (ma.swot) {
        sections.push(`Forces : ${(ma.swot.strengths || []).map(s => s.text || s).join(', ')}`);
        sections.push(`Faiblesses : ${(ma.swot.weaknesses || []).map(s => s.text || s).join(', ')}`);
        sections.push(`Opportunites : ${(ma.swot.opportunities || []).map(s => s.text || s).join(', ')}`);
        sections.push(`Menaces : ${(ma.swot.threats || []).map(s => s.text || s).join(', ')}`);
      }
      sections.push('');
    }

    // Avatars
    if (fullSession.generated_avatars) {
      sections.push('━━━ AVATARS CLIENTS ━━━');
      const avatars = Array.isArray(fullSession.generated_avatars) ? fullSession.generated_avatars : [];
      avatars.forEach((a, i) => {
        sections.push(`\nAvatar ${i + 1} : ${a.identity?.name || a.name || `Avatar ${i + 1}`}`);
        if (a.identity) {
          sections.push(`  Age : ${a.identity.age_range || ''}`);
          sections.push(`  Situation : ${a.identity.life_situation || ''}`);
        }
        if (a.in_their_head) {
          sections.push(`  Emotion dominante : ${a.in_their_head.dominant_emotion || ''}`);
          sections.push(`  Phrase interieure : ${a.in_their_head.inner_phrase || ''}`);
        }
      });
      sections.push('');
    }

    // Offres
    if (fullSession.finalized_offer) {
      sections.push('━━━ OFFRES ━━━');
      const offer = fullSession.finalized_offer;
      if (offer.mainProduct) {
        sections.push(`Offre principale : ${offer.mainProduct.title || ''}`);
        sections.push(`  Prix : ${offer.mainProduct.price || ''}`);
        sections.push(`  Description : ${offer.mainProduct.subtitle || ''}`);
      }
      if (offer.orderBump) {
        sections.push(`Order Bump : ${offer.orderBump.title || ''} - ${offer.orderBump.price || ''}`);
      }
      if (offer.upsells) {
        offer.upsells.forEach((u, i) => {
          sections.push(`Upsell ${i + 1} : ${u.title || ''} - ${u.price || ''}`);
        });
      }
      sections.push('');
    }

    // Messages
    if (fullSession.generated_sales_messages) {
      sections.push('━━━ MESSAGES DE VENTE ━━━');
      const msgs = Array.isArray(fullSession.generated_sales_messages) ? fullSession.generated_sales_messages : [];
      msgs.forEach((m, i) => {
        sections.push(`\nMessage ${i + 1} : ${m.title || m.name || ''}`);
        sections.push(`Objectif : ${m.objective || ''}`);
        sections.push(`Contenu :`);
        sections.push(m.content || m.message || m.text || '');
      });
      sections.push('');
    }

    // Emails
    if (fullSession.generated_marketing_emails) {
      sections.push('━━━ EMAILS MARKETING ━━━');
      const emails = Array.isArray(fullSession.generated_marketing_emails) ? fullSession.generated_marketing_emails : [];
      emails.forEach((e, i) => {
        sections.push(`\nEmail ${i + 1} : ${e.title || e.name || ''}`);
        sections.push(`Objet : ${e.subject || ''}`);
        sections.push(`Contenu :`);
        sections.push(e.body || e.content || '');
      });
      sections.push('');
    }

    const content = sections.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sessionName.replace(/\s+/g, '_')}_documents_noah.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Existing logic for active session
  const getNextIncompleteTask = () => {
    if (!fullSession?.plan_progress) {
      return {
        title: "Rejoindre la communaute et se presenter",
        description: "Commence par te connecter avec d'autres entrepreneurs",
        page: "PlanAction"
      };
    }

    const currentDay = getCurrentDay(fullSession);
    const dayProgress = fullSession.plan_progress[currentDay];

    if (!dayProgress?.checklist) {
      return {
        title: "Commencer le jour " + currentDay,
        description: "Clique pour voir tes missions du jour",
        page: "PlanAction"
      };
    }

    const firstUnchecked = dayProgress.checklist.find(
      (item) => !item.checked && !item.autoChecked
    );

    if (firstUnchecked) {
      return {
        title: firstUnchecked.text.replace(/^✅\s+/, ''),
        description: firstUnchecked.details || "Clique pour plus de details",
        page: firstUnchecked.action?.page || "PlanAction"
      };
    }

    return {
      title: "Valider le jour " + currentDay,
      description: "Tu as tout fait ! Marque ce jour comme termine",
      page: "PlanAction"
    };
  };

  const livrables = [
    { title: "Analyse SWOT", page: "MarketAnalysis", icon: Target, field: "complete_market_analysis" },
    { title: "3 Avatars", page: "AvatarClients", icon: Users, field: "generated_avatars" },
    { title: "4 Offres", page: "MyOffers", icon: Package, field: "my_generated_offers" },
    { title: "Messages", page: "SalesMessages", icon: MessageCircle, field: "generated_sales_messages" },
    { title: "Emails", page: "EmailsMarketing", icon: Send, field: "generated_marketing_emails" },
    { title: "Page de vente", page: "SalesPage", icon: FileText, field: "generated_sales_pages" }
  ];

  const countGenerated = () => livrables.filter(item => fullSession?.[item.field]).length;

  // Revenue / goal data
  const onboarding = fullSession?.onboarding_full || {};
  const targetIncome = onboarding.targetIncome;
  const targetDelay = onboarding.targetIncomeDelay;
  const lifeChangeStory = onboarding.lifeChangeStory;

  // Revenue calculator from offers
  const offer = fullSession?.finalized_offer;
  const potentialRevenue = fullSession?.potential_revenue;
  const parsePrice = (p) => parseInt(String(p || '0').replace(/[^0-9]/g, ''), 10) || 0;
  const mainPrice = offer?.mainProduct ? parsePrice(offer.mainProduct.price) : 0;
  const targetNum = Number(targetIncome) || 0;
  const salesNeeded = mainPrice > 0 && targetNum > 0 ? Math.ceil(targetNum / mainPrice) : 0;
  const revenueProgress = potentialRevenue && targetNum > 0
    ? Math.min(100, Math.round((potentialRevenue / targetNum) * 100))
    : 0;

  // Onboarding recap data
  const onboardingItems = [
    { label: 'Competence', value: onboarding.coreSkill || fullSession?.skill, icon: Sparkles },
    { label: 'Revenu cible', value: targetIncome ? `${Number(targetIncome).toLocaleString('fr-FR')} EUR/mois` : null, icon: DollarSign },
    { label: 'Delai', value: targetDelay ? `${targetDelay} mois` : null, icon: Clock },
    { label: 'Ce qui changerait', value: lifeChangeStory, icon: Heart },
    { label: 'Obstacles', value: onboarding.obstacles, icon: Zap },
    { label: 'Preferences de livraison', value: onboarding.delivery_preferences || onboarding.deliveryPreferences, icon: Package },
  ].filter(item => item.value);

  if (authLoading || loading || sessionsLoading) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar currentPage="Dashboard" progress={0} />
        <div className="flex-1 ml-0 lg:ml-72 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#61f7a2]" />
        </div>
      </div>
    );
  }

  const currentMission = getNextIncompleteTask();

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar
        currentPage="Dashboard"
        progress={calculateProgressFromSession(fullSession)}
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 w-full ml-0 lg:ml-72">
        <TopBar
          title="Dashboard"
          subtitle={`Bienvenue ${user?.full_name?.split(' ')[0] || ''} !`}
          user={user}
          onMenuClick={() => setIsSidebarOpen(true)}
          session={fullSession}
        />

        <main className="p-4 sm:p-8 max-w-6xl mx-auto">

          {/* GREETING avec photo */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center gap-4">
            <div className="flex-shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profil" className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center gap-3">
                Hello {profile?.first_name || user?.first_name || ''} <span className="text-3xl sm:text-4xl">👋</span>
              </h1>
              {fullSession?.generation_in_progress && (
                <p className="text-sm text-[#61f7a2] font-medium flex items-center gap-2 mt-1">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Noah genere tes documents...
                </p>
              )}
            </div>
          </motion.div>

          {/* OBJECTIF REVENU - carte projection */}
          {targetIncome && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mb-8 bg-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 sm:p-8"
            >
              {/* Header : objectif + delai */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-2">Ton objectif mensuel</p>
                  <p className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
                    {Number(targetIncome).toLocaleString('fr-FR')} <span className="text-[#61f7a2]">EUR</span>
                  </p>
                </div>
                {targetDelay && (
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Delai</p>
                    <p className="text-2xl font-bold text-gray-900">{targetDelay} <span className="text-sm font-medium text-gray-500">mois</span></p>
                  </div>
                )}
              </div>

              {/* Barre de progression vers l'objectif */}
              {potentialRevenue > 0 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 font-medium">Projection vs objectif</span>
                    <span className="text-xs font-bold text-gray-700">{revenueProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${revenueProgress}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className={`h-3 rounded-full ${
                        revenueProgress >= 100
                          ? 'bg-gradient-to-r from-[#61f7a2] to-[#3dd980]'
                          : revenueProgress >= 50
                            ? 'bg-gradient-to-r from-[#61f7a2] to-[#4de88f]'
                            : 'bg-gradient-to-r from-amber-400 to-orange-400'
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-gray-400">0 EUR</span>
                    <span className="text-xs text-gray-400">{Number(targetIncome).toLocaleString('fr-FR')} EUR</span>
                  </div>
                </div>
              )}

              {/* Calculateur de revenus par produit */}
              {offer?.mainProduct && (
                <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-[#61f7a2]" />
                    <span className="text-sm font-semibold text-gray-900">Calculateur de revenus</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    {offer.mainProduct && (
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Produit principal</p>
                        <p className="text-sm font-bold text-gray-900">{offer.mainProduct.price}</p>
                      </div>
                    )}
                    {offer.orderBump && (
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Order bump</p>
                        <p className="text-sm font-bold text-gray-900">{offer.orderBump.price}</p>
                      </div>
                    )}
                    {offer.upsell1 && (
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Offre mid</p>
                        <p className="text-sm font-bold text-gray-900">{offer.upsell1.price}</p>
                      </div>
                    )}
                    {offer.upsell3 && (
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Premium</p>
                        <p className="text-sm font-bold text-gray-900">{offer.upsell3.price}</p>
                      </div>
                    )}
                  </div>

                  {potentialRevenue > 0 && (
                    <p className="text-sm text-gray-700">
                      Projection avec ton funnel : <span className="font-bold text-[#61f7a2]">{Number(potentialRevenue).toLocaleString('fr-FR')} EUR/mois</span>
                    </p>
                  )}
                  {salesNeeded > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      Il te faut <span className="font-bold text-gray-900">{salesNeeded} ventes/mois</span> de ton produit principal ({offer.mainProduct.price}) pour atteindre ton objectif.
                    </p>
                  )}
                </div>
              )}

              {/* Projection vie future */}
              {lifeChangeStory && (
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Heart className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Ta vie dans {targetDelay || 'quelques'} mois</p>
                      <p className="text-sm text-gray-700 leading-relaxed italic">"{lifeChangeStory}"</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Phrase motivation */}
              <p className="text-center text-gray-500 text-sm mt-4 font-medium">
                C'est maintenant que ca se joue.
              </p>
            </motion.div>
          )}

          {/* ============ SESSIONS SECTION ============ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            {/* Header sessions */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900">Mes sessions</h2>
                <div className="w-40">
                  <SessionCounter current={current} max={max} isPaid={isPaid} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Toggle view */}
                {sessions.length > 1 && (
                  <button
                    onClick={() => setViewMode(viewMode === 'grid' ? 'detail' : 'grid')}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {viewMode === 'grid' ? 'Vue detail' : 'Vue grille'}
                  </button>
                )}

                {/* Bouton nouvelle session */}
                {isPaid ? (
                  <button
                    onClick={handleCreateSession}
                    disabled={!canCreate}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      canCreate
                        ? 'bg-[#61f7a2] text-gray-900 hover:bg-[#4de88f] hover:scale-105'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                    title={canCreate ? 'Creer une nouvelle session' : `${current}/${max} sessions utilisees`}
                  >
                    <Plus className="w-4 h-4" />
                    Nouvelle session
                  </button>
                ) : (
                  <button
                    onClick={() => { setPaywallType('upgrade_required'); setPaywallOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-xl text-sm font-semibold hover:scale-105 transition-transform"
                  >
                    <Sparkles className="w-4 h-4" />
                    Passer Premium
                  </button>
                )}
              </div>
            </div>

            {/* Info message pour gratuit */}
            {!isPaid && sessions.length > 0 && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-900 font-semibold text-sm mb-1">
                      Passe Premium pour debloquer 3 sessions
                    </p>
                    <p className="text-amber-700 text-xs">
                      Genere de nouvelles offres avec Noah.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Info message pour payant 3/3 */}
            {isPaid && !canCreate && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-blue-800 text-sm">
                    Tu as utilise tes {max} sessions. Elles restent accessibles ici.
                  </p>
                </div>
              </div>
            )}

            {/* Sessions grid */}
            {viewMode === 'grid' && sessions.length > 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessions.map((s, index) => (
                  <SessionCard
                    key={s.id}
                    session={s}
                    isActive={s.id === activeSessionId}
                    isPaid={isPaid}
                    onSelect={handleSelectSession}
                    onRename={renameSession}
                    index={index}
                  />
                ))}
              </div>
            ) : sessions.length > 1 ? (
              /* Session tabs pour vue detail */
              <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                {sessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectSession(s.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                      s.id === activeSessionId
                        ? 'bg-[#61f7a2]/10 text-gray-900 border-2 border-[#61f7a2]'
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                      s.id === activeSessionId ? 'bg-[#61f7a2] text-white' : 'bg-gray-300 text-white'
                    }`}>
                      {s.session_number}
                    </span>
                    {s.session_name}
                    {s.generation_in_progress && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
                  </button>
                ))}
              </div>
            ) : null}
          </motion.div>

          {/* BANNER generation */}
          {fullSession?.generation_in_progress && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-8 flex gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-900 font-semibold mb-1">Generation en cours...</p>
                <p className="text-blue-700 text-sm">Noah genere tes documents. Ca prend 1-2 minutes.</p>
              </div>
            </motion.div>
          )}

          {/* ============ ACTIVE SESSION DETAIL ============ */}
          {fullSession && (
            <>
              {/* Session info header */}
              {sessions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <h3 className="text-lg font-bold text-gray-900">
                    {activeSession?.session_name || `Session ${activeSession?.session_number || 1}`}
                  </h3>
                  {activeSession?.skill && (
                    <p className="text-sm text-gray-500">{activeSession.skill}</p>
                  )}
                </motion.div>
              )}

              {/* MISSION DU JOUR */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-[#61f7a2] via-[#4de88f] to-[#3dd980] rounded-3xl px-6 py-8 md:p-10 mb-8 shadow-2xl">
                <div className="text-left mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 flex items-center gap-2">
                    <Target className="w-8 h-8" />
                    Ta mission aujourd'hui
                  </h2>
                  <p className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight">
                    {currentMission.title}
                  </p>
                  <p className="text-white/90 text-lg line-clamp-2">{currentMission.description}</p>
                </div>
                <GlowButton onClick={() => navigate(createPageUrl(currentMission.page))} size="lg"
                  className="bg-white text-gray-900 hover:bg-gray-100 w-full md:w-auto px-6 md:px-12 py-3 md:py-4 text-lg md:text-xl font-bold">
                  👉 Lancer cette mission
                </GlowButton>
              </motion.div>

              {/* PROGRESSION */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Ta progression</p>
                    <p className="text-2xl font-bold text-gray-900">Jour {getCurrentDay(fullSession)} / 7</p>
                  </div>
                  <p className="text-3xl font-bold text-[#61f7a2]">{calculateProgressFromSession(fullSession)}%</p>
                </div>
                <ProgressBar value={calculateProgressFromSession(fullSession)} max={100} className="mb-3" />
                <p className="text-center text-gray-700 font-medium">Tu es exactement la ou tu dois etre.</p>
              </motion.div>

              {/* LIVRABLES */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Tes documents IA</h3>
                  <div className="flex items-center gap-3">
                    {countGenerated() > 0 && (
                      <button
                        onClick={handleDownloadAll}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Tout telecharger
                      </button>
                    )}
                    <span className="text-sm text-gray-600"><span className="font-bold text-[#61f7a2]">{countGenerated()}</span> / {livrables.length}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {livrables.map((item) => {
                    const Icon = item.icon;
                    const isGenerated = fullSession?.[item.field];
                    return (
                      <Link key={item.page} to={createPageUrl(item.page)}
                        className={`flex items-center gap-3 p-4 bg-white border rounded-xl transition-all ${
                          isGenerated ? 'border-gray-300 hover:border-[#61f7a2] hover:shadow-md' : 'border-gray-200 opacity-60'
                        }`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isGenerated ? 'bg-gray-100' : 'bg-gray-50'}`}>
                          <Icon className={`w-5 h-5 ${isGenerated ? 'text-gray-700' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-gray-900 text-sm truncate">{item.title}</span>
                            {isGenerated ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> : <Loader2 className="w-4 h-4 text-gray-400 animate-spin flex-shrink-0" />}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>

              {/* PLAN 7 JOURS */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="bg-gray-50 rounded-2xl border border-gray-200 p-6 mb-8">
                <p className="text-lg font-bold text-gray-900 mb-4">Tu es au jour {getCurrentDay(fullSession)}</p>
                <div className="flex items-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <div key={day} className={`flex-1 h-2 rounded-full transition-all ${
                      day < getCurrentDay(fullSession) ? 'bg-[#61f7a2]' : day === getCurrentDay(fullSession) ? 'bg-[#61f7a2] ring-4 ring-[#61f7a2]/30' : 'bg-gray-200'
                    }`} />
                  ))}
                </div>
                <Link to={createPageUrl('PlanAction')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-xl hover:border-[#61f7a2] hover:shadow-md transition-all font-medium text-gray-900">
                  Voir le plan complet
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>

              {/* ============ MON PROFIL ENTREPRENEUR (RECAP ONBOARDING) ============ */}
              {onboardingItems.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="bg-white rounded-2xl border border-gray-200 mb-8 overflow-hidden">
                  <button
                    onClick={() => setShowOnboardingRecap(!showOnboardingRecap)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Mon profil entrepreneur</h3>
                        <p className="text-sm text-gray-500">Tes reponses d'onboarding</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showOnboardingRecap ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showOnboardingRecap && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {onboardingItems.map((item, idx) => {
                            const Icon = item.icon;
                            const displayValue = typeof item.value === 'object'
                              ? (Array.isArray(item.value)
                                  ? item.value.join(', ')
                                  : JSON.stringify(item.value))
                              : String(item.value);
                            return (
                              <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <Icon className="w-4 h-4 text-gray-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                                  <p className="text-sm text-gray-900 mt-0.5 line-clamp-3">{displayValue}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </>
          )}

          {/* No session state */}
          {!fullSession && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-2xl bg-gray-100 mx-auto mb-6 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune session</h3>
              <p className="text-gray-600 mb-6">Commence ton parcours pour generer tes offres avec Noah.</p>
              <GlowButton onClick={handleCreateSession} size="lg">
                <Plus className="w-5 h-5" />
                Commencer mon parcours
              </GlowButton>
            </motion.div>
          )}

        </main>
      </div>

      {/* Modals */}
      <SessionPaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        type={paywallType}
      />
    </div>
  );
}
