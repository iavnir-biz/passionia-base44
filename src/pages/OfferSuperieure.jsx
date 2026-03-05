import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Loader2, Presentation, GraduationCap, Video, BookOpen, Users } from 'lucide-react';
import OfferCardNew from '@/components/onboarding/OfferCardNew';
import OfferTransition from '@/components/offer/OfferTransition';
import OfferSidebar from '@/components/onboarding/OfferSidebar';

const getProductIcon = (offer) => {
  const title = (offer?.title || '').toLowerCase();
  const description = (offer?.description || '').toLowerCase();
  const productType = (offer?.productType || '').toLowerCase();
  if (title.includes('formation complète') || title.includes('masterclass') || description.includes('formation complète') || productType.includes('formation')) return GraduationCap;
  if (title.includes('atelier') || title.includes('workshop') || description.includes('atelier') || productType.includes('atelier')) return Presentation;
  if (title.includes('coaching') || title.includes('accompagnement') || description.includes('coaching') || productType.includes('coaching')) return Users;
  if (title.includes('vidéo') || title.includes('video') || description.includes('vidéo')) return Video;
  return BookOpen;
};

export default function OfferSuperieure() {
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
          if (userSession.offer_generation?.offerChoices?.upsell1Choices) {
            const choices = userSession.offer_generation.offerChoices.upsell1Choices.map((choice, idx) => ({
              ...choice, id: choice.id || `upsell_${idx}`, icon: getProductIcon(choice), badge: choice.productType || choice.badge || 'Formation', result: choice.outcome
            }));
            setOffers(choices);
          }
          if (userSession.finalized_offer?.upsell1) {
            setSelectedOffer(userSession.finalized_offer.upsell1);
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
      const updatedOffer = { ...(currentSession.finalized_offer || {}), upsell1: offer };
      await base44.entities.Session.update(resolvedId, { finalized_offer: updatedOffer });
      setSession({ ...currentSession, finalized_offer: updatedOffer });
    } catch (error) { console.error('Error saving:', error); }
    setIsSaving(false);
    setShowTransition(true);
  };

  if (isLoading) return null;
  if (showTransition) return <OfferTransition message="Noah prépare ton Offre Premium..." onComplete={() => navigate(createPageUrl('OfferPremium'))} />;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <OfferSidebar currentStep={3} />

      <div className="lg:ml-72 pt-24 lg:pt-12 pb-12 relative">
        {/* Neon circles */}
        <div style={{ position: 'absolute', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', top: '5%', right: '-5%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)', bottom: '10%', left: '5%', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1a1a1a] mb-2">Choisis ton Offre Supérieure</h2>
            <p className="text-[#888] text-sm max-w-lg mx-auto">Une solution plus complète pour tes élèves motivés.</p>
          </div>

          {offers.length === 0 ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-[#1a1a1a] animate-spin mx-auto mb-4" />
              <p className="text-[#888]">Chargement des offres générées...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {offers.map((offer) => <OfferCardNew key={offer.id} offer={offer} icon={offer.icon} isSelected={selectedOffer?.id === offer.id} onSelect={handleSelect} colorScheme="purple" />)}
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