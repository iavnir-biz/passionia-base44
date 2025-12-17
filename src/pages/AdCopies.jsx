import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useRequireAuth } from '@/components/hooks/useRequireAuth';
import { Sparkles, Loader2, Copy, Image as ImageIcon, Type, FileText, MousePointer, Lock } from 'lucide-react';
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import GlowButton from '@/components/ui/GlowButton';
import { toast } from 'sonner';
import UpgradeModal from '@/components/paywall/UpgradeModal';

export default function AdCopies() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatedAd, setGeneratedAd] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
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
        if (sessions[0].generated_ad_copy) {
          setGeneratedAd(sessions[0].generated_ad_copy);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleGenerate = async (isRegenerate = false) => {
    if (!hasPremium) {
      setShowUpgradeModal(true);
      return;
    }

    if (isRegenerate && !hasPremium) {
      setShowUpgradeModal(true);
      return;
    }

    setLoading(true);

    try {
      const response = await base44.functions.invoke('generateAdCopy', {
        profile,
        session
      });

      setGeneratedAd(response.data);

      // Save to session
      await base44.entities.Session.update(session.id, {
        generated_ad_copy: response.data
      });

      toast.success('Publicités générées avec succès !');
    } catch (error) {
      console.error('Error generating ad copy:', error);
      toast.error('Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copié dans le presse-papier !');
  };

  const handleCopyAll = (items) => {
    const text = items.join('\n\n');
    navigator.clipboard.writeText(text);
    toast.success('Tous les éléments copiés !');
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#11112b]">
        <Loader2 className="w-8 h-8 animate-spin text-[#61f7a2]" />
      </div>
    );
  }

  if (!hasPremium) {
    return (
      <div className="flex min-h-screen bg-[#11112b]">
        <Sidebar currentPage="AdCopies" progress={0} />
        
        <div className="flex-1 ml-72">
          <TopBar 
            title="Vos publicités" 
            subtitle="Générez vos copies publicitaires"
            user={user}
          />
          
          <main className="p-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Fonctionnalité Premium
              </h2>
              <p className="text-gray-400 mb-8">
                Accédez à la génération de copies publicitaires professionnelles avec l'abonnement Premium
              </p>
              <GlowButton
                onClick={() => setShowUpgradeModal(true)}
                variant="primary"
                size="lg"
              >
                Passer à Premium
              </GlowButton>
            </div>
          </main>
        </div>

        <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#11112b]">
      <Sidebar currentPage="AdCopies" progress={0} />
      
      <div className="flex-1 ml-72">
        <TopBar 
          title="Vos publicités" 
          subtitle="Génère tes copies publicitaires avec l'IA"
          user={user}
        />
        
        <main className="p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1b1b33] rounded-full mb-4">
                <Sparkles className="w-4 h-4 text-[#61f7a2]" />
                <span className="text-sm text-gray-300">Copies générées par IA</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-3">
                Tes Publicités
              </h1>
              <p className="text-gray-400 text-lg">
                Génère une image et 5 variantes de copies pour tes publicités
              </p>
            </div>

            {/* Generate Button */}
            {!generatedAd ? (
              <div className="flex justify-center">
                <GlowButton
                  onClick={() => handleGenerate()}
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="px-12"
                >
                  {loading ? 'Génération en cours...' : 'Générer mes publicités'}
                </GlowButton>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Visual Image */}
                {generatedAd.image_url && (
                  <div className="bg-[#1b1b33] border border-[#2a2a45] rounded-2xl p-6 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">Visuel publicitaire</h3>
                          <p className="text-sm text-gray-400">Image générée pour ta publicité</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl overflow-hidden">
                      <img 
                        src={generatedAd.image_url} 
                        alt="Visuel publicitaire" 
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                )}

                {/* Headlines */}
                <div className="bg-[#1b1b33] border border-[#2a2a45] rounded-2xl p-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Type className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Titres (Headlines)</h3>
                        <p className="text-sm text-gray-400">5 variantes de titres accrocheurs</p>
                      </div>
                    </div>
                    <GlowButton
                      onClick={() => handleCopyAll(generatedAd.headlines)}
                      variant="ghost"
                      size="sm"
                      icon={Copy}
                    >
                      Copier tout
                    </GlowButton>
                  </div>
                  <div className="space-y-3">
                    {generatedAd.headlines?.map((headline, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-[#0f0f1f] rounded-xl hover:bg-[#1a1a2f] transition-colors group">
                        <span className="text-[#61f7a2] font-bold text-sm">{index + 1}</span>
                        <p className="flex-1 text-white">{headline}</p>
                        <button
                          onClick={() => handleCopy(headline)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-[#61f7a2]"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subtitles */}
                <div className="bg-[#1b1b33] border border-[#2a2a45] rounded-2xl p-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Sous-titres</h3>
                        <p className="text-sm text-gray-400">5 variantes de sous-titres percutants</p>
                      </div>
                    </div>
                    <GlowButton
                      onClick={() => handleCopyAll(generatedAd.subtitles)}
                      variant="ghost"
                      size="sm"
                      icon={Copy}
                    >
                      Copier tout
                    </GlowButton>
                  </div>
                  <div className="space-y-3">
                    {generatedAd.subtitles?.map((subtitle, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-[#0f0f1f] rounded-xl hover:bg-[#1a1a2f] transition-colors group">
                        <span className="text-[#61f7a2] font-bold text-sm">{index + 1}</span>
                        <p className="flex-1 text-white">{subtitle}</p>
                        <button
                          onClick={() => handleCopy(subtitle)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-[#61f7a2]"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Descriptions */}
                <div className="bg-[#1b1b33] border border-[#2a2a45] rounded-2xl p-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Descriptions</h3>
                        <p className="text-sm text-gray-400">5 variantes de descriptions convaincantes</p>
                      </div>
                    </div>
                    <GlowButton
                      onClick={() => handleCopyAll(generatedAd.descriptions)}
                      variant="ghost"
                      size="sm"
                      icon={Copy}
                    >
                      Copier tout
                    </GlowButton>
                  </div>
                  <div className="space-y-3">
                    {generatedAd.descriptions?.map((description, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-[#0f0f1f] rounded-xl hover:bg-[#1a1a2f] transition-colors group">
                        <span className="text-[#61f7a2] font-bold text-sm">{index + 1}</span>
                        <p className="flex-1 text-white">{description}</p>
                        <button
                          onClick={() => handleCopy(description)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-[#61f7a2]"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTAs */}
                <div className="bg-[#1b1b33] border border-[#2a2a45] rounded-2xl p-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                        <MousePointer className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Call-to-Action (CTA)</h3>
                        <p className="text-sm text-gray-400">5 variantes de boutons d'action</p>
                      </div>
                    </div>
                    <GlowButton
                      onClick={() => handleCopyAll(generatedAd.ctas)}
                      variant="ghost"
                      size="sm"
                      icon={Copy}
                    >
                      Copier tout
                    </GlowButton>
                  </div>
                  <div className="space-y-3">
                    {generatedAd.ctas?.map((cta, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-[#0f0f1f] rounded-xl hover:bg-[#1a1a2f] transition-colors group">
                        <span className="text-[#61f7a2] font-bold text-sm">{index + 1}</span>
                        <p className="flex-1 text-white font-semibold">{cta}</p>
                        <button
                          onClick={() => handleCopy(cta)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-[#61f7a2]"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Regenerate Button */}
                <div className="flex justify-center pt-4">
                  <GlowButton
                    onClick={() => handleGenerate(true)}
                    variant="secondary"
                    size="default"
                    loading={loading}
                  >
                    Régénérer
                  </GlowButton>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  );
}