import React, { useState, useEffect } from 'react';
import { useRequireAuth } from '@/components/hooks/useRequireAuth';
import { motion } from 'framer-motion';
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import GlowButton from '@/components/ui/GlowButton';
import { base44 } from '@/api/base44Client';
import { Send, Copy, Download, Eye, Loader2, Sparkles, Lock, Brain, Mail } from 'lucide-react';
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import UpgradeModal from '@/components/paywall/UpgradeModal';
import ChatBubble from '@/components/chat/ChatBubble';

const emailTypes = [
  {
    id: 'contraste',
    title: 'Le Contraste',
    subtitle: 'Email 1',
    objective: 'Faire prendre conscience de l\'écart entre aujourd\'hui et demain',
    icon: Send,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'validation',
    title: 'La Validation',
    subtitle: 'Email 2',
    objective: 'Créer la connexion émotionnelle ("Tu n\'es pas seul")',
    icon: Send,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'calcul',
    title: 'Le Calcul',
    subtitle: 'Email 3',
    objective: 'Rassurer le cerveau logique (c\'est faisable)',
    icon: Send,
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'impact',
    title: 'L\'Impact',
    subtitle: 'Email 4',
    objective: 'Donner du sens à l\'action (fierté, avancer enfin)',
    icon: Send,
    color: 'from-amber-500 to-yellow-500'
  },
  {
    id: 'urgence',
    title: 'L\'Urgence',
    subtitle: 'Email 5',
    objective: 'Déclencher la décision (coût de l\'inaction)',
    icon: Send,
    color: 'from-green-500 to-emerald-500'
  }
];

export default function EmailsMarketing() {
  const { isLoading: authLoading, user } = useRequireAuth();
  const [loading, setLoading] = useState(false);
  const [generatedEmails, setGeneratedEmails] = useState({});
  const [previewEmail, setPreviewEmail] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [hasPremium, setHasPremium] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const isNonEmpty = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return true;
    if (typeof value === 'boolean') return true;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return false;
  };

  const loadUserData = async () => {
    try {
      // 🔥 DB-first: charger Session via sessionId
      const sessionId = user.sessionId;
      if (!sessionId) {
        console.error('[EmailsMarketing] No sessionId');
        return;
      }

      const sessions = await base44.entities.Session.filter({ id: sessionId });
      const userSession = sessions?.[0];
      
      if (!userSession) {
        console.error('[EmailsMarketing] Session not found');
        return;
      }

      setSession(userSession);
      console.log('[EmailsMarketing] Session loaded:', userSession);
      console.log('[EmailsMarketing] Generated marketing emails:', userSession.generated_marketing_emails);
      
      // Charger emails si présents
      if (isNonEmpty(userSession.generated_marketing_emails)) {
        setGeneratedEmails(userSession.generated_marketing_emails);
      }

      const profileRes = await base44.entities.UserProfile.filter({ created_by: user.email });
      if (profileRes.length > 0) {
        setProfile(profileRes[0]);
        setHasPremium(profileRes[0].has_paid === true);
      }
    } catch (error) {
      console.error('[EmailsMarketing] Error loading user data:', error);
    }
  };

  const handleGenerateAll = async () => {
    if (!session) {
      toast.error('Session non trouvée');
      return;
    }

    setLoading('all');
    try {
      const response = await base44.functions.invoke('generateMarketingEmail', {
        sessionId: session.id,
        generateAll: true
      });

      setGeneratedEmails(response.data.emails);

      // Save to session
      await base44.entities.Session.update(session.id, {
        generated_marketing_emails: response.data.emails
      });

      // Recharger pour confirmer
      await loadUserData();

      toast.success('Séquence complète générée !');
    } catch (error) {
      console.error('Error generating emails:', error);
      toast.error('Erreur lors de la génération');
    } finally {
      setLoading(null);
    }
  };

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
    toast.success('Copié dans le presse-papier !');
  };

  const handleDownload = (content, type) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-${type}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#61f7a2]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar currentPage="EmailsMarketing" />
      
      <div className="flex-1 ml-72">
        <TopBar 
          title="Emails Marketing" 
          subtitle=""
          user={user}
        />

        <main className="p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full mb-4">
                <Brain className="w-4 h-4 text-[#61f7a2]" />
                <span className="text-xs font-medium text-gray-700">Emails générés par IA</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Tes emails marketing
              </h1>
              <p className="text-gray-600 text-lg">
                Une séquence prête à envoyer pour vendre ton produit d'entrée de gamme, sans forcer.
              </p>
            </motion.div>

            {/* Context Block */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    📧 Comment utiliser cette séquence ?
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    Cette séquence d'emails est pensée comme une conversation naturelle, pas un tunnel agressif. 
                    Utilise-les après tes messages privés ou DM pour nourrir la relation et transformer l'intérêt en vente.
                  </p>
                  <p className="text-xs text-gray-600 font-medium">
                    ⚠️ Ces emails sont liés à ton produit low ticket : ils ne peuvent pas être modifiés ni régénérés.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Global Generate Button */}
            {Object.keys(generatedEmails).length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center"
              >
                <GlowButton
                  onClick={handleGenerateAll}
                  variant="primary"
                  size="lg"
                  loading={loading === 'all'}
                  icon={Sparkles}
                  className="px-8 py-4"
                >
                  {loading === 'all' ? 'Nova écrit tes emails...' : 'Générer mes emails'}
                </GlowButton>
              </motion.div>
            )}

            {/* Email Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {emailTypes.map((email, index) => {
                const generated = generatedEmails[email.id];
                const isGenerating = loading === email.id;

                return (
                  <motion.div
                    key={email.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.03 }}
                    className="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all"
                  >
                    {/* Icon Header */}
                    <div className={cn(
                      "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4",
                      email.color
                    )}>
                      <email.icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Content */}
                    <p className="text-[#61f7a2] text-xs font-semibold uppercase tracking-wide mb-1">
                      {email.subtitle}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {email.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-6">
                      <span className="font-medium">Objectif :</span> {email.objective}
                    </p>

                    {/* Actions */}
                    {generated ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPreviewEmail({ type: email.id, content: generated, title: email.title })}
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-gray-900"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-sm font-medium">Voir</span>
                        </button>
                        <button
                          onClick={() => handleCopy(generated)}
                          className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-all flex items-center gap-2 text-gray-900"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(generated, email.id)}
                          className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-all flex items-center gap-2 text-gray-900"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ) : null}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* Preview Modal */}
      {previewEmail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden border border-gray-200 shadow-2xl"
          >
            <div className="bg-gray-100 p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-bold text-gray-900">Aperçu de l'email</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCopy(previewEmail.content)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-all flex items-center gap-2 text-gray-700"
                >
                  <Copy className="w-4 h-4" />
                  <span className="text-sm font-medium">Copier</span>
                </button>
                <button
                  onClick={() => setPreviewEmail(null)}
                  className="text-gray-500 hover:text-gray-900 transition-colors text-xl"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-8 overflow-y-auto max-h-[calc(85vh-100px)] bg-white">
              <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
                <pre className="whitespace-pre-wrap font-sans">
                  {previewEmail.content}
                </pre>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Chat Bubble */}
      <ChatBubble />

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  );
}