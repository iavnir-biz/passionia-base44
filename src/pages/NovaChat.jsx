import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useRequireAuth } from '@/components/hooks/useRequireAuth';
import { motion } from 'framer-motion';
import { Sparkles, Send, Zap, Target, TrendingUp, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import ChatBubble from '@/components/chat/ChatBubble';

export default function NovaChat() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Salut ! Je suis Noah, ton coach IA personnalisé 🚀\n\nJe suis là pour t'accompagner à chaque étape de ton parcours vers la liberté financière.\n\nPose-moi toutes tes questions : stratégie, marketing, création de produit, pricing... Je suis là pour toi !"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadUser();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Afficher le paywall après 3 secondes
    const timer = setTimeout(() => {
      setShowPaywall(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // TODO: Appeler l'API Nova ici avec le contexte utilisateur
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "Je suis là pour t'aider ! Cette fonctionnalité arrive très bientôt 🎯\n\nEn attendant, continue d'avancer sur ton plan d'action et tes objectifs du jour."
        }]);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen bg-[#11112b]">
        <Sidebar currentPage="NovaChat" progress={0} />
        <div className="flex-1 ml-72">
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin w-8 h-8 border-2 border-[#61f7a2] border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      <Sidebar currentPage="NovaChat" progress={0} />
      
      <div className="flex-1 ml-72">
        <TopBar 
          title="Discuter avec Noah" 
          subtitle="Ton coach IA disponible 24/7"
          user={user}
        />
        
        <main className="p-8 max-w-5xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`space-y-6 ${showPaywall ? 'blur-lg pointer-events-none' : ''}`}
          >
            {/* Header avec description */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-8 border border-green-200 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-[#61f7a2] rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Noah, ton coach IA</h2>
                  <p className="text-gray-600">
                    Noah est ton coach IA qui t'accompagne pour transformer ton savoir-faire en business rentable.
                    Pose-lui toutes tes questions sur la création de produits, le marketing, le pricing, ou tout autre aspect de ton projet !
                  </p>
                </div>
              </div>

              {/* Nova capabilities */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                  <Zap className="w-6 h-6 text-[#61f7a2] mb-2 mx-auto" />
                  <p className="text-sm font-semibold text-gray-900">Conseils personnalisés</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                  <Target className="w-6 h-6 text-blue-500 mb-2 mx-auto" />
                  <p className="text-sm font-semibold text-gray-900">Stratégies marketing</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                  <TrendingUp className="w-6 h-6 text-purple-500 mb-2 mx-auto" />
                  <p className="text-sm font-semibold text-gray-900">Optimisation revenus</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                  <Lightbulb className="w-6 h-6 text-yellow-500 mb-2 mx-auto" />
                  <p className="text-sm font-semibold text-gray-900">Idées créatives</p>
                </div>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
              {/* Messages */}
              <div className="h-[500px] overflow-y-auto p-8 space-y-6">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-10 h-10 rounded-xl bg-[#61f7a2] flex items-center justify-center mr-3 flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] rounded-2xl p-5 ${
                        msg.role === 'user'
                          ? 'bg-[#61f7a2] text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-base whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="w-10 h-10 rounded-xl bg-[#61f7a2] flex items-center justify-center mr-3">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl p-5">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex gap-4">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Pose ta question à Noah..."
                    className="flex-1 min-h-[80px] max-h-[150px] resize-none bg-white text-base"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    className="bg-[#61f7a2] hover:bg-[#4de88f] text-white h-[80px] px-8 text-base font-semibold"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Envoyer
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Paywall Overlay */}
          {showPaywall && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center z-10 mt-20"
            >
              <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-10 max-w-lg text-center">
                <div className="w-20 h-20 bg-[#61f7a2]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-[#61f7a2]" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Noah IA - Réservé à l'Abonnement Ultime
                </h2>
                <p className="text-gray-600 text-lg mb-8">
                  Le coaching IA personnalisé illimité avec Noah est exclusivement disponible dans l'abonnement premium ultime. Passe au niveau supérieur pour débloquer cette fonctionnalité.
                </p>
                <Button
                  onClick={() => window.location.href = '/plan-action'}
                  className="bg-[#61f7a2] hover:bg-[#4de88f] text-white text-lg font-semibold px-8 py-6 h-auto"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Découvrir l'abonnement ultime
                </Button>
                <p className="text-gray-500 text-sm mt-4">
                  Réservé aux membres de l'abonnement premium
                </p>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Chat Bubble (pour accès rapide depuis autres pages) */}
      <ChatBubble />
    </div>
  );
}