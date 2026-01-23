import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useRequireAuth } from '@/components/hooks/useRequireAuth';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Lock, Type, Image as ImageIcon, Brain } from 'lucide-react';
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import GlowButton from '@/components/ui/GlowButton';
import ChatBubble from '@/components/chat/ChatBubble';
import { cn } from "@/lib/utils";
import UpgradeModal from '@/components/paywall/UpgradeModal';
import { calculateProgressFromSession } from '@/utils/progressUtils';

export default function AdCopies() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showBlur, setShowBlur] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBlur(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const sessions = await base44.entities.Session.filter({ created_by: currentUser.email });
      if (sessions.length > 0) {
        setSession(sessions[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const adTypes = [
    {
      id: 'copies',
      title: 'Ad Copies',
      subtitle: 'Textes publicitaires',
      description: 'Génère 5 titres, 5 descriptions et 5 CTAs',
      icon: Type,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'visuals',
      title: 'Visuels',
      subtitle: 'Images publicitaires',
      description: 'Génère des concepts visuels pour tes ads',
      icon: ImageIcon,
      color: 'from-purple-500 to-pink-500',
    }
  ];

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#61f7a2]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar currentPage="AdCopies" progress={calculateProgressFromSession(session)} user={user} />
      
      <div className="flex-1 ml-72">
        <TopBar 
          title="Publicité ADS" 
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
                <span className="text-xs font-medium text-gray-700">Publicités générées par IA</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Tes publicités
              </h1>
              <p className="text-gray-600 text-lg">
                Copies visuelles pour maximiser tes conversions
              </p>
            </motion.div>

            {/* Ad Type Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {adTypes.map((type, index) => {
                const Icon = type.icon;
                
                return (
                  <motion.div
                    key={type.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="relative"
                  >
                    <div className={cn(
                      "bg-gray-50 border border-gray-200 rounded-2xl p-6 transition-all",
                      showBlur && "opacity-60"
                    )}>
                      {/* Icon Header */}
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-4`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>

                      {/* Content */}
                      <div>
                        <p className="text-[#61f7a2] text-xs font-semibold uppercase tracking-wide mb-1">
                          {type.subtitle}
                        </p>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {type.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-6">{type.description}</p>

                        {/* Fake content */}
                        <div className="space-y-3">
                          <div className="h-16 bg-white border border-gray-200 rounded-xl" />
                          <div className="h-16 bg-white border border-gray-200 rounded-xl" />
                          <div className="h-16 bg-white border border-gray-200 rounded-xl" />
                        </div>
                      </div>
                    </div>

                    {/* Lock Overlay */}
                    {showBlur && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl">
                        <Lock className="w-10 h-10 text-gray-400 mb-3" />
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Premium</h4>
                        <p className="text-gray-600 text-sm mb-4 text-center px-6">
                          Débloque cette fonctionnalité
                        </p>
                        <GlowButton
                          onClick={() => setShowUpgradeModal(true)}
                          variant="primary"
                          size="sm"
                        >
                          Passer à Premium
                        </GlowButton>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      <ChatBubble />
    </div>
  );
}
