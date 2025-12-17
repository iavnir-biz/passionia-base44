import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Type, 
  Layout, 
  Palette, 
  CheckCircle, 
  Loader2 
} from 'lucide-react';

const generationSteps = [
  { 
    id: 'analyzing', 
    label: 'Analyse de ton profil', 
    icon: Sparkles,
    description: 'Récupération de tes informations...'
  },
  { 
    id: 'hero', 
    label: 'Création de l\'image hero', 
    icon: ImageIcon,
    description: 'Génération d\'une image unique avec DALL-E...'
  },
  { 
    id: 'content', 
    label: 'Rédaction du contenu', 
    icon: Type,
    description: 'Écriture des textes persuasifs...'
  },
  { 
    id: 'structure', 
    label: 'Construction de la page', 
    icon: Layout,
    description: 'Assemblage de la structure HTML...'
  },
  { 
    id: 'styling', 
    label: 'Design et couleurs', 
    icon: Palette,
    description: 'Application du style professionnel...'
  },
  { 
    id: 'complete', 
    label: 'Finalisation', 
    icon: CheckCircle,
    description: 'Ta page est prête !'
  }
];

export default function SalesPageGenerator({ profile, session, offerType, onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [previewContent, setPreviewContent] = useState({
    hero: '',
    problem: '',
    solution: '',
    price: '',
    cta: ''
  });
  const [heroImage, setHeroImage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    generateSalesPage();
  }, []);

  const generateSalesPage = async () => {
    try {
      // Step 1: Analyzing
      setCurrentStep(0);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 2: Generate hero image
      setCurrentStep(1);
      setPreviewContent(prev => ({ 
        ...prev, 
        hero: `Transforme ton savoir-faire en ${profile?.passion || 'business'} rentable` 
      }));
      
      const imagePrompt = `Professional hero image for ${profile.passion} online course. Modern, clean, inspirational style with soft colors. Show success and transformation. No text, photorealistic.`;
      
      const imageResult = await base44.integrations.Core.GenerateImage({
        prompt: imagePrompt
      });
      
      setHeroImage(imageResult.url);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 3: Generate content
      setCurrentStep(2);
      setPreviewContent(prev => ({ 
        ...prev, 
        problem: `Tu as une passion pour ${profile?.passion}, mais tu ne sais pas comment la transformer en revenus ?`,
        solution: `Découvre comment créer ton premier produit digital et générer tes premiers revenus en ligne.`
      }));
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 4: Structure
      setCurrentStep(3);
      setPreviewContent(prev => ({ 
        ...prev, 
        price: '37€',
        cta: 'Je veux transformer ma passion en business'
      }));
      
      // Call backend to generate full HTML
      const { data } = await base44.functions.invoke('generateSalesPage', {
        profile,
        session,
        offerType,
        heroImageUrl: heroImage || imageResult.url
      });
      
      if (!data.success) {
        throw new Error(data.error || 'Erreur de génération');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 5: Styling
      setCurrentStep(4);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 6: Complete
      setCurrentStep(5);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onComplete(data.salesPage);
      
    } catch (err) {
      console.error('Error generating sales page:', err);
      setError(err.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl"
      >
        <div className="p-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Génération de ta page de vente en cours...
          </h2>
          <p className="text-gray-600">
            L'IA crée une landing page optimisée rien que pour toi
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(90vh-140px)]">
          {/* Left: Progress steps */}
          <div className="p-8 space-y-4 overflow-y-auto border-r border-gray-200 bg-gray-50">
            {generationSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isComplete = index < currentStep;
              
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-start gap-4 p-4 rounded-xl ${
                    isActive 
                      ? 'bg-white border-2 border-[#61f7a2] shadow-sm' 
                      : isComplete 
                      ? 'bg-white border border-gray-200' 
                      : 'bg-white/50 border border-gray-100'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isComplete 
                      ? 'bg-[#61f7a2]' 
                      : isActive 
                      ? 'bg-[#61f7a2]/20' 
                      : 'bg-gray-100'
                  }`}>
                    {isComplete ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : isActive ? (
                      <Loader2 className="w-6 h-6 text-[#61f7a2] animate-spin" />
                    ) : (
                      <Icon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold mb-1 ${
                      isActive ? 'text-gray-900' : isComplete ? 'text-gray-700' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </h3>
                    <p className={`text-sm ${
                      isActive ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm">{error}</p>
                <button
                  onClick={onCancel}
                  className="mt-2 text-red-600 text-sm font-semibold hover:underline"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>

          {/* Right: Live preview */}
          <div className="p-8 overflow-y-auto bg-gradient-to-b from-white to-gray-50">
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-block px-3 py-1 bg-[#61f7a2]/10 text-[#61f7a2] text-xs font-semibold rounded-full mb-4">
                  Aperçu en direct
                </div>
              </div>

              {/* Hero preview */}
              {heroImage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl overflow-hidden shadow-lg"
                >
                  <img 
                    src={heroImage} 
                    alt="Hero" 
                    className="w-full h-48 object-cover"
                  />
                </motion.div>
              )}

              {/* Title preview */}
              {previewContent.hero && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {previewContent.hero}
                  </h1>
                </motion.div>
              )}

              {/* Problem preview */}
              {previewContent.problem && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-red-50 border border-red-200 rounded-xl p-4"
                >
                  <p className="text-red-800 font-medium">
                    {previewContent.problem}
                  </p>
                </motion.div>
              )}

              {/* Solution preview */}
              {previewContent.solution && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-green-50 border border-green-200 rounded-xl p-4"
                >
                  <p className="text-green-800 font-medium">
                    {previewContent.solution}
                  </p>
                </motion.div>
              )}

              {/* Price preview */}
              {previewContent.price && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-center"
                >
                  <div className="inline-block bg-white border-2 border-[#61f7a2] rounded-2xl px-8 py-4">
                    <p className="text-gray-600 text-sm mb-1">Prix de lancement</p>
                    <p className="text-4xl font-bold text-[#61f7a2]">
                      {previewContent.price}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* CTA preview */}
              {previewContent.cta && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="text-center"
                >
                  <button className="bg-[#61f7a2] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-[#4de88f] transition-colors">
                    {previewContent.cta}
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}