import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Loader2, Star, Users, Crown, Award } from 'lucide-react';
import OfferCardNew from '@/components/onboarding/OfferCardNew';
import OfferTransition from '@/components/offer/OfferTransition';
import OfferSidebar from '@/components/onboarding/OfferSidebar';

const getProductIcon = (offer) => {
  const title = (offer?.title || '').toLowerCase();
  const description = (offer?.description || '').toLowerCase();
  const productType = (offer?.productType || '').toLowerCase();
  if (title.includes('coaching') || title.includes('mentorat') || description.includes('coaching') || description.includes('mentorat') || productType.includes('coaching')) return Users;
  if (title.includes('vip') || title.includes('premium') || title.includes('exclusif') || description.includes('vip')) return Crown;
  if (title.includes('masterclass') || title.includes('élite') || description.includes('masterclass')) return Award;
  return Star;
};

export default function OfferPremium() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

  useEffect(() => { loadUser(); }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      const resolvedSessionId = localStorage.getItem('passionia_active_session_id') || currentUser.sessionId;
      if (resolvedSessionId) {
        const sessions = await base44.entities.Session.filter({ id: resolvedSessionId });
        if (sessions.length > 0) {
          const userSession = sessions[0];
          setSession(userSession);
          if (userSession.offer_generation?.offerChoices?.upsell3Choices) {
            const choices = userSession.offer_generation.offerChoices.upsell3Choices.map((choice, idx) => ({
              ...choice, id: choice.id || `premium_${idx}`, icon: getProductIcon(choice), badge: choice.productType || choice.badge || 'Premium', result: choice.outcome
            }));
            setOffers(choices);
          }
          if (userSession.finalized_offer?.upsell3) {
            setSelectedOffer(userSession.finalized_offer.upsell3);
          }
        }
      }
    } catch (error) { console.error('Error loading user:', error); }
    finally { setIsLoading(false); }
  };

  const handleSelect = async (offer) => {
    setSelectedOffer(offer);
    setIsSaving(true);
    try {
      const resolvedId = localStorage.getItem('passionia_active_session_id') || session?.id;
      const currentSession = session || {};
      const updatedOffer = { ...(currentSession.finalized_offer || {}), upsell3: offer };
      await base44.entities.Session.update(resolvedId, { finalized_offer: updatedOffer });
      setSession({ ...currentSession, finalized_offer: updatedOffer });
    } catch (error) { console.error('Error saving:', error); }
    setIsSaving(false);
    setShowTransition(true);
  };

  if (isLoading) return null;
  if (showTransition) return <OfferTransition message="Noah compile ton offre complète..." onComplete={() => navigate(createPageUrl('OfferResume'))} />;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <OfferSidebar currentStep={4} />

      <div className="lg:ml-72 pt-24 lg:pt-12 pb-12 relative">
        {/* Neon circles */}
        <div style={{ position: 'absolute', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)', top: '5%', right: '-5%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)', bottom: '10%', left: '5%', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div className="max-w-3xl mx-auto px-4 relative z-10">
          {/* Title — Landing style */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{
              fontSize: 'clamp(28px, 4.5vw, 44px)',
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: '#1a1a1a',
              marginBottom: '12px'
            }}>
              Choisis ton <span style={{
                fontStyle: 'italic',
                fontWeight: 500,
                background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
                paddingRight: '0.3em',
                marginRight: '-0.3em',
                paddingBottom: '0.1em',
                marginBottom: '-0.1em',
              }}>Offre Premium</span>
            </h1>
            <p style={{ fontSize: '16px', color: '#888', lineHeight: 1.6, maxWidth: '500px', margin: '0 auto' }}>
              Ton offre haut de gamme pour une transformation maximale.
            </p>
          </div>

          {offers.length === 0 ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-[#1a1a1a] animate-spin mx-auto mb-4" />
              <p className="text-[#888]">Chargement des offres générées...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {offers.map((offer) => <OfferCardNew key={offer.id} offer={offer} icon={offer.icon} isSelected={selectedOffer?.id === offer.id} onSelect={handleSelect} colorScheme="gold" />)}
            </div>
          )}

          {isSaving && (
            <div className="mt-6 flex items-center justify-center gap-2 text-[#1a1a1a]">
              <Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Enregistrement...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}