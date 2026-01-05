import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useRequireAuth } from '@/components/hooks/useRequireAuth';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Eye, Copy, Download, MessageSquare, Heart, Lightbulb, ShoppingBag, Lock, Brain } from 'lucide-react';
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import GlowButton from '@/components/ui/GlowButton';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import UpgradeModal from '@/components/paywall/UpgradeModal';
import ChatBubble from '@/components/chat/ChatBubble';

export default function SalesMessages() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState({});
  const [generatedMessages, setGeneratedMessages] = useState({});
  const [showPreview, setShowPreview] = useState(null);
  const [hasPremium, setHasPremium] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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

  const handleGenerate = async (messageType, isRegenerate = false) => {
    if (isRegenerate && !hasPremium) {
      setShowUpgradeModal(true);
      return;
    }
    
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
      <div className="flex items-center justify-center h-screen bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#61f7a2]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar currentPage="SalesMessages" progress={0} />
      
      <div className="flex-1 ml-72">
        <TopBar 
          title="Messages de vente" 
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
                <span className="text-xs font-medium text-gray-700">Messages générés par IA</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Tes messages de vente
              </h1>
              <p className="text-gray-600 text-lg">
                Génère une séquence complète de 4 messages pour convertir tes prospects
              </p>
            </motion.div>

            {/* Message Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {messageTypes.map((msgType, index) => {
                const Icon = msgType.icon;
                const isGenerated = generatedMessages[msgType.id];
                const isLoading = loading[msgType.id];
                
                return (
                  <motion.div
                    key={msgType.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all"
                  >
                    {/* Icon Header */}
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${msgType.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Content */}
                    <p className="text-[#61f7a2] text-xs font-semibold uppercase tracking-wide mb-1">
                      {msgType.subtitle}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {msgType.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-6">{msgType.description}</p>

                    {/* Actions */}
                    {isGenerated ? (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowPreview(isGenerated)}
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-gray-900"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="text-sm font-medium">Voir</span>
                          </button>
                          <button
                            onClick={() => handleCopy(isGenerated)}
                            className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-all flex items-center gap-2 text-gray-900"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(isGenerated, `message-${msgType.id}.txt`)}
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
                            handleGenerate(msgType.id);
                          }}
                          disabled={isLoading}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-gray-700 disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Lock className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {hasPremium ? 'Régénérer' : 'Régénérer (Premium)'}
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <GlowButton
                        onClick={() => handleGenerate(msgType.id)}
                        variant="primary"
                        size="default"
                        className="w-full"
                        loading={isLoading}
                        icon={Sparkles}
                      >
                        {isLoading ? 'Génération...' : 'Générer'}
                      </GlowButton>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-gray-200 shadow-2xl"
          >
            <div className="bg-gray-100 p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {messageTypes.find(m => showPreview.messageType === m.id) && (
                  <>
                    {React.createElement(
                      messageTypes.find(m => showPreview.messageType === m.id).icon,
                      { className: 'w-5 h-5 text-gray-700' }
                    )}
                    <h3 className="text-lg font-bold text-gray-900">{showPreview.title}</h3>
                  </>
                )}
              </div>
              <button
                onClick={() => setShowPreview(null)}
                className="text-gray-500 hover:text-gray-900 transition-colors text-xl"
              >
                ✕
              </button>
            </div>
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-100px)] bg-white">
              <div className="prose prose-lg max-w-none text-gray-800">
                <pre className="whitespace-pre-wrap font-sans leading-relaxed">
                  {showPreview.content}
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