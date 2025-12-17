import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles, Loader2, Check, Eye, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';

export default function OfferGenerationCard({ offer, user, sessionId, onGenerated, delay = 0 }) {
  const [version, setVersion] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOffer, setGeneratedOffer] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadExistingOffer();
  }, [sessionId]);

  const loadExistingOffer = async () => {
    if (!sessionId) return;
    
    try {
      const sessions = await base44.entities.Session.filter({ id: sessionId });
      if (sessions.length > 0) {
        const session = sessions[0];
        const generatedOffers = session.generated_offers || {};
        
        if (offer.type === 'complete') {
          // Pour l'offre complète, on check si toutes les 4 autres sont générées
          const allGenerated = ['offre_premium', 'offre_superieure', 'petit_extra', 'product_principal']
            .every(type => generatedOffers[type]);
          
          if (allGenerated && generatedOffers.complete) {
            setGeneratedOffer(generatedOffers.complete);
            if (generatedOffers.complete.version) {
              setVersion(generatedOffers.complete.version);
            }
          }
        } else {
          if (generatedOffers[offer.type]) {
            setGeneratedOffer(generatedOffers[offer.type]);
            if (generatedOffers[offer.type].version) {
              setVersion(generatedOffers[offer.type].version);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading existing offer:', error);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      if (offer.type === 'complete') {
        // Générer l'offre complète
        const { data } = await base44.functions.invoke('generateCompleteOffer', { sessionId });
        if (data.success) {
          setGeneratedOffer(data.offer);
          setVersion(data.offer.version || 1);
          if (onGenerated) onGenerated();
        }
      } else {
        // Générer une offre individuelle
        const baseOffer = user?.offer?.[offer.type];
        if (!baseOffer) {
          alert('Offre de base non trouvée. Complète d\'abord ton onboarding.');
          setIsGenerating(false);
          return;
        }

        const { data } = await base44.functions.invoke('generateOfferDetails', {
          offerType: offer.id,
          offerData: baseOffer,
          sessionId
        });

        if (data.success) {
          setGeneratedOffer(data.offer);
          setVersion(data.offer.version || 1);
          if (onGenerated) onGenerated();
        }
      }
    } catch (error) {
      console.error('Error generating offer:', error);
      alert('Erreur lors de la génération');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedOffer) return;
    
    let text = '';
    
    if (offer.type === 'complete') {
      text = `${generatedOffer.name || 'Offre complète'}

${generatedOffer.description || ''}

Offres incluses:
${generatedOffer.offers?.map((o, i) => `${i+1}. ${o.name} - ${o.price}`).join('\n') || ''}`;
    } else {
      text = `${generatedOffer.name}

${generatedOffer.promise}

Pour qui : ${generatedOffer.targetAudience}
Problème résolu : ${generatedOffer.problemSolved}
Résultat : ${generatedOffer.concreteResult}

Format : ${generatedOffer.format}
Prix : ${generatedOffer.recommendedPrice}

Contenu inclus :
${generatedOffer.includedContent?.map(item => `• ${item}`).join('\n') || ''}

Position : ${generatedOffer.funnelPosition}`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    if (!generatedOffer) return;

    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text(generatedOffer.name || offer.title, 20, y);
    y += 15;

    if (offer.type === 'complete') {
      doc.setFontSize(11);
      doc.text(generatedOffer.description || '', 20, y, { maxWidth: 170 });
      y += 20;

      doc.setFontSize(14);
      doc.text('Offres incluses:', 20, y);
      y += 10;

      generatedOffer.offers?.forEach((o, i) => {
        doc.setFontSize(10);
        doc.text(`${i+1}. ${o.name} - ${o.price}`, 25, y);
        y += 7;
      });
    } else {
      doc.setFontSize(11);
      doc.text(generatedOffer.promise || '', 20, y, { maxWidth: 170 });
      y += 15;

      doc.setFontSize(10);
      doc.text(`Pour qui : ${generatedOffer.targetAudience || ''}`, 20, y, { maxWidth: 170 });
      y += 10;
      doc.text(`Problème : ${generatedOffer.problemSolved || ''}`, 20, y, { maxWidth: 170 });
      y += 10;
      doc.text(`Résultat : ${generatedOffer.concreteResult || ''}`, 20, y, { maxWidth: 170 });
      y += 15;

      doc.text(`Format : ${generatedOffer.format || ''}`, 20, y);
      y += 7;
      doc.text(`Prix : ${generatedOffer.recommendedPrice || ''}`, 20, y);
      y += 15;

      doc.text('Contenu inclus :', 20, y);
      y += 7;
      generatedOffer.includedContent?.forEach(item => {
        doc.text(`• ${item}`, 25, y, { maxWidth: 165 });
        y += 7;
      });
    }

    doc.save(`${generatedOffer.name || offer.title}.pdf`);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-[#1b1b33] border border-[#2a2a45] rounded-2xl p-6 hover:border-[#61f7a2]/30 transition-all"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            generatedOffer ? "bg-[#61f7a2]" : "bg-[#2a2a45]"
          )}>
            {generatedOffer ? (
              <Check className="w-6 h-6 text-[#11112b]" />
            ) : (
              <FileText className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg mb-1">{offer.title}</h3>
            <p className="text-gray-400 text-sm">{offer.subtitle}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-500 text-sm mb-2">Version {version}</p>
        </div>

        {!generatedOffer ? (
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-transparent border border-[#61f7a2] text-[#61f7a2] hover:bg-[#61f7a2] hover:text-[#11112b] transition-all"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Générer
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-2">
            <Button
              onClick={() => setShowPreview(true)}
              className="w-full bg-[#61f7a2] text-[#11112b] hover:bg-[#4de88f]"
            >
              <Eye className="w-4 h-4 mr-2" />
              Voir
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="bg-[#2a2a45] border-[#2a2a45] text-gray-300 hover:bg-[#3a3a55] hover:text-white"
              >
                {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                {copied ? 'Copié' : 'Copier'}
              </Button>
              <Button
                onClick={handleDownloadPDF}
                variant="outline"
                size="sm"
                className="bg-[#2a2a45] border-[#2a2a45] text-gray-300 hover:bg-[#3a3a55] hover:text-white"
              >
                <Download className="w-3 h-3 mr-1" />
                PDF
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Preview Modal */}
      {showPreview && generatedOffer && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPreview(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1b1b33] border border-[#2a2a45] rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{generatedOffer.name || offer.title}</h2>
              <button 
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {offer.type === 'complete' ? (
              <div className="space-y-4 text-gray-300">
                <p className="text-base leading-relaxed">{generatedOffer.description}</p>
                
                <div>
                  <h3 className="text-[#61f7a2] font-semibold mb-3">Offres incluses :</h3>
                  <div className="space-y-3">
                    {generatedOffer.offers?.map((o, i) => (
                      <div key={i} className="bg-[#11112b] rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-white font-semibold">{o.name}</h4>
                            <p className="text-gray-400 text-sm mt-1">{o.description}</p>
                          </div>
                          <span className="text-[#61f7a2] font-bold">{o.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-gray-300">
                <p className="text-base italic text-[#61f7a2]">{generatedOffer.promise}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500 text-sm">Pour qui :</span>
                    <p className="text-white">{generatedOffer.targetAudience}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Format :</span>
                    <p className="text-white">{generatedOffer.format}</p>
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 text-sm">Problème résolu :</span>
                  <p className="text-white">{generatedOffer.problemSolved}</p>
                </div>

                <div>
                  <span className="text-gray-500 text-sm">Résultat concret :</span>
                  <p className="text-white">{generatedOffer.concreteResult}</p>
                </div>

                <div>
                  <span className="text-gray-500 text-sm">Contenu inclus :</span>
                  <ul className="list-disc list-inside text-white mt-2 space-y-1">
                    {generatedOffer.includedContent?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#2a2a45]">
                  <span className="text-gray-500">Prix conseillé :</span>
                  <span className="text-2xl font-bold text-[#61f7a2]">{generatedOffer.recommendedPrice}</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </>
  );
}