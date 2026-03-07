import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useSessionLoader } from '@/components/hooks/useSessionLoader';
import NoahSidebar from '@/components/dashboard-noah/NoahSidebar';
import NoahHeader from '@/components/dashboard-noah/NoahHeader';
import PlanDayBubble from '@/components/dashboard-noah/PlanDayBubble';
import confetti from 'canvas-confetti';

export default function MonPlanNoah() {
  const navigate = useNavigate();
  const { user, session, loading } = useSessionLoader();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dayProgress, setDayProgress] = useState({});
  const [currentDay, setCurrentDay] = useState(1);

  // Sync plan progress from session
  useEffect(() => {
    if (!session) return;
    let saved = session.plan_progress || {};
    if (typeof saved === 'string') {
      try { saved = JSON.parse(saved); } catch { saved = {}; }
    }
    setDayProgress(saved);
    const completedDays = Object.keys(saved).filter(k => saved[k]?.completed).length;
    setCurrentDay(Math.min(completedDays + 1, 7));
  }, [session]);

  const getDayChecklist = (day) => {
    const mainProduct = session?.finalized_offer?.mainProduct;
    const orderBump = session?.finalized_offer?.orderBump;
    const upsell = session?.finalized_offer?.upsell1;

    const defaults = {
      1: [
        { text: "Ajouter ma photo de profil", checked: false, details: "Une photo pro augmente la confiance.", action: { type: "link", label: "Paramètres", page: "Settings" } },
        { text: "Rejoindre la communauté Skool", checked: false, details: "Échange avec d'autres entrepreneurs.", action: { type: "external", label: "Rejoindre", url: "https://www.skool.com/ia-pour-tous-6043/about?ref=8a2dca11af9048e6940087b263136daa" } },
        { text: "Me présenter dans la communauté", checked: false, details: "Dis qui tu es, ce que tu vends, tes objectifs." },
        {
          text: session?.detailed_offers ? `✅ Mes 4 offres générées` : "Générer mes 4 offres complètes",
          checked: !!session?.detailed_offers, autoChecked: !!session?.detailed_offers,
          details: session?.detailed_offers ? "Tes 4 offres sont prêtes." : "Crée ta gamme d'offres.",
          action: { type: "link", label: "Voir mes offres", page: "MesOffresNoah" }
        },
        {
          text: session?.generated_sales_messages ? "✅ Messages de vente générés" : "Générer mes messages de vente",
          checked: !!session?.generated_sales_messages, autoChecked: !!session?.generated_sales_messages,
          details: session?.generated_sales_messages ? "Tes messages sont prêts." : "Messages prêts pour tes prospects.",
          action: { type: "link", label: "Voir mes messages", page: "MesMessagesNoah" }
        }
      ],
      2: [
        { text: "Identifier où se trouve mon avatar", checked: false, details: "Groupes Facebook, forums, LinkedIn, Discord…" },
        { text: "Créer une liste de 50 prospects", checked: false, details: "Nom | Canal | Notes dans un Google Sheet." },
        { text: "Envoyer 50 messages de diagnostic", checked: false, details: "Utilise ton message diagnostic. Pas de vente.", action: { type: "link", label: "Copier mes messages", page: "MesMessagesNoah" } },
        { text: "Poser des questions, écouter, noter les mots exacts", checked: false, details: "Ces mots seront ton vocabulaire de vente." },
        { text: "Identifier 10 conversations prometteuses", checked: false, details: "Problème urgent + ouverture = prospect prioritaire." },
        { text: "Créer mon premier post de valeur", checked: false, details: `Partage une astuce sur ${session?.skill || 'ton domaine'}. 200-300 mots.` }
      ],
      3: [
        { text: "Relire les conversations et identifier les douleurs", checked: false, details: "Qui a mentionné un problème urgent ?" },
        { text: `Proposer ${mainProduct?.title || 'mon produit principal'}`, checked: false, details: mainProduct ? `"J'ai créé ${mainProduct.title} pour ${mainProduct.price}"` : "Propose ton offre d'appel.", action: { type: "link", label: "Voir mon offre", page: "MesOffresNoah" } },
        { text: "Répondre aux 3 objections courantes", checked: false, details: "Prix → temps gagné. Timing → petit pas. Doute → aperçu." },
        { text: "Obtenir au moins 1 'oui' ou intérêt clair", checked: false, details: "Un paiement, un 'envoie-moi les détails', un 'OK'." },
        { text: "Si 1ère vente : créer le produit en 24-48h", checked: false, details: "PDF 5-10 pages OU vidéo Loom 15-20 min." },
        { text: "Célébrer ma première proposition 🎉", checked: false, details: "Tu fais ce que 99% ne font jamais." }
      ],
      4: [
        { text: "Livrer le produit au client", checked: false, details: "Envoie avec un message personnel." },
        { text: "Envoyer un message de suivi 24h après", checked: false, details: "'Tu as eu le temps de regarder ?'" },
        { text: "Continuer à contacter 10 nouvelles personnes", checked: false, details: "Ne t'arrête pas après 1 vente.", action: { type: "link", label: "Mes messages", page: "MesMessagesNoah" } },
        { text: "Proposer mon offre à 3-5 nouvelles personnes", checked: false, details: "Tu connais le vocabulaire qui résonne." },
        { text: "Noter ce qui a pris le plus de temps", checked: false, details: "Identifie tes ralentisseurs." },
        { text: "Créer un Google Sheet de suivi", checked: false, details: "Nom | Canal | Statut | Date | Notes." }
      ],
      5: [
        { text: "Demander un feedback honnête", checked: false, details: "'Qu'est-ce qui t'a le plus aidé ? Qu'est-ce qui manquait ?'" },
        { text: "Identifier ce qui a eu le plus de valeur", checked: false, details: "Si plusieurs mentionnent la même chose → angle de vente." },
        { text: "Demander 'Quel est ton prochain défi ?'", checked: false, details: "Tu découvres ton prochain produit." },
        { text: "Ajuster mon message ou ma page", checked: false, details: "Améliore selon les retours." },
        { text: "Demander un témoignage écrit", checked: false, details: "'2-3 phrases sur ce que ça t'a apporté.'" },
        { text: "Poster le témoignage sur mes réseaux", checked: false, details: "Preuve sociale = plus de prospects." }
      ],
      6: [
        { text: "Contacter 30 nouvelles personnes (3x)", checked: false, details: "Tu connais ton message. Multiplie.", action: { type: "link", label: "Mes messages", page: "MesMessagesNoah" } },
        { text: "Utiliser les mots exacts de mes clients", checked: false, details: "'J'étais perdu' → réutilise ce mot." },
        { text: "Viser 3-5 nouvelles ventes", checked: false, details: "Tu sais que ça marche. Volume." },
        { text: `Proposer l'order bump (${orderBump?.title || 'offre complémentaire'})`, checked: false, details: orderBump ? `${orderBump.title} à ${orderBump.price}` : "Complément pour tes clients.", action: { type: "link", label: "Voir mon order bump", page: "MesOffresNoah" } },
        { text: "Mettre à jour mon tracker", checked: false, details: "Taux de réponse, conversion, objections, canaux." },
        { text: "Créer 2-3 posts de valeur", checked: false, details: `Partage des insights sur ${session?.skill || 'ton domaine'}.` }
      ],
      7: [
        { text: "Mettre à jour ma page avec témoignages", checked: false, details: "Tes témoignages rendent ta page 10x plus convaincante." },
        { text: "Configurer ma séquence de 5 emails", checked: false, details: "Configure dans Mailchimp ou Brevo." },
        { text: `Identifier mon prochain produit (upsell ~${upsell?.price || '97-297€'})`, checked: false, details: "Tes clients ont un nouveau problème. Quelle est l'étape suivante ?", action: { type: "link", label: "Voir mon upsell", page: "MesOffresNoah" } },
        { text: "Calculer mes résultats : CA, ventes, taux", checked: false, details: `100 contacts → 10 conversations → 3 ventes × ${mainProduct?.price || '27€'}` },
        { text: "Planifier : 1h/jour pour prospecter", checked: false, details: "Tu as un système. Fais-le tourner." },
        { text: "Partager mes victoires dans la communauté", checked: false, details: "D'une idée à des ventes en 7 jours !", action: { type: "external", label: "Partager", url: "https://www.skool.com/ia-pour-tous-6043" } },
        { text: "Célébrer : tu as prouvé que c'est possible 🎉", checked: false, details: "Tu es officiellement un entrepreneur." }
      ]
    };

    const base = defaults[day] || [];
    const saved = dayProgress?.[day]?.checklist || [];
    return base.map((item, idx) => {
      const savedItem = saved[idx];
      if (item.autoChecked) return { ...item, checked: true, disabled: true };
      return { ...item, checked: savedItem?.checked ?? item.checked ?? false };
    });
  };

  const handleChecklistChange = async (day, itemIndex) => {
    const currentList = getDayChecklist(day);
    const newChecklist = currentList.map((item, idx) => {
      const { action, details, autoChecked, ...cleanItem } = item;
      return idx === itemIndex ? { ...cleanItem, checked: !item.checked } : { ...cleanItem };
    });
    const newProgress = { ...dayProgress, [day]: { ...(dayProgress[day] || {}), checklist: newChecklist, updatedAt: new Date().toISOString() } };
    setDayProgress(newProgress);
    if (session?.id) {
      await base44.entities.Session.update(session.id, { plan_progress: newProgress });
    }
  };

  const handleDayComplete = async (day) => {
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    const newProgress = { ...dayProgress, [day]: { ...(dayProgress[day] || {}), completed: true, completedAt: new Date().toISOString() } };
    setDayProgress(newProgress);
    setCurrentDay(Math.min(day + 1, 7));
    if (session?.id) {
      await base44.entities.Session.update(session.id, { plan_progress: newProgress });
    }
  };

  const totalTasks = [1,2,3,4,5,6,7].reduce((acc, d) => acc + getDayChecklist(d).length, 0);
  const checkedTasks = [1,2,3,4,5,6,7].reduce((acc, d) => acc + getDayChecklist(d).filter(i => i.checked).length, 0);
  const globalProgress = totalTasks > 0 ? Math.round((checkedTasks / totalTasks) * 100) : 0;

  const days = [
    { number: 1, title: "Mise en place essentielle", objective: "Prépare ton environnement et génère tes outils.", keyMessage: "Aujourd'hui, tu ne vends rien. Tu te prépares.", completionMessage: "Tout est prêt. Demain, tu parles à 50 personnes." },
    { number: 2, title: "Ouvrir 50 conversations", objective: "Parler à 50 personnes. Comprendre. Sans vendre.", keyMessage: "Tu es là pour ÉCOUTER, pas convaincre.", completionMessage: "Bravo ! Demain, tu proposes." },
    { number: 3, title: "Proposer le petit produit", objective: `Première proposition : ${session?.finalized_offer?.mainProduct?.title || 'ton produit'}.`, keyMessage: "🎉 Ta première vente est proche.", completionMessage: "Incroyable ! Tu as fait ta première proposition." },
    { number: 4, title: "Livrer & Continuer", objective: "Livrer + continuer à prospecter.", keyMessage: "Tu n'as pas besoin d'être parfait, juste UTILE.", completionMessage: "Super ! Demain, tu améliores." },
    { number: 5, title: "Feedback & Optimisation", objective: "Améliorer avec de vrais retours clients.", keyMessage: "Tes clients te disent comment vendre mieux.", completionMessage: "Tu es à l'écoute. Demain, tu multiplies." },
    { number: 6, title: "Scaler : 3-5 ventes", objective: "Refaire ce qui fonctionne, en 3x plus grand.", keyMessage: "Tu sais que ça marche. VOLUME.", completionMessage: "Excellent ! Demain, tu structures." },
    { number: 7, title: "Structurer la suite", objective: "Automatiser, planifier, upsell.", keyMessage: "🎉 Tu as vendu. Tu as aidé. C'est possible.", completionMessage: "Semaine 1 terminée ! Bravo ! 🚀" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#1a1a1a] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <NoahSidebar currentPage="MonPlanNoah" user={user} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 w-full lg:ml-64">
        <NoahHeader onMenuClick={() => setSidebarOpen(true)} onToggleSidebar={() => {}} />

        <main style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 20px 80px' }}>
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 600, letterSpacing: '-0.03em', color: '#1a1a1a' }}>
                Plan de lancement
              </h1>
              <span style={{
                fontSize: '11px', fontWeight: 700, padding: '3px 10px',
                borderRadius: '100px', background: '#1a1a1a', color: '#fff'
              }}>
                7 jours
              </span>
            </div>
            <p style={{ fontSize: '14px', color: '#888' }}>
              Ta première vente en 7 jours — une action par jour.
            </p>
          </motion.div>

          {/* Global progress */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            style={{
              background: '#fafafa', border: '1px solid #e5e5e5', borderRadius: '16px',
              padding: '16px 20px', marginBottom: '32px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>
                Progression globale
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a' }}>
                {globalProgress}%
              </span>
            </div>
            <div style={{ height: '8px', background: '#e5e5e5', borderRadius: '100px', overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${globalProgress}%` }}
                transition={{ duration: 0.6 }}
                style={{
                  height: '100%', borderRadius: '100px',
                  background: 'linear-gradient(90deg, #f97316, #ec4899, #a78bfa)'
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '11px', color: '#888' }}>Jour {currentDay}/7</span>
              <span style={{ fontSize: '11px', color: '#888' }}>{checkedTasks}/{totalTasks} tâches</span>
            </div>
          </motion.div>

          {/* Timeline */}
          <div>
            {days.map((day, idx) => {
              const isCompleted = dayProgress[day.number]?.completed || false;
              const isActive = day.number === currentDay;
              const isLocked = day.number > currentDay;

              return (
                <PlanDayBubble
                  key={day.number}
                  day={day}
                  checklist={getDayChecklist(day.number)}
                  isActive={isActive}
                  isCompleted={isCompleted}
                  isLocked={isLocked}
                  onChecklistChange={(itemIdx) => handleChecklistChange(day.number, itemIdx)}
                  onComplete={() => handleDayComplete(day.number)}
                  index={idx}
                />
              );
            })}
          </div>

          {/* Completion banner */}
          {globalProgress >= 100 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                marginTop: '32px', borderRadius: '20px', padding: '32px',
                background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
                textAlign: 'center', color: '#fff'
              }}
            >
              <Sparkles style={{ width: '40px', height: '40px', margin: '0 auto 12px' }} />
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
                Semaine 1 terminée ! 🎉
              </h2>
              <p style={{ fontSize: '14px', opacity: 0.9 }}>
                Tu as complété la phase Lancer. Tu as prouvé que c'est possible.
              </p>
              <button
                onClick={() => navigate(createPageUrl('DashboardNoah'))}
                style={{
                  marginTop: '16px', padding: '12px 28px', borderRadius: '100px',
                  background: '#fff', color: '#1a1a1a', border: 'none',
                  fontSize: '14px', fontWeight: 700, cursor: 'pointer'
                }}
              >
                Retour au Dashboard
              </button>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}