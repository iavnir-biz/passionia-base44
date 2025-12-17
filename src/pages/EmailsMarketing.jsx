import React, { useState, useEffect } from 'react';
import { useRequireAuth } from '@/components/hooks/useRequireAuth';
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import GlowButton from '@/components/ui/GlowButton';
import { base44 } from '@/api/base44Client';
import { Send, Copy, Download, Eye, Loader2, Sparkles, Lock } from 'lucide-react';
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import UpgradeModal from '@/components/paywall/UpgradeModal';

const emailTypes = [
  {
    id: 'welcome',
    title: 'Email de Bienvenue',
    subtitle: 'Premier contact avec ton audience',
    description: 'Crée un lien fort dès le début',
    icon: Send,
    color: 'from-blue-500 to-cyan-500',
    locked: false
  },
  {
    id: 'nurture',
    title: 'Email de Nurturing',
    subtitle: 'Entretiens la relation',
    description: 'Apporte de la valeur régulièrement',
    icon: Send,
    color: 'from-purple-500 to-pink-500',
    locked: false
  },
  {
    id: 'promo',
    title: 'Email Promotionnel',
    subtitle: 'Vends ton offre',
    description: 'Transforme tes prospects en clients',
    icon: Send,
    color: 'from-orange-500 to-red-500',
    locked: false
  },
  {
    id: 'story',
    title: 'Email Storytelling',
    subtitle: 'Raconte ton histoire',
    description: 'Crée une connexion authentique',
    icon: Send,
    color: 'from-amber-500 to-yellow-500',
    locked: false
  },
  {
    id: 'reengagement',
    title: 'Email de Réengagement',
    subtitle: 'Réactive tes inactifs',
    description: 'Récupère ton audience dormante',
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
        setSession(sessionRes[0]);
        if (sessionRes[0].generated_marketing_emails) {
          setGeneratedEmails(sessionRes[0].generated_marketing_emails);
        }
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

    setLoading(true);
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

      toast.success('Email généré avec succès !');
    } catch (error) {
      console.error('Error generating email:', error);
      toast.error('Erreur lors de la génération');
    } finally {
      setLoading(false);
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
      <div className="flex items-center justify-center h-screen bg-[#11112b]">
        <Loader2 className="w-8 h-8 animate-spin text-[#61f7a2]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#11112b]">
      <Sidebar currentPage="EmailsMarketing" />
      
      <div className="flex-1 ml-72">
        <TopBar 
          title="Emails Marketing" 
          subtitle="Génère tes emails avec l'IA"
          user={user}
        />

        <main className="p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1b1b33] rounded-full mb-4">
                <Sparkles className="w-4 h-4 text-[#61f7a2]" />
                <span className="text-sm text-gray-300">Emails générés par IA</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-3">
                Tes Emails Marketing
              </h1>
              <p className="text-gray-400 text-lg">
                Crée des emails personnalisés pour ton audience
              </p>
            </div>

            {/* Email Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {emailTypes.map((email, index) => {
                const generated = generatedEmails[email.id];
                const isGenerating = loading;

                return (
                  <div
                    key={email.id}
                    className={cn(
                      "relative bg-[#1b1b33] border border-[#2a2a45] rounded-2xl p-6 transition-all duration-300",
                      "hover:border-[#61f7a2]/30 hover:shadow-xl",
                      "animate-fade-in"
                    )}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Gradient Header */}
                    <div className={cn(
                      "w-16 h-16 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4",
                      email.color
                    )}>
                      <email.icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-white mb-2">
                      {email.title}
                    </h3>
                    <p className="text-[#61f7a2] text-sm mb-1">{email.subtitle}</p>
                    <p className="text-gray-400 text-sm mb-6">{email.description}</p>

                    {/* Actions */}
                    {!email.locked ? (
                      generated ? (
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <GlowButton
                              onClick={() => setPreviewEmail({ type: email.id, content: generated })}
                              variant="outline"
                              size="sm"
                              icon={Eye}
                              className="flex-1"
                            >
                              Voir
                            </GlowButton>
                            <GlowButton
                              onClick={() => handleCopy(generated)}
                              variant="ghost"
                              size="sm"
                              icon={Copy}
                            >
                              Copier
                            </GlowButton>
                            <GlowButton
                              onClick={() => handleDownload(generated, email.id)}
                              variant="ghost"
                              size="sm"
                              icon={Download}
                            >
                              Télécharger
                            </GlowButton>
                          </div>
                          <GlowButton
                            onClick={() => handleGenerate(email.id, true)}
                            variant="secondary"
                            size="sm"
                            className="w-full"
                            disabled={isGenerating}
                            icon={!hasPremium ? Lock : undefined}
                          >
                            {!hasPremium ? 'Premium' : 'Régénérer'}
                          </GlowButton>
                        </div>
                      ) : (
                        <GlowButton
                          onClick={() => handleGenerate(email.id)}
                          variant="primary"
                          size="default"
                          className="w-full"
                          loading={isGenerating}
                          disabled={isGenerating}
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
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* Preview Modal */}
      {previewEmail && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1b1b33] rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden border border-[#2a2a45]">
            <div className="p-6 border-b border-[#2a2a45] flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Aperçu de l'email</h3>
              <button
                onClick={() => setPreviewEmail(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{previewEmail.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  );
}