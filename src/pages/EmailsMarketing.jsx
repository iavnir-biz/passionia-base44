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
    title: 'Email 1 : Le Contraste',
    subtitle: 'Aujourd\'hui vs Demain',
    description: 'Rappelle la douleur et le rêve',
    icon: Send,
    color: 'from-blue-500 to-cyan-500',
    locked: false
  },
  {
    id: 'validation',
    title: 'Email 2 : La Validation Sociale',
    subtitle: 'Le Regard des autres',
    description: 'Reconnaissance et succès',
    icon: Send,
    color: 'from-purple-500 to-pink-500',
    locked: false
  },
  {
    id: 'calcul',
    title: 'Email 3 : Le Calcul de Faisabilité',
    subtitle: 'La Logique',
    description: 'Montre que c\'est accessible',
    icon: Send,
    color: 'from-orange-500 to-red-500',
    locked: false
  },
  {
    id: 'impact',
    title: 'Email 4 : L\'Impact et la Fierté',
    subtitle: 'Le Sens',
    description: 'Inspire à aider les autres',
    icon: Send,
    color: 'from-amber-500 to-yellow-500',
    locked: false
  },
  {
    id: 'urgence',
    title: 'Email 5 : L\'Urgence de l\'Inaction',
    subtitle: 'Le Regret',
    description: 'Coût émotionnel de ne rien faire',
    icon: Send,
    color: 'from-green-500 to-emerald-500',
    locked: false
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

  const loadUserData = async () => {
    try {
      const [profileRes, sessionRes] = await Promise.all([
        base44.entities.UserProfile.filter({ created_by: user.email }),
        base44.entities.Session.filter({ created_by: user.email })
      ]);

      if (profileRes.length > 0) {
        setProfile(profileRes[0]);
        setHasPremium(profileRes[0].has_paid === true);
      }
      if (sessionRes.length > 0) {
        const userSession = sessionRes[0];
        setSession(userSession);
        console.log('Session loaded:', userSession);
        console.log('Generated marketing emails:', userSession.generated_marketing_emails);
        
        if (userSession.generated_marketing_emails) {
          setGeneratedEmails(userSession.generated_marketing_emails);
        }
      } else {
        console.error('No session found for user');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleGenerate = async (emailType, isRegenerate = false) => {
    if (isRegenerate && !hasPremium) {
      setShowUpgradeModal(true);
      return;
    }

    if (!profile || !session) {
      toast.error('Profil incomplet');
      return;
    }

    setLoading(emailType);
    try {
      const response = await base44.functions.invoke('generateMarketingEmail', {
        emailType,
        profile,
        session
      });

      const updatedEmails = {
        ...generatedEmails,
        [emailType]: response.data.email
      };
      setGeneratedEmails(updatedEmails);

      // Save to session
      await base44.entities.Session.update(session.id, {
        generated_marketing_emails: updatedEmails
      });

      // Recharger pour confirmer
      await loadUserData();

      toast.success('Email généré avec succès !');
    } catch (error) {
      console.error('Error generating email:', error);
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
                Crée des emails personnalisés pour ton audience
              </p>
            </motion.div>

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
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {email.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-6">{email.description}</p>

                    {/* Actions */}
                    {!email.locked ? (
                      generated ? (
                        <div className="space-y-3">
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
                          <button
                            onClick={() => {
                              if (!hasPremium) {
                                setShowUpgradeModal(true);
                                return;
                              }
                              handleGenerate(email.id, true);
                            }}
                            disabled={isGenerating}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-gray-700 disabled:opacity-50"
                          >
                            {isGenerating ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Lock className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  Régénération non disponible pour le plan actuel
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <GlowButton
                          onClick={() => handleGenerate(email.id)}
                          variant="primary"
                          size="default"
                          className="w-full"
                          loading={isGenerating}
                          disabled={loading !== null && loading !== email.id}
                          icon={Sparkles}
                        >
                          {isGenerating ? 'Génération...' : 'Générer'}
                        </GlowButton>
                      )
                    ) : null}

                    {/* Lock Overlay */}
                    {email.locked && (
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-md flex items-center justify-center rounded-2xl">
                        <div className="text-center">
                          <Lock className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm font-semibold text-gray-600">Premium</p>
                        </div>
                      </div>
                    )}
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
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-4">{children}</p>,
                    h1: ({ children }) => <h1 className="mb-4 mt-6">{children}</h1>,
                    h2: ({ children }) => <h2 className="mb-3 mt-5">{children}</h2>,
                    h3: ({ children }) => <h3 className="mb-3 mt-4">{children}</h3>,
                    ul: ({ children }) => <ul className="mb-4 space-y-2">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-4 space-y-2">{children}</ol>,
                  }}
                >
                  {previewEmail.content}
                </ReactMarkdown>
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