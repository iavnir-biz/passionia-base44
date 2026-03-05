import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, MessageCircle, Calendar, FileText,
  Copy, Check, Loader2, Sparkles, ChevronDown, ChevronUp,
  CheckCircle2, Circle, ArrowRight, Download, User
} from 'lucide-react';
import { toast } from 'sonner';
import { NoahBrainIcon } from '@/components/NoahBrainIcon';

// ─── Tabs config ─────────────────────────────────────────────────────────────
const TABS = [
  { id: 'offers',   label: 'Mes Offres',        icon: Package },
  { id: 'messages', label: 'Messages de Vente',  icon: MessageCircle },
  { id: 'plan',     label: 'Plan 7 Jours',       icon: Calendar },
  { id: 'salespage',label: 'Page de Vente',      icon: FileText },
];

// ─── Copy helper ─────────────────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
      {copied ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copié</> : <><Copy className="w-3.5 h-3.5" /> Copier</>}
    </button>
  );
}

// ─── Offer card ──────────────────────────────────────────────────────────────
function OfferCard({ offer, badge, color }) {
  const [expanded, setExpanded] = useState(false);
  if (!offer) return null;

  const psso = [
    offer.problem && { label: 'Problème', value: offer.problem },
    offer.solution && { label: 'Solution', value: offer.solution },
    (offer.subtitle || offer.description) && { label: 'Offre', value: offer.subtitle || offer.description },
    offer.transformation && { label: 'Transformation', value: offer.transformation },
  ].filter(Boolean);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-2 ${color}`}>
              {badge}
            </span>
            <h3 className="font-bold text-gray-900 text-base leading-tight">{offer.title}</h3>
            {offer.price && <p className="text-2xl font-black text-gray-900 mt-1">{offer.price}</p>}
          </div>
        </div>

        {/* PSSO */}
        {psso.length > 0 && (
          <div className="space-y-2 mt-3">
            {psso.map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{item.label}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{item.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Deliverables */}
        {offer.deliverables?.length > 0 && (
          <div className="mt-3">
            <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors">
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {expanded ? 'Masquer' : 'Voir'} le contenu ({offer.deliverables.length})
            </button>
            {expanded && (
              <div className="mt-2 space-y-1">
                {offer.deliverables.map((d, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-[#61f7a2] flex-shrink-0 mt-0.5" />
                    <span>{typeof d === 'string' ? d : d.description || d.name || ''}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Message card ─────────────────────────────────────────────────────────────
function MessageCard({ message, index }) {
  const text = message.content || message.message || message.text || '';
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Message {index + 1}</span>
          {message.title && <h3 className="font-bold text-gray-900 text-sm mt-0.5">{message.title}</h3>}
          {message.objective && <p className="text-xs text-gray-500 mt-0.5">{message.objective}</p>}
        </div>
        <CopyButton text={text} />
      </div>
      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
        {text}
      </div>
    </div>
  );
}

// ─── Plan day card ─────────────────────────────────────────────────────────────
function PlanDayCard({ day, dayData, onToggle }) {
  const [expanded, setExpanded] = useState(day === 1);
  const checklist = dayData?.checklist || [];
  const done = checklist.filter(i => i.checked || i.autoChecked).length;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${done === checklist.length && checklist.length > 0 ? 'bg-[#61f7a2] text-white' : 'bg-gray-100 text-gray-700'}`}>
            {done === checklist.length && checklist.length > 0 ? <CheckCircle2 className="w-5 h-5" /> : `J${day}`}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">Jour {day}</p>
            {dayData?.title && <p className="text-xs text-gray-500 mt-0.5">{dayData.title}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {checklist.length > 0 && (
            <span className="text-xs text-gray-400">{done}/{checklist.length}</span>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 p-5 space-y-3">
          {checklist.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">Les tâches de ce jour seront disponibles après génération.</p>
          )}
          {checklist.map((item, i) => (
            <button
              key={i}
              onClick={() => onToggle(day, i)}
              className="w-full flex items-start gap-3 text-left group"
            >
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${item.checked || item.autoChecked ? 'bg-[#61f7a2] border-[#61f7a2]' : 'border-gray-300 group-hover:border-gray-500'}`}>
                {(item.checked || item.autoChecked) && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              <span className={`text-sm leading-relaxed ${item.checked || item.autoChecked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                {item.text?.replace(/^✅\s+/, '') || item.action || ''}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth, navigateToLogin } = useAuth();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('offers');

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!isAuthenticated) { navigateToLogin(); return; }
      loadData();
    }
  }, [isLoadingAuth, isAuthenticated]);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Check profile setup
      const profiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
      if (profiles.length === 0 || !profiles[0].first_name) {
        navigate(createPageUrl('SetupProfile'));
        return;
      }

      // Load session
      const sessionId = currentUser.sessionId || localStorage.getItem('passionia_active_session_id');
      if (!sessionId) {
        navigate(createPageUrl('OnboardingFirstName'));
        return;
      }

      const sessions = await base44.entities.Session.filter({ id: sessionId });
      if (sessions.length === 0) {
        navigate(createPageUrl('OnboardingFirstName'));
        return;
      }

      const userSession = sessions[0];

      // Not done onboarding → go back
      if (!userSession.is_onboarding_done) {
        navigate(createPageUrl('OnboardingFirstName'));
        return;
      }

      // Generation in progress → go to progress page
      if (userSession.generation_in_progress) {
        navigate(createPageUrl('GenerationProgress'));
        return;
      }

      setSession(userSession);
    } catch (error) {
      console.error('[Dashboard] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlanItem = async (day, itemIndex) => {
    if (!session) return;
    const newProgress = JSON.parse(JSON.stringify(session.plan_progress || {}));
    if (!newProgress[day]) newProgress[day] = { checklist: [] };
    if (!newProgress[day].checklist[itemIndex]) return;
    newProgress[day].checklist[itemIndex].checked = !newProgress[day].checklist[itemIndex].checked;
    setSession({ ...session, plan_progress: newProgress });
    try {
      await base44.entities.Session.update(session.id, { plan_progress: newProgress });
    } catch { toast.error('Erreur de sauvegarde'); }
  };

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (isLoadingAuth || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#61f7a2]" />
      </div>
    );
  }

  // ─── No results yet ──────────────────────────────────────────────────────────
  if (!session) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <NoahBrainIcon size={80} isThinking={false} />
        <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">Tes offres ne sont pas encore générées</h2>
        <p className="text-gray-500 text-sm mb-6">Complète l'onboarding pour que Noah génère ton kit complet.</p>
        <button
          onClick={() => navigate(createPageUrl('OnboardingFirstName'))}
          className="bg-[#1a1a1a] text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2"
        >
          <Sparkles className="w-5 h-5 text-[#61f7a2]" />
          Démarrer l'onboarding
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const offer = session.finalized_offer || session.my_generated_offers || {};
  const messages = session.generated_sales_messages || [];
  const planProgress = session.plan_progress || {};
  const salesPages = session.generated_sales_pages;

  const offerCards = [
    { key: 'orderBump', badge: 'Petit Extra', color: 'bg-blue-100 text-blue-700', data: offer.orderBump },
    { key: 'mainProduct', badge: 'Produit Principal', color: 'bg-[#61f7a2]/20 text-[#1a9e5c]', data: offer.mainProduct },
    { key: 'upsell1', badge: 'Offre Supérieure', color: 'bg-purple-100 text-purple-700', data: offer.upsell1 || offer.upsell },
    { key: 'upsell3', badge: 'Offre Premium', color: 'bg-amber-100 text-amber-700', data: offer.upsell3 || offer.premium },
  ].filter(o => o.data);

  const firstName = user?.firstName || user?.full_name?.split(' ')[0] || '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NoahBrainIcon size={36} isThinking={false} />
            <div>
              <p className="text-xs text-gray-400">Bonjour {firstName} 👋</p>
              <p className="text-sm font-bold text-gray-900">Ton kit Passion IA</p>
            </div>
          </div>
          <button
            onClick={() => navigate(createPageUrl('Settings'))}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <User className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-3xl mx-auto px-4 pb-0">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'border-[#61f7a2] text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >

            {/* ── Tab: Mes Offres ─────────────────────────────────────────── */}
            {activeTab === 'offers' && (
              <div className="space-y-4">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Tes 4 offres</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Structurées avec la formule PSSO — prêtes à vendre</p>
                </div>
                {offerCards.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Les offres ne sont pas encore disponibles.</p>
                    <button
                      onClick={() => navigate(createPageUrl('GenerationProgress'))}
                      className="mt-4 text-[#61f7a2] text-sm font-medium"
                    >
                      Voir la génération →
                    </button>
                  </div>
                ) : (
                  offerCards.map(({ key, badge, color, data }) => (
                    <OfferCard key={key} offer={data} badge={badge} color={color} />
                  ))
                )}
              </div>
            )}

            {/* ── Tab: Messages de Vente ──────────────────────────────────── */}
            {activeTab === 'messages' && (
              <div className="space-y-4">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Messages de vente</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Copie-colle directement en DM ou email</p>
                </div>
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Les messages ne sont pas encore disponibles.</p>
                  </div>
                ) : (
                  messages.map((msg, i) => <MessageCard key={i} message={msg} index={i} />)
                )}
              </div>
            )}

            {/* ── Tab: Plan 7 Jours ───────────────────────────────────────── */}
            {activeTab === 'plan' && (
              <div className="space-y-4">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Plan d'action 7 jours</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Coche chaque action pour progresser vers ta première vente</p>
                </div>
                {[1, 2, 3, 4, 5, 6, 7].map(day => (
                  <PlanDayCard
                    key={day}
                    day={day}
                    dayData={planProgress[day] || planProgress[String(day)]}
                    onToggle={handleTogglePlanItem}
                  />
                ))}
              </div>
            )}

            {/* ── Tab: Page de Vente ──────────────────────────────────────── */}
            {activeTab === 'salespage' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Ta page de vente</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Formule PSSO complète — prête à publier</p>
                  </div>
                  {salesPages && (
                    <button
                      onClick={() => {
                        const text = typeof salesPages === 'string' ? salesPages : JSON.stringify(salesPages, null, 2);
                        navigator.clipboard.writeText(text);
                        toast.success('Page copiée !');
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      Copier tout
                    </button>
                  )}
                </div>

                {!salesPages ? (
                  <div className="text-center py-12 text-gray-400">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">La page de vente n'est pas encore disponible.</p>
                  </div>
                ) : typeof salesPages === 'string' ? (
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {salesPages}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(salesPages).map(([section, content]) => (
                      <div key={section} className="bg-white border border-gray-200 rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{section}</p>
                          <CopyButton text={typeof content === 'string' ? content : JSON.stringify(content)} />
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
