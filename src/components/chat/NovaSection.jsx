import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, Zap, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function NovaSection() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Salut ! Je suis Nova, ton coach IA personnalisé 🚀\n\nJe suis là pour t'accompagner à chaque étape de ton parcours vers la liberté financière."
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // TODO: Appeler l'API Nova ici
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "Je suis là pour t'aider ! Cette fonctionnalité arrive très bientôt 🎯"
        }]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      {/* Header avec description */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-6 border border-green-200">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 bg-[#61f7a2] rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Discuter avec Nova</h3>
            <p className="text-gray-600 text-sm">
              Nova est ton coach IA qui t'accompagne pour transformer ton savoir-faire en business rentable.
              Pose-lui toutes tes questions !
            </p>
          </div>
        </div>

        {/* Nova capabilities */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 border border-gray-200">
            <Zap className="w-5 h-5 text-[#61f7a2] mb-1" />
            <p className="text-xs font-semibold text-gray-900">Conseils personnalisés</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-200">
            <Target className="w-5 h-5 text-blue-500 mb-1" />
            <p className="text-xs font-semibold text-gray-900">Stratégies marketing</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-200">
            <TrendingUp className="w-5 h-5 text-purple-500 mb-1" />
            <p className="text-xs font-semibold text-gray-900">Optimisation revenus</p>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Messages */}
        <div className="h-[400px] overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.role === 'user'
                    ? 'bg-[#61f7a2] text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl p-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Pose ta question à Nova..."
              className="flex-1 min-h-[60px] max-h-[120px] resize-none bg-white"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-[#61f7a2] hover:bg-[#4de88f] text-white h-[60px] px-6"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}