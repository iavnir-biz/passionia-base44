import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useRequireAuth } from '@/components/hooks/useRequireAuth';
import { Sparkles, Loader2, Eye, Copy, Download, MessageSquare, Heart, Lightbulb, ShoppingBag, Lock } from 'lucide-react';
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import GlowButton from '@/components/ui/GlowButton';
import { toast } from 'sonner';

export default function SalesMessages() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState({});
  const [generatedMessages, setGeneratedMessages] = useState({});
  const [showPreview, setShowPreview] = useState(null);
  const [hasPremium, setHasPremium] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const profiles = await base44.entities.UserProfile.filter({ 
        created_by: currentUser.email 
      });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        setHasPremium(profiles[0].has_paid === true);
      }

      const sessions = await base44.entities.Session.filter({ 
        created_by: currentUser.email 
      });
      
      if (sessions.length > 0) {
        setSession(sessions[0]);
        if (sessions[0].generated_sales_messages) {
          setGeneratedMessages(sessions[0].generated_sales_messages);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const messageTypes = [
    {
      id: 'diagnostic',
      title: 'Le Diagnostic',
      subtitle: 'Message 1',
      description: 'Identifie le problème de ton prospect',
      icon: MessageSquare,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'empathy',
      title: 'L\'Empathie',
      subtitle: 'Message 2',
      description: 'Crée une connexion émotionnelle',
      icon: Heart,
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'solution',
      title: 'La Solution',
      subtitle: 'Message 3',
      description: 'Présente ta solution unique',
      icon: Lightbulb,
      color: 'from-amber-500 to-orange-500'
    },
    {
      id: 'purchase',
      title: 'L\'Achat',
      subtitle: 'Message 4',
      description: 'Pousse à l\'action d\'achat',
      icon: ShoppingBag,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const handleGenerate = async (messageType) => {
    setLoading({ ...loading, [messageType]: true });

    try {
      const response = await base44.functions.invoke('generateSalesMessage', {
        messageType,
        profile,
        session
      });

      const updatedMessages = {
        ...generatedMessages,
        [messageType]: response.data
      };
      setGeneratedMessages(updatedMessages);

      // Save to session
      await base44.entities.Session.update(session.id, {
        generated_sales_messages: updatedMessages
      });

      toast.success('Message généré avec succès !');
    } catch (error) {
      console.error('Error generating message:', error);
      toast.error('Erreur lors de la génération');
    } finally {
      setLoading({ ...loading, [messageType]: false });
    }
  };

  const handleCopy = (message) => {
    navigator.clipboard.writeText(message.content);
    toast.success('Copié dans le presse-papier !');
  };

  const handleDownload = (message, filename) => {
    const blob = new Blob([message.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
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
      <Sidebar currentPage="SalesMessages" progress={0} />
      
      <div className="flex-1 ml-72">
        <TopBar 
          title="Messages de vente" 
          subtitle="Crée tes messages de vente avec l'IA"
          user={user}
        />
        
        <main className="p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1b1b33] rounded-full mb-4">
                <Sparkles className="w-4 h-4 text-[#61f7a2]" />
                <span className="text-sm text-gray-300">Messages générés par IA</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-3">
                Tes Messages de Vente
              </h1>
              <p className="text-gray-400 text-lg">
                Génère une séquence complète de 4 messages pour convertir tes prospects
              </p>
            </div>

            {/* Message Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {messageTypes.map((msgType, index) => {
                const Icon = msgType.icon;
                const isGenerated = generatedMessages[msgType.id];
                const isLoading = loading[msgType.id];
                
                return (
                  <div
                    key={msgType.id}
                    className="relative bg-[#1b1b33] border border-[#2a2a45] rounded-2xl p-6 transition-all duration-300 hover:border-[#61f7a2]/30 hover:shadow-xl animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Gradient Header */}
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${msgType.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-white mb-2">
                      {msgType.title}
                    </h3>
                    <p className="text-[#61f7a2] text-sm mb-1">{msgType.subtitle}</p>
                    <p className="text-gray-400 text-sm mb-6">{msgType.description}</p>

                    {/* Actions */}
                    {isGenerated ? (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <GlowButton
                            onClick={() => setShowPreview(isGenerated)}
                            variant="outline"
                            size="sm"
                            icon={Eye}
                            className="flex-1"
                          >
                            Voir
                          </GlowButton>
                          <GlowButton
                            onClick={() => handleCopy(isGenerated)}
                            variant="ghost"
                            size="sm"
                            icon={Copy}
                          >
                            Copier
                          </GlowButton>
                          <GlowButton
                            onClick={() => handleDownload(isGenerated, `message-${msgType.id}.txt`)}
                            variant="ghost"
                            size="sm"
                            icon={Download}
                          >
                            Télécharger
                          </GlowButton>
                        </div>
                        <GlowButton
                          onClick={() => {
                            if (!hasPremium) {
                              toast.error('Fonctionnalité réservée aux abonnés Premium');
                              return;
                            }
                            handleGenerate(msgType.id);
                          }}
                          variant="secondary"
                          size="sm"
                          className="w-full"
                          loading={isLoading}
                          icon={!hasPremium ? Lock : undefined}
                        >
                          {!hasPremium ? 'Premium' : 'Régénérer'}
                        </GlowButton>
                      </div>
                    ) : (
                      <GlowButton
                        onClick={() => handleGenerate(msgType.id)}
                        variant="primary"
                        size="default"
                        className="w-full"
                        loading={isLoading}
                      >
                        {isLoading ? 'Génération...' : 'Générer'}
                      </GlowButton>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1b1b33] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-[#2a2a45]">
            <div className="p-6 border-b border-[#2a2a45] flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{showPreview.title}</h3>
              <button
                onClick={() => setShowPreview(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-gray-300 font-sans">
                  {showPreview.content}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}