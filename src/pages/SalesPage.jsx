import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useRequireAuth } from '@/components/hooks/useRequireAuth';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Eye, Copy, Download } from 'lucide-react';
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import GlowButton from '@/components/ui/GlowButton';

export default function SalesPage() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [user, setUser] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPage, setGeneratedPage] = useState(null);
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

      // Check if sales page already generated
      const sessions = await base44.entities.Session.filter({ 
        created_by: currentUser.email 
      });
      
      if (sessions.length > 0 && sessions[0].generatedContent?.salesPage) {
        setGeneratedPage(sessions[0].generatedContent.salesPage);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const profiles = await base44.entities.UserProfile.filter({ 
        created_by: user.email 
      });
      const profile = profiles[0];

      const sessions = await base44.entities.Session.filter({ 
        created_by: user.email 
      });
      const session = sessions[0];

      const { data } = await base44.functions.invoke('generateSalesPage', {
        profile,
        session
      });

      if (data.success) {
        setGeneratedPage(data.salesPage);
        
        // Save to session
        await base44.entities.Session.update(session.id, {
          generatedContent: {
            ...session.generatedContent,
            salesPage: data.salesPage
          }
        });
      }
    } catch (error) {
      console.error('Error generating sales page:', error);
      alert('Erreur lors de la génération');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedPage?.html) return;
    
    navigator.clipboard.writeText(generatedPage.html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedPage?.html) return;
    
    const blob = new Blob([generatedPage.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'page-de-vente.html';
    a.click();
    URL.revokeObjectURL(url);
  };

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
        
        <main className="p-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Hero section */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-8 border border-green-200">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-[#61f7a2] rounded-2xl flex items-center justify-center shadow-sm">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Ta page de vente IA
                  </h2>
                  <p className="text-gray-600">
                    L'IA génère une page de vente complète et optimisée pour ton offre : 
                    structure professionnelle, images personnalisées, textes persuasifs et call-to-action.
                  </p>
                </div>
              </div>

              {!generatedPage ? (
                <GlowButton
                  onClick={handleGenerate}
                  loading={isGenerating}
                  icon={Sparkles}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {isGenerating ? 'Génération en cours...' : 'Générer ma page de vente'}
                </GlowButton>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <GlowButton
                    onClick={() => setShowPreview(true)}
                    icon={Eye}
                    variant="secondary"
                  >
                    Prévisualiser
                  </GlowButton>
                  <GlowButton
                    onClick={handleCopy}
                    icon={copied ? null : Copy}
                    variant="outline"
                  >
                    {copied ? 'Copié !' : 'Copier le code'}
                  </GlowButton>
                  <GlowButton
                    onClick={handleDownload}
                    icon={Download}
                    variant="outline"
                  >
                    Télécharger HTML
                  </GlowButton>
                  <GlowButton
                    onClick={handleGenerate}
                    loading={isGenerating}
                    icon={Sparkles}
                  >
                    Régénérer
                  </GlowButton>
                </div>
              )}
            </div>

            {/* Generated content preview */}
            {generatedPage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900">Aperçu de ta page</h3>
                </div>
                <div className="p-6 max-h-[600px] overflow-y-auto">
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: generatedPage.html }}
                  />
                </div>
              </motion.div>
            )}

            {isGenerating && (
              <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-[#61f7a2] mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">Génération de ta page de vente...</p>
                <p className="text-gray-500 text-sm">
                  L'IA analyse ton offre et crée une page optimisée (30-60 secondes)
                </p>
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Preview Modal */}
      {showPreview && generatedPage && (
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
                srcDoc={generatedPage.html}
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