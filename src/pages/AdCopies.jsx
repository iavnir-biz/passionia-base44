import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useRequireAuth } from '@/components/hooks/useRequireAuth';
import { Sparkles, Loader2, Lock, Type, Image as ImageIcon } from 'lucide-react';
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import GlowButton from '@/components/ui/GlowButton';
import { cn } from "@/lib/utils";
import UpgradeModal from '@/components/paywall/UpgradeModal';

export default function AdCopies() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [user, setUser] = useState(null);
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
      <div className="flex items-center justify-center h-screen bg-[#11112b]">
        <Loader2 className="w-8 h-8 animate-spin text-[#61f7a2]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#11112b]">
      <Sidebar currentPage="AdCopies" progress={0} />
      
      <div className="flex-1 ml-72">
        <TopBar 
          title="Publicité ADS" 
          subtitle="Génère tes publicités avec l'IA"
          user={user}
        />
        
        <main className="p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1b1b33] rounded-full mb-4">
                <Sparkles className="w-4 h-4 text-[#61f7a2]" />
                <span className="text-sm text-gray-300">Publicités générées par IA</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-3">
                Tes Publicités
              </h1>
              <p className="text-gray-400 text-lg">
                Copies et visuels pour maximiser tes conversions
              </p>
            </div>

            {/* Ad Type Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {adTypes.map((type, index) => {
                const Icon = type.icon;
                
                return (
                  <div
                    key={type.id}
                    className="relative"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={cn(
                      "bg-[#1b1b33] border border-[#2a2a45] rounded-2xl p-6 transition-all duration-300 hover:border-[#61f7a2]/30 animate-fade-in blur-content"
                    )}>
                      {/* Gradient Header */}
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-4`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>

                      {/* Content */}
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {type.title}
                      </h3>
                      <p className="text-[#61f7a2] text-sm mb-1">{type.subtitle}</p>
                      <p className="text-gray-400 text-sm mb-6">{type.description}</p>

                      {/* Fake content */}
                      <div className="space-y-3">
                        <div className="h-16 bg-[#0f0f1f] rounded-xl" />
                        <div className="h-16 bg-[#0f0f1f] rounded-xl" />
                        <div className="h-16 bg-[#0f0f1f] rounded-xl" />
                      </div>
                    </div>

                    {/* Lock Overlay */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl">
                      <Lock className="w-12 h-12 text-[#61f7a2] mb-4" />
                      <h4 className="text-xl font-bold text-white mb-2">Premium</h4>
                      <p className="text-gray-400 text-sm mb-4 text-center px-6">
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
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  );
}