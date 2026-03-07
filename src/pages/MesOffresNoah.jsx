import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, Copy, Sparkles, ArrowRight } from 'lucide-react';
import { useSessionLoader } from '@/components/hooks/useSessionLoader';
import NoahSidebar from '@/components/dashboard-noah/NoahSidebar';
import NoahHeader from '@/components/dashboard-noah/NoahHeader';
import OfferCardNoah from '@/components/dashboard-noah/OfferCardNoah';

export default function MesOffresNoah() {
  const { user, session, loading } = useSessionLoader();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingOffers, setLoadingOffers] = useState({});
  const [generatedOffers, setGeneratedOffers] = useState(null);

  const normalizeOffer = (offer) => {
    if (!offer) return null;
    let deliverables = offer.deliverables || [];
    if (deliverables.length > 0 && typeof deliverables[0] === 'object' && deliverables[0] !== null) {
      deliverables = deliverables.map(d => d.description && d.name ? `${d.name}: ${d.description}` : d.description || d.name || '');
    }
    let benefits = offer.benefits || [];
    if (benefits.length > 0 && typeof benefits[0] === 'object' && benefits[0] !== null) {
      benefits = benefits.map(b => typeof b === 'string' ? b : b.description || b.benefit || b.name || '').filter(Boolean);
    }
    return {
      title: offer.title, price: offer.price, subtitle: offer.subtitle,
      description: offer.problem || offer.description || '',
      product_type: offer.productType || offer.product_type,
      duration: offer.duration || offer.timeline,
      problem: offer.problem, before: offer.before, after: offer.after,
      deliverables, benefits,
      how_to_use: offer.howToUse || offer.how_to_use,
      ideal_for: Array.isArray(offer.idealFor || offer.ideal_for) ? (offer.idealFor || offer.ideal_for) : [],
      not_for: Array.isArray(offer.notFor || offer.not_for) ? (offer.notFor || offer.not_for) : [],
      ecosystem_role: offer.ecosystemRole || offer.ecosystem_role
    };
  };

  // Build offers from session data
  useEffect(() => {
    if (!session) return;
    let baseOffers = {};
    if (session.finalized_offer) {
      baseOffers = {
        low: normalizeOffer(session.finalized_offer.mainProduct),
        bump: normalizeOffer(session.finalized_offer.orderBump),
        mid: normalizeOffer(session.finalized_offer.upsell1),
        high: normalizeOffer(session.finalized_offer.upsell3)
      };
    }
    if (session.detailed_offers) {
      const d = {
        low: normalizeOffer(session.detailed_offers.mainProduct),
        bump: normalizeOffer(session.detailed_offers.orderBump),
        mid: normalizeOffer(session.detailed_offers.upsell),
        high: normalizeOffer(session.detailed_offers.premium)
      };
      baseOffers = { ...baseOffers, ...d };
    }
    if (session.my_generated_offers) {
      baseOffers = { ...baseOffers, ...session.my_generated_offers };
    }
    setGeneratedOffers(baseOffers);
  }, [session]);

  const handleEnrich = async (offerType) => {
    if (!session?.id) return;
    setLoadingOffers(prev => ({ ...prev, [offerType]: true }));
    try {
      const response = await base44.functions.invoke('generateMyOffers', {
        sessionId: session.id, offerType
      });
      const responseData = response.data || response;
      if (responseData.error) throw new Error(responseData.error);
      const { success, ...enrichedOffer } = responseData;
      const updated = { ...generatedOffers, [offerType]: enrichedOffer };
      setGeneratedOffers(updated);
      await base44.entities.Session.update(session.id, { my_generated_offers: updated });
      toast.success('Offre enrichie avec succès !');
    } catch (error) {
      toast.error(`Erreur: ${error.message || 'Erreur lors de l\'enrichissement'}`);
    } finally {
      setLoadingOffers(prev => ({ ...prev, [offerType]: false }));
    }
  };

  const handleCopy = (offer) => {
    const text = [
      offer.title, offer.price, '', offer.subtitle,
      offer.description ? `\n${offer.description}` : '',
      offer.deliverables?.length ? `\nLivrables:\n${offer.deliverables.join('\n')}` : '',
      offer.benefits?.length ? `\nBénéfices:\n${offer.benefits.join('\n')}` : '',
      offer.ideal_for?.length ? `\nPour qui:\n${offer.ideal_for.slice(0, 3).join('\n')}` : '',
      offer.ecosystem_role ? `\nRôle:\n${offer.ecosystem_role}` : ''
    ].filter(Boolean).join('\n').trim();
    navigator.clipboard.writeText(text);
    toast.success('Offre copiée !');
  };

  const OFFER_TYPES = [
    { id: 'low', label: 'Produit Principal', tag: 'Low ticket' },
    { id: 'bump', label: 'Petit Extra', tag: 'Order bump' },
    { id: 'mid', label: 'Offre Supérieure', tag: 'Mid ticket' },
    { id: 'high', label: 'Offre Premium', tag: 'High ticket' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#1a1a1a] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white"
         style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <NoahSidebar currentPage="MesOffresNoah" user={user} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 w-full lg:ml-64">
        <NoahHeader onMenuClick={() => setSidebarOpen(true)} onToggleSidebar={() => {}} />

        <main style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 20px 60px' }}>
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '24px' }}>
            <h1 style={{
              fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 600,
              letterSpacing: '-0.03em', color: '#1a1a1a', marginBottom: '6px'
            }}>
              Mes offres
            </h1>
            <p style={{ fontSize: '14px', color: '#888' }}>
              4 offres détaillées pour ton funnel de vente complet. Enrichis-les avec Noah.
            </p>
          </motion.div>

          {/* Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {OFFER_TYPES.map((type, idx) => (
              <OfferCardNoah
                key={type.id}
                offerType={type}
                offer={generatedOffers?.[type.id]}
                isLoading={loadingOffers[type.id]}
                onEnrich={() => handleEnrich(type.id)}
                onCopy={() => handleCopy(generatedOffers?.[type.id])}
                index={idx}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}