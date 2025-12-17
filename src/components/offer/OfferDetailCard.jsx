import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Copy, Download, Check, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlowButton from '@/components/ui/GlowButton';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';

const colorSchemes = {
  low: {
    bg: 'from-blue-50 to-blue-100',
    border: 'border-blue-200',
    text: 'text-blue-600',
    badge: 'bg-blue-500'
  },
  bump: {
    bg: 'from-green-50 to-green-100',
    border: 'border-green-200',
    text: 'text-green-600',
    badge: 'bg-green-500'
  },
  mid: {
    bg: 'from-purple-50 to-purple-100',
    border: 'border-purple-200',
    text: 'text-purple-600',
    badge: 'bg-purple-500'
  },
  high: {
    bg: 'from-yellow-50 to-amber-100',
    border: 'border-yellow-200',
    text: 'text-yellow-600',
    badge: 'bg-yellow-500'
  }
};

export default function OfferDetailCard({ 
  offerType, 
  offerTitle, 
  baseOffer, 
  sessionId,
  onGenerated 
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOffer, setGeneratedOffer] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const scheme = colorSchemes[offerType] || colorSchemes.low;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data } = await base44.functions.invoke('generateOfferDetails', {
        offerType,
        offerData: baseOffer,
        sessionId
      });

      if (data.success) {
        setGeneratedOffer(data.offer);
        setIsExpanded(true);
        if (onGenerated) onGenerated(offerType, data.offer);
      }
    } catch (error) {
      console.error('Error generating offer:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedOffer) return;
    
    const text = `${generatedOffer.name}

${generatedOffer.promise}

Pour qui : ${generatedOffer.targetAudience}
Problème résolu : ${generatedOffer.problemSolved}
Résultat : ${generatedOffer.concreteResult}

Format : ${generatedOffer.format}
Prix : ${generatedOffer.recommendedPrice}

Contenu inclus :
${generatedOffer.includedContent.map(item => `• ${item}`).join('\n')}

Position : ${generatedOffer.funnelPosition}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    if (!generatedOffer) return;

    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(20);
    doc.text(generatedOffer.name, 20, y);
    y += 15;

    doc.setFontSize(12);
    doc.text(generatedOffer.promise, 20, y, { maxWidth: 170 });
    y += 20;

    doc.setFontSize(10);
    doc.text(`Pour qui : ${generatedOffer.targetAudience}`, 20, y, { maxWidth: 170 });
    y += 10;
    doc.text(`Problème résolu : ${generatedOffer.problemSolved}`, 20, y, { maxWidth: 170 });
    y += 10;
    doc.text(`Résultat : ${generatedOffer.concreteResult}`, 20, y, { maxWidth: 170 });
    y += 15;

    doc.text(`Format : ${generatedOffer.format}`, 20, y);
    y += 7;
    doc.text(`Prix : ${generatedOffer.recommendedPrice}`, 20, y);
    y += 15;

    doc.text('Contenu inclus :', 20, y);
    y += 7;
    generatedOffer.includedContent.forEach(item => {
      doc.text(`• ${item}`, 25, y, { maxWidth: 165 });
      y += 7;
    });

    y += 10;
    doc.text(`Position : ${generatedOffer.funnelPosition}`, 20, y);

    doc.save(`${generatedOffer.name}.pdf`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-gradient-to-br rounded-3xl border p-6 shadow-sm",
        scheme.bg,
        scheme.border
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={cn("w-3 h-3 rounded-full", scheme.badge)} />
            <span className={cn("text-xs font-bold uppercase tracking-wide", scheme.text)}>
              {offerTitle}
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">{baseOffer.title}</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{baseOffer.price}</p>
        </div>
      </div>

      {/* Generate Button */}
      {!generatedOffer && (
        <GlowButton
          onClick={handleGenerate}
          loading={isGenerating}
          className="w-full"
          variant="primary"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Générer les détails
        </GlowButton>
      )}

      {/* Generated Content */}
      {generatedOffer && (
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
              {isExpanded ? 'Réduire' : 'Lire'}
            </Button>
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? 'Copié' : 'Copier'}
            </Button>
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 bg-white rounded-2xl p-4 border border-gray-200"
            >
              <div>
                <h4 className="font-bold text-gray-900 mb-1">{generatedOffer.name}</h4>
                <p className="text-sm text-gray-600 italic">{generatedOffer.promise}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Pour qui :</span>
                  <p className="text-gray-600">{generatedOffer.targetAudience}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Format :</span>
                  <p className="text-gray-600">{generatedOffer.format}</p>
                </div>
              </div>

              <div>
                <span className="font-semibold text-gray-700 text-sm">Problème résolu :</span>
                <p className="text-sm text-gray-600">{generatedOffer.problemSolved}</p>
              </div>

              <div>
                <span className="font-semibold text-gray-700 text-sm">Résultat concret :</span>
                <p className="text-sm text-gray-600">{generatedOffer.concreteResult}</p>
              </div>

              <div>
                <span className="font-semibold text-gray-700 text-sm">Contenu inclus :</span>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-1 space-y-1">
                  {generatedOffer.includedContent.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-sm font-semibold text-gray-700">Prix conseillé :</span>
                <span className={cn("text-lg font-bold", scheme.text)}>{generatedOffer.recommendedPrice}</span>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}