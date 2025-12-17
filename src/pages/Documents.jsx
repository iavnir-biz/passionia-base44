import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useRequireAuth } from '@/components/hooks/useRequireAuth';
import { motion } from "framer-motion";
import { 
  FileText, 
  Package, 
  DollarSign, 
  MessageSquare, 
  Target, 
  Users,
  Search,
  Sparkles,
  Download,
  Eye
} from "lucide-react";
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import DocumentCard from '@/components/dashboard/DocumentCard';
import GlowButton from '@/components/ui/GlowButton';
import OfferGenerationCard from '@/components/offer/OfferGenerationCard';

const categories = [
  { 
    id: 'offre', 
    name: 'Offre', 
    icon: Package,
    documents: [
      { subcategory: 'Offre complète', title: 'Ton offre structurée' },
      { subcategory: 'Low ticket', title: 'Produit d\'appel' },
      { subcategory: 'Order bump', title: 'Vente additionnelle' },
      { subcategory: 'Mid ticket', title: 'Offre intermédiaire' },
      { subcategory: 'High ticket', title: 'Offre premium' },
    ]
  },
  { 
    id: 'pricing', 
    name: 'Pricing', 
    icon: DollarSign,
    documents: [
      { subcategory: 'Grille tarifaire', title: 'Structure de prix' },
      { subcategory: 'Promesse de valeur', title: 'Proposition de valeur' },
    ]
  },
  { 
    id: 'messages', 
    name: 'Messages & Copies', 
    icon: MessageSquare,
    documents: [
      { subcategory: 'Page de vente', title: 'Landing page complète' },
      { subcategory: 'Email 1', title: 'Email de bienvenue' },
      { subcategory: 'Email 2', title: 'Email de valeur' },
      { subcategory: 'Email 3', title: 'Email témoignage' },
      { subcategory: 'Email 4', title: 'Email urgence' },
      { subcategory: 'Email 5', title: 'Email dernière chance' },
      { subcategory: 'DM scripts', title: 'Scripts de prospection' },
      { subcategory: 'Posts & Reels', title: 'Contenu réseaux sociaux' },
      { subcategory: 'Angles marketing', title: 'Hooks et angles' },
    ]
  },
  { 
    id: 'strategies', 
    name: 'Stratégies', 
    icon: Target,
    documents: [
      { subcategory: 'Plan 30 jours', title: 'Plan d\'action mensuel' },
      { subcategory: 'Acquisition gratuite', title: 'Stratégie organique' },
      { subcategory: 'Acquisition payante', title: 'Publicité (optionnel)' },
    ]
  },
  { 
    id: 'validation', 
    name: 'Validation', 
    icon: Search,
    documents: [
      { subcategory: 'Micro-sondage', title: 'Questions de validation' },
      { subcategory: 'Message test', title: 'Script de test' },
      { subcategory: 'Analyse IA', title: 'Analyse des réponses' },
    ]
  },
  { 
    id: 'avatar', 
    name: 'Avatar', 
    icon: Users,
    documents: [
      { subcategory: 'Profil détaillé', title: 'Persona client' },
      { subcategory: 'Peurs & Désirs', title: 'Psychologie client' },
      { subcategory: 'Objections', title: 'Freins à l\'achat' },
      { subcategory: 'Transformation', title: 'Avant/Après' },
    ]
  },
];

export default function Documents() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [generatedOffersCount, setGeneratedOffersCount] = useState(0);
  
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);
  
  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      if (currentUser.sessionId) {
        setSessionId(currentUser.sessionId);
      }
      
      // Load plan steps for progress
      const steps = await base44.entities.PlanStep.filter({ created_by: currentUser.email });
      const completed = steps.filter(s => s.is_completed).length;
      setProgress(steps.length > 0 ? Math.round((completed / steps.length) * 100) : 0);
      
      // Load existing documents
      const docs = await base44.entities.Document.filter({ created_by: currentUser.email });
      
      // If no documents exist, create placeholders
      if (docs.length === 0) {
        await generateInitialDocuments(currentUser);
      } else {
        setDocuments(docs);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const generateInitialDocuments = async (currentUser) => {
    setGenerating(true);
    
    try {
      // Get user profile
      const profiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
      const profile = profiles[0];
      
      // Create documents for each category
      const newDocs = [];
      
      for (const category of categories) {
        for (const doc of category.documents) {
          // Generate content with AI for main documents
          let content = '';
          let isGenerated = false;
          
          if (['Offre complète', 'Page de vente', 'Profil détaillé'].includes(doc.title)) {
            const result = await base44.integrations.Core.InvokeLLM({
              prompt: `Génère le contenu pour "${doc.title}" (${doc.subcategory}) pour quelqu'un qui:
- Passion: ${profile?.passion || 'Non défini'}
- Cible: ${profile?.target_audience || 'Non défini'}
- Transformation: ${profile?.transformation || 'Non défini'}

Sois concis mais complet. Format markdown.`,
              response_json_schema: {
                type: "object",
                properties: {
                  content: { type: "string" }
                }
              }
            });
            content = result.content;
            isGenerated = true;
          }
          
          const created = await base44.entities.Document.create({
            title: doc.title,
            category: category.id,
            subcategory: doc.subcategory,
            content: content,
            version: 1,
            is_generated: isGenerated
          });
          
          newDocs.push(created);
        }
      }
      
      setDocuments(newDocs);
    } catch (error) {
      console.error('Error generating documents:', error);
    } finally {
      setGenerating(false);
    }
  };
  
  const handleViewDocument = (doc) => {
    setSelectedDocument(doc);
  };
  
  const handleDownload = (doc) => {
    // Create text file for download
    const blob = new Blob([doc.content || 'Contenu non généré'], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const filteredDocuments = activeCategory === 'all' 
    ? documents 
    : documents.filter(d => d.category === activeCategory);
  
  const getCategoryDocuments = (categoryId) => {
    return documents.filter(d => d.category === categoryId);
  };
  
  const handleOfferGenerated = () => {
    setGeneratedOffersCount(prev => prev + 1);
  };
  
  const offerCards = [
    {
      id: 'high',
      title: 'Offre premium',
      subtitle: 'High ticket',
      type: 'offre_premium'
    },
    {
      id: 'mid',
      title: 'Offre intermédiaire',
      subtitle: 'Mid ticket',
      type: 'offre_superieure'
    },
    {
      id: 'bump',
      title: 'Vente additionnelle',
      subtitle: 'Order bump',
      type: 'petit_extra'
    },
    {
      id: 'low',
      title: 'Produit d\'appel',
      subtitle: 'Low ticket',
      type: 'product_principal'
    },
    {
      id: 'complete',
      title: 'Ton offre structurée',
      subtitle: 'Offre complète',
      type: 'complete'
    }
  ];
  
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      <Sidebar currentPage="Documents" progress={progress} />
      
      <div className="flex-1 ml-72">
        <TopBar 
          title="Documents IA" 
          subtitle="Tous tes documents générés par l'IA"
          user={user}
        />
        
        <main className="p-8">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === 'all'
                  ? 'bg-[#61f7a2] text-white shadow-md'
                  : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
              }`}
            >
              Tout
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#61f7a2] text-white shadow-md'
                    : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.name}
              </button>
            ))}
          </div>
          
          {loading || generating ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin w-10 h-10 border-2 border-[#61f7a2] border-t-transparent rounded-full mb-4" />
              <p className="text-gray-600">
                {generating ? 'Génération de vos documents en cours...' : 'Chargement...'}
              </p>
            </div>
          ) : activeCategory === 'offre' ? (
            // Show offer generation cards
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#61f7a2]/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-[#61f7a2]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Tes offres</h3>
                <span className="text-gray-600 text-sm">
                  {generatedOffersCount}/5 générées
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offerCards.map((card, index) => (
                  <OfferGenerationCard
                    key={card.id}
                    offer={card}
                    user={user}
                    sessionId={sessionId}
                    onGenerated={handleOfferGenerated}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            </div>
          ) : activeCategory === 'all' ? (
            // Show by category
            <div className="space-y-8">
              {categories.map((category) => {
                const categoryDocs = getCategoryDocuments(category.id);
                if (categoryDocs.length === 0 && category.id !== 'offre') return null;
                
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#61f7a2]/10 flex items-center justify-center">
                        <category.icon className="w-5 h-5 text-[#61f7a2]" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                      {category.id === 'offre' ? (
                        <span className="text-gray-600 text-sm">
                          {generatedOffersCount}/5 générées
                        </span>
                      ) : (
                        <span className="text-gray-600 text-sm">
                          {categoryDocs.filter(d => d.is_generated).length}/{categoryDocs.length} générés
                        </span>
                      )}
                    </div>
                    
                    {category.id === 'offre' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {offerCards.map((card, index) => (
                          <OfferGenerationCard
                            key={card.id}
                            offer={card}
                            user={user}
                            sessionId={sessionId}
                            onGenerated={handleOfferGenerated}
                            delay={index * 0.1}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {categoryDocs.map((doc, index) => (
                          <DocumentCard
                            key={doc.id}
                            document={doc}
                            onView={handleViewDocument}
                            onDownload={handleDownload}
                            index={index}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            // Show filtered
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDocuments.map((doc, index) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onView={handleViewDocument}
                  onDownload={handleDownload}
                  index={index}
                />
              ))}
            </div>
          )}
        </main>
      </div>
      
      {/* Document viewer modal */}
      {selectedDocument && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedDocument(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl max-h-[80vh] bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedDocument.title}</h3>
                <p className="text-gray-600 text-sm">{selectedDocument.subcategory}</p>
              </div>
              <div className="flex items-center gap-2">
                <GlowButton
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDownload(selectedDocument)}
                  icon={Download}
                >
                  Télécharger
                </GlowButton>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="prose max-w-none">
                {selectedDocument.content || (
                  <p className="text-gray-500">Ce document n'a pas encore été généré.</p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}