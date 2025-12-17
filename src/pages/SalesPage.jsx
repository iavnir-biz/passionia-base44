import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useRequireAuth } from '@/components/hooks/useRequireAuth';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import UpgradeModal from '@/components/paywall/UpgradeModal';
import { Sparkles, Loader2, Eye, Copy, Download, Lock, Package, ShoppingCart, TrendingUp, Crown } from 'lucide-react';
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import GlowButton from '@/components/ui/GlowButton';
import SalesPageGenerator from '@/components/salespage/SalesPageGenerator';

export default function SalesPage() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPages, setGeneratedPages] = useState({
    low: null,
    bump: null,
    mid: null,
    high: null
  });
  const [selectedType, setSelectedType] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
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
        if (sessions[0].generated_sales_pages) {
          setGeneratedPages(sessions[0].generated_sales_pages);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleGenerate = async (type, isRegenerate = false) => {
    if (type !== 'low' && !hasPremium) {
      setShowUpgradeModal(true);
      return;
    }
    
    if (isRegenerate && !hasPremium) {
      setShowUpgradeModal(true);
      return;
    }
    
    setSelectedType(type);
    setIsGenerating(true);
  };

  const handleGenerationComplete = async (salesPage) => {
    try {
      const updatedPages = { ...generatedPages, [selectedType]: salesPage };
      setGeneratedPages(updatedPages);
      
      // Save to session
      await base44.entities.Session.update(session.id, {
        generated_sales_pages: updatedPages
      });
      
      setIsGenerating(false);
      setSelectedType(null);
    } catch (error) {
      console.error('Error saving sales page:', error);
      setIsGenerating(false);
      setSelectedType(null);
    }
  };

  const handleCopy = (page) => {
    if (!page?.html) return;
    
    navigator.clipboard.writeText(page.html);
    toast.success('Copié dans le presse-papier !');
  };

  const handleDownload = (page, filename) => {
    if (!page?.html) return;
    
    const blob = new Blob([page.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const offerTypes = [
    {
      id: 'low',
      title: 'Produit d\'appel',
      subtitle: 'Low ticket',
      description: 'Page de vente pour ton offre d\'entrée de gamme',
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      locked: false
    },
    {
      id: 'bump',
      title: 'Vente additionnelle',
      subtitle: 'Order bump',
      description: 'Page optimisée pour ton complément d\'offre',
      icon: ShoppingCart,
      color: 'from-green-500 to-green-600',
      locked: true
    },
    {
      id: 'mid',
      title: 'Offre intermédiaire',
      subtitle: 'Mid ticket',
      description: 'Landing page pour ton offre premium',
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      locked: true
    },
    {
      id: 'high',
      title: 'Offre premium',
      subtitle: 'High ticket',
      description: 'Page de vente haut de gamme élite',
      icon: Crown,
      color: 'from-yellow-500 to-amber-600',
      locked: true
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
      <Sidebar currentPage="SalesPage" progress={0} />
      
      <div className="flex-1 ml-72">
        <TopBar 
          title="Page de vente" 
          subtitle="Génère ta page de vente avec l'IA"
          user={user}
        />
        
        <main className="p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1b1b33] rounded-full mb-4">
                <Sparkles className="w-4 h-4 text-[#61f7a2]" />
                <span className="text-sm text-gray-300">Pages générées par IA</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-3">
                Tes Pages de Vente
              </h1>
              <p className="text-gray-400 text-lg">
                Crée des pages de vente optimisées pour tes offres
              </p>
            </div>

            {/* Offer type cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {offerTypes.map((offer, index) => {
                const Icon = offer.icon;
                const isGenerated = generatedPages[offer.id];
                
                return (
                  <div
                    key={offer.id}
                    className="relative bg-[#1b1b33] border border-[#2a2a45] rounded-2xl p-6 transition-all duration-300 hover:border-[#61f7a2]/30 hover:shadow-xl animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Gradient Header */}
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${offer.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-white mb-2">
                      {offer.title}
                    </h3>
                    <p className="text-[#61f7a2] text-sm mb-1">{offer.subtitle}</p>
                    <p className="text-gray-400 text-sm mb-6">{offer.description}</p>

                    {/* Actions */}
                    {!offer.locked ? (
                      isGenerated ? (
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
                              onClick={() => handleDownload(isGenerated, `page-${offer.id}.html`)}
                              variant="ghost"
                              size="sm"
                              icon={Download}
                            >
                              Télécharger
                            </GlowButton>
                          </div>
                          <GlowButton
                            onClick={() => handleGenerate(offer.id, true)}
                            variant="secondary"
                            size="sm"
                            className="w-full"
                            icon={!hasPremium ? Lock : undefined}
                          >
                            {!hasPremium ? 'Premium' : 'Régénérer'}
                          </GlowButton>
                        </div>
                      ) : (
                        <GlowButton
                          onClick={() => handleGenerate(offer.id)}
                          variant="primary"
                          size="default"
                          className="w-full"
                        >
                          Générer
                        </GlowButton>
                      )
                    ) : null}

                    {/* Lock Overlay */}
                    {offer.locked && (
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

          {/* Generation in progress */}
          <AnimatePresence>
            {isGenerating && (
              <SalesPageGenerator
                profile={profile}
                session={session}
                offerType={selectedType}
                onComplete={handleGenerationComplete}
                onCancel={() => {
                  setIsGenerating(false);
                  setSelectedType(null);
                }}
              />
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1b1b33] rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-[#2a2a45]">
            <div className="p-6 border-b border-[#2a2a45] flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Aperçu de la page</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
              <iframe
                srcDoc={showPreview.html}
                className="w-full h-[800px] border-0 bg-white"
                title="Sales Page Preview"
              />
            </div>
          </div>
        </div>
      )}

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  );
}