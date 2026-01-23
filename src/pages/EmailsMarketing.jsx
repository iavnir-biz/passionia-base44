import React, { useState, useEffect } from 'react';
import { useRequireAuth } from '@/components/hooks/useRequireAuth';
import { motion } from 'framer-motion';
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import GlowButton from '@/components/ui/GlowButton';
import { base44 } from '@/api/base44Client';
import { Send, Copy, Download, Eye, Loader2, Sparkles, Brain, Mail } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import ChatBubble from '@/components/chat/ChatBubble';

const emailTypes = [
  {
    id: 'email1_contraste',
    title: 'Email 1 : Le Contraste',
    subtitle: 'Aujourd\'hui vs Demain',
    description: 'Faire prendre conscience de l\'écart',
    icon: Send,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'email2_validation',
    title: 'Email 2 : La Validation',
    subtitle: 'Tu n\'es pas seul·e',
    description: 'Créer la connexion émotionnelle',
    icon: Send,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'email3_calcul',
    title: 'Email 3 : Le Calcul',
    subtitle: 'C\'est faisable',
    description: 'Rassurer le cerveau logique',
    icon: Send,
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'email4_impact',
    title: 'Email 4 : L\'Impact',
    subtitle: 'Donner du sens',
    description: 'Vision de transformation',
    icon: Send,
    color: 'from-amber-500 to-yellow-500'
  },
  {
    id: 'email5_urgence',
    title: 'Email 5 : L\'Urgence',
    subtitle: 'Déclencher la décision',
    description: 'Coût de l\'inaction',
    icon: Send,
    color: 'from-green-500 to-emerald-500'
  }
];

export default function EmailsMarketing() {
  const { isLoading: authLoading, user } = useRequireAuth();
  const [loading, setLoading] = useState(false);
  const [generatedEmails, setGeneratedEmails] = useState(null);
  const [previewEmail, setPreviewEmail] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const sessionRes = await base44.entities.Session.filter({ 
        created_by: user.email 
      });

      if (sessionRes.length > 0) {
        const userSession = sessionRes[0];
        setSession(userSession);
        
        // Charger les emails générés depuis la session
        if (userSession.generated_marketing_emails) {
          console.log('Emails loaded from session:', userSession.generated_marketing_emails);
          setGeneratedEmails(userSession.generated_marketing_emails);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleGenerateAll = async () => {
    if (!session) {
      toast.error('Session introuvable');
      return;
    }

    setLoading(true);
    try {
      console.log('Generating all emails for session:', session.id);
      
      const response = await base44.functions.invoke('generateMarketingEmail', {
        sessionId: session.id
      });

      console.log('Response:', response);

      if (response.data?.success && response.data?.emails) {
        setGeneratedEmails(response.data.emails);
        toast.success('Les 5 emails ont été générés !');
        
        // Recharger pour confirmer
        await loadUserData();
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (error) {
      console.error('Error generating emails:', error);
      toast.error('Erreur lors de la génération : ' + (error.message || 'Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content) => {
    const fullContent = `${content.subject}\n\n${content.preheader}\n\n${content.body}\n\n${content.ps || ''}`;
    navigator.clipboard.writeText(fullContent);
    toast.success('Email copié dans le presse-papier !');
  };

  const handleDownload = (content, filename) => {
    const fullContent = `Sujet: ${content.subject}\n\nPreheader: ${content.preheader}\n\n${content.body}\n\n${content.ps || ''}`;
    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.txt`;
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
          subtitle="Séquence de 5 emails pour vendre ton produit"
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
                <span className="text-xs font-medium text-gray-700">Générés par Noah</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Séquence d'emails marketing
              </h1>
              <p className="text-gray-600 text-lg mb-6">
                5 emails pour convertir ton audience en clients
              </p>

              {/* Generate All Button */}
              {!generatedEmails && (
                <GlowButton
                  onClick={handleGenerateAll}
                  variant="primary"
                  size="lg"
                  loading={loading}
                  icon={Sparkles}
                  className="mb-8"
                >
                  {loading ? 'Génération en cours...' : 'Générer les 5 emails'}
                </GlowButton>
              )}

              {generatedEmails && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-green-900 font-semibold">
                      Tes 5 emails sont prêts !
                    </p>
                    <p className="text-green-700 text-sm">
                      Clique sur un email pour le voir en détail
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Email Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {emailTypes.map((email, index) => {
                const emailContent = generatedEmails?.[email.id];
                const hasContent = !!emailContent;

                return (
                  <motion.div
                    key={email.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className={cn(
                      "bg-gray-50 border rounded-2xl p-6 transition-all",
                      hasContent ? "border-gray-300 hover:border-[#61f7a2]" : "border-gray-200"
                    )}
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
                    {hasContent ? (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPreviewEmail({ 
                              type: email.id, 
                              content: emailContent, 
                              title: email.title 
                            })}
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-gray-900"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="text-sm font-medium">Voir</span>
                          </button>
                          <button
                            onClick={() => handleCopy(emailContent)}
                            className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-all flex items-center gap-2 text-gray-900"
                            title="Copier"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(emailContent, email.id)}
                            className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-all flex items-center gap-2 text-gray-900"
                            title="Télécharger"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
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
            {/* Header */}
            <div className="bg-gray-100 p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-bold text-gray-900">{previewEmail.title}</h3>
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

            {/* Body */}
            <div className="p-8 overflow-y-auto max-h-[calc(85vh-100px)] bg-white">
              {/* Subject */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Sujet</p>
                <p className="text-xl font-bold text-gray-900">{previewEmail.content.subject}</p>
              </div>

              {/* Preheader */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Prévisualisation</p>
                <p className="text-gray-700">{previewEmail.content.preheader}</p>
              </div>

              {/* Body */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-3">Corps de l'email</p>
                <div className="text-gray-800 leading-relaxed whitespace-pre-line">
                  {previewEmail.content.body}
                </div>
              </div>

              {/* PS */}
              {previewEmail.content.ps && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-3">Post-Scriptum</p>
                  <p className="text-gray-800 italic">{previewEmail.content.ps}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Chat Bubble */}
      <ChatBubble />
    </div>
  );
}