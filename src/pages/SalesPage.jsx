import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useRequireAuth } from '@/components/hooks/useRequireAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import UpgradeModal from '@/components/paywall/UpgradeModal';
import { Sparkles, Loader2, Eye, Copy, Download, Lock, Package, ShoppingCart, TrendingUp, Crown, Brain } from 'lucide-react';
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import GlowButton from '@/components/ui/GlowButton';
import ChatBubble from '@/components/chat/ChatBubble';
import { cn } from "@/lib/utils";

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
  const [showCustomization, setShowCustomization] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#61f7a2');
  const [selectedTone, setSelectedTone] = useState('inspirant');
  const [generationStep, setGenerationStep] = useState(0);
  const [previewHtml, setPreviewHtml] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const isNonEmpty = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return true;
    if (typeof value === 'boolean') return true;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return false;
  };

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // 🔥 DB-first: charger Session via sessionId
      const sessionId = currentUser.sessionId;
      if (!sessionId) {
        console.error('[SalesPage] No sessionId');
        return;
      }

      const sessions = await base44.entities.Session.filter({ id: sessionId });
      const userSession = sessions?.[0];
      
      if (!userSession) {
        console.error('[SalesPage] Session not found');
        return;
      }

      setSession(userSession);
      console.log('[SalesPage] Session loaded:', userSession);
      console.log('[SalesPage] Generated sales pages:', userSession.generated_sales_pages);
      
      // Charger pages si présentes
      if (isNonEmpty(userSession.generated_sales_pages)) {
        setGeneratedPages(userSession.generated_sales_pages);
      }

      const profiles = await base44.entities.UserProfile.filter({ 
        created_by: currentUser.email 
      });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        setHasPremium(profiles[0].has_paid === true);
      }
    } catch (error) {
      console.error('[SalesPage] Error loading data:', error);
    }
  };

  const handleGenerate = async (type) => {
    if (type !== 'low' && !hasPremium) {
      setShowUpgradeModal(true);
      return;
    }

    // Check if already generated
    if (generatedPages[type]) {
      return;
    }
    
    setSelectedType(type);
    setShowCustomization(true);
  };

  const startGeneration = async () => {
    setShowCustomization(false);
    setIsGenerating(true);
    setGenerationStep(0);
    setPreviewHtml('');

    const steps = [
      { label: 'Analyse du profil', duration: 2000 },
      { label: 'Création de l\'image hero', duration: 15000 },
      { label: 'Rédaction du contenu', duration: 20000 },
      { label: 'Construction de la page', duration: 3000 },
      { label: 'Design & couleurs', duration: 2000 },
      { label: 'Finalisation', duration: 2000 }
    ];

    // Start step progression
    for (let i = 0; i < steps.length; i++) {
      setGenerationStep(i);
      await new Promise(resolve => setTimeout(resolve, steps[i].duration));
    }

    try {
      const response = await base44.functions.invoke('generateSalesPage', {
        profile,
        session,
        offerType: selectedType,
        color: selectedColor,
        tone: selectedTone
      });

      const salesPage = response.data.salesPage;

      const updatedPages = { ...generatedPages, [selectedType]: salesPage };
      setGeneratedPages(updatedPages);
      
      await base44.entities.Session.update(session.id, {
        generated_sales_pages: updatedPages
      });

      // Recharger pour confirmer
      await loadData();

      toast.success('Page de vente générée !');
    } catch (error) {
      console.error('Error generating sales page:', error);
      toast.error('Erreur lors de la génération');
    } finally {
      setIsGenerating(false);
      setSelectedType(null);
      setGenerationStep(0);
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

  const colorOptions = [
    { name: 'Vert Passion', value: '#61f7a2' },
    { name: 'Bleu', value: '#3b82f6' },
    { name: 'Violet', value: '#a855f7' },
    { name: 'Orange', value: '#f97316' },
  ];

  const toneOptions = [
    { name: 'Inspirant', value: 'inspirant' },
    { name: 'Direct', value: 'direct' },
    { name: 'Premium', value: 'premium' },
    { name: 'Bienveillant', value: 'bienveillant' },
  ];

  const generationSteps = [
    'Analyse du profil',
    'Création de l\'image hero',
    'Rédaction du contenu',
    'Construction de la page',
    'Design & couleurs',
    'Finalisation'
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
      <Sidebar currentPage="SalesPage" progress={0} />
      
      <div className="flex-1 ml-72">
        <TopBar 
          title="Pages de vente" 
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
                <span className="text-xs font-medium text-gray-700">Pages générées par IA</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Tes pages de vente
              </h1>
              <p className="text-gray-600 text-lg">
                Crée des pages de vente optimisées pour tes offres
              </p>
            </motion.div>

            {/* Offer type cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {offerTypes.map((offer, index) => {
                const Icon = offer.icon;
                const isGenerated = generatedPages[offer.id];
                
                return (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className={cn(
                      "relative bg-gray-50 border border-gray-200 rounded-2xl p-6 transition-all",
                      !offer.locked && "hover:shadow-md"
                    )}
                  >
                    {/* Icon Header */}
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${offer.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Content */}
                    <div className={cn(offer.locked && "filter blur-sm select-none")}>
                      <p className="text-[#61f7a2] text-xs font-semibold uppercase tracking-wide mb-1">
                        {offer.subtitle}
                      </p>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {offer.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-6">
                        {offer.description}
                      </p>
                    </div>

                    {/* Actions */}
                    {!offer.locked && (
                      isGenerated ? (
                        <div className="flex gap-2">
                          <GlowButton
                            onClick={() => setShowPreview(isGenerated)}
                            variant="secondary"
                            size="sm"
                            icon={Eye}
                            className="flex-1"
                          >
                            Voir
                          </GlowButton>
                          <button
                            onClick={() => handleCopy(isGenerated)}
                            className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-all flex items-center gap-2 text-gray-900"
                          >
                            <Copy className="w-4 h-4" />
                            <span className="text-sm font-medium">Copier</span>
                          </button>
                          <button
                            onClick={() => handleDownload(isGenerated, `page-${offer.id}.html`)}
                            className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-all flex items-center gap-2 text-gray-900"
                          >
                            <Download className="w-4 h-4" />
                            <span className="text-sm font-medium">Télécharger</span>
                          </button>
                        </div>
                      ) : (
                        <GlowButton
                          onClick={() => handleGenerate(offer.id)}
                          variant="primary"
                          size="default"
                          icon={Sparkles}
                          className="w-full"
                        >
                          Ouvrir
                        </GlowButton>
                      )
                    )}

                    {/* Lock Overlay */}
                    {offer.locked && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-2xl">
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

          </div>
        </main>
      </div>

      {/* Customization Modal */}
      <AnimatePresence>
        {showCustomization && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-xl"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Personnalise ta page</h3>
              <p className="text-gray-600 mb-6">Choisis la couleur et le ton de ta page de vente</p>

              {/* Color Selection */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-900 mb-3 block">Couleur principale</label>
                <div className="grid grid-cols-4 gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={cn(
                        "h-16 rounded-xl transition-all border-2",
                        selectedColor === color.value ? "border-gray-900 scale-105" : "border-gray-200"
                      )}
                      style={{ backgroundColor: color.value }}
                    >
                      <span className="sr-only">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone Selection */}
              <div className="mb-8">
                <label className="text-sm font-semibold text-gray-900 mb-3 block">Ton de communication</label>
                <div className="grid grid-cols-2 gap-3">
                  {toneOptions.map((tone) => (
                    <button
                      key={tone.value}
                      onClick={() => setSelectedTone(tone.value)}
                      className={cn(
                        "px-4 py-3 rounded-xl text-sm font-medium transition-all border",
                        selectedTone === tone.value
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                      )}
                    >
                      {tone.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <GlowButton
                  onClick={() => setShowCustomization(false)}
                  variant="secondary"
                  className="flex-1"
                >
                  Annuler
                </GlowButton>
                <GlowButton
                  onClick={startGeneration}
                  variant="primary"
                  icon={Sparkles}
                  className="flex-1"
                >
                  Générer
                </GlowButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generation Modal */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl max-w-6xl w-full h-[85vh] overflow-hidden shadow-2xl"
            >
              <div className="h-full flex">
                {/* Left: Steps */}
                <div className="w-80 bg-gray-50 p-6 border-r border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Génération en cours</h3>
                  <div className="space-y-4">
                    {generationSteps.map((step, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg transition-all",
                          index === generationStep && "bg-white shadow-sm",
                          index < generationStep && "opacity-50"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                          index < generationStep && "bg-[#61f7a2] text-white",
                          index === generationStep && "bg-[#61f7a2] text-white animate-pulse",
                          index > generationStep && "bg-gray-200 text-gray-400"
                        )}>
                          {index < generationStep ? '✓' : index + 1}
                        </div>
                        <span className={cn(
                          "text-sm font-medium",
                          index === generationStep && "text-gray-900",
                          index !== generationStep && "text-gray-600"
                        )}>
                          {step}
                        </span>
                        {index === generationStep && (
                          <Loader2 className="w-4 h-4 animate-spin text-[#61f7a2] ml-auto" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Preview */}
                <div className="flex-1 p-6 overflow-hidden">
                  <div className="h-full bg-gray-100 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 animate-spin text-[#61f7a2] mx-auto mb-4" />
                      <p className="text-gray-600">Création de ta page de vente...</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Aperçu de la page</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-900 transition-colors"
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      <ChatBubble />
    </div>
  );
}