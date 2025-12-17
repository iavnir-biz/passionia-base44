import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useRequireAuth } from '@/components/hooks/useRequireAuth';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [copied, setCopied] = useState(false);

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

  const handleGenerate = async (type) => {
    if (type !== 'low') {
      alert('Cette fonctionnalité est réservée à l\'abonnement premium');
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
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      <div className="flex min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
        <Sidebar currentPage="SalesPage" progress={0} />
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
      <Sidebar currentPage="SalesPage" progress={0} />
      
      <div className="flex-1 ml-72">
        <TopBar 
          title="Page de vente" 
          subtitle="Génère ta page de vente professionnelle avec l'IA"
          user={user}
        />
        
        <main className="p-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Hero section */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-8 border border-green-200">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-[#61f7a2] rounded-2xl flex items-center justify-center shadow-sm">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Tes pages de vente IA
                  </h2>
                  <p className="text-gray-600">
                    L'IA génère des pages de vente complètes et optimisées pour chacune de tes offres : 
                    structure professionnelle, images personnalisées, textes persuasifs et call-to-action.
                  </p>
                </div>
              </div>
            </div>

            {/* Offer type cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {offerTypes.map((offer, index) => {
                const Icon = offer.icon;
                const isGenerated = generatedPages[offer.id];
                
                return (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative rounded-2xl border-2 overflow-hidden ${
                      offer.locked 
                        ? 'border-gray-300 bg-gray-50' 
                        : 'border-green-200 bg-white hover:shadow-lg transition-shadow'
                    }`}
                  >
                    <div className="p-6">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${offer.color} flex items-center justify-center mb-4 shadow-sm ${
                        offer.locked ? 'opacity-50' : ''
                      }`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{offer.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{offer.subtitle}</p>
                      <p className="text-xs text-gray-500 mb-4">{offer.description}</p>
                      
                      {offer.locked ? (
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Lock className="w-4 h-4" />
                          <span>Abonnement premium</span>
                        </div>
                      ) : isGenerated ? (
                        <div className="space-y-2">
                          <GlowButton
                            onClick={() => {
                              setShowPreview(isGenerated);
                            }}
                            variant="secondary"
                            size="sm"
                            className="w-full"
                            icon={Eye}
                          >
                            Voir
                          </GlowButton>
                          <div className="flex gap-2">
                            <GlowButton
                              onClick={() => handleCopy(isGenerated)}
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              <Copy className="w-3 h-3" />
                            </GlowButton>
                            <GlowButton
                              onClick={() => handleDownload(isGenerated, `page-${offer.id}.html`)}
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              <Download className="w-3 h-3" />
                            </GlowButton>
                          </div>
                        </div>
                      ) : (
                        <GlowButton
                          onClick={() => handleGenerate(offer.id)}
                          icon={Sparkles}
                          size="sm"
                          className="w-full"
                        >
                          Générer
                        </GlowButton>
                      )}
                    </div>
                    
                    {offer.locked && (
                      <div className="absolute inset-0 bg-gray-100/80 backdrop-blur-sm flex items-center justify-center">
                        <div className="text-center">
                          <Lock className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm font-semibold text-gray-600">Premium</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
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
          </motion.div>
        </main>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPreview(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Prévisualisation complète</h3>
              <button 
                onClick={() => setShowPreview(false)}
                className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <iframe
                srcDoc={showPreview.html}
                className="w-full h-[800px] border-0"
                title="Sales Page Preview"
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}