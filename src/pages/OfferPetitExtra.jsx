import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Loader2, Layers, CheckSquare, FileText, Headphones, Gift } from 'lucide-react';
import OfferCardNew from '@/components/onboarding/OfferCardNew';
import OfferTransition from '@/components/offer/OfferTransition';
import OfferSidebar from '@/components/onboarding/OfferSidebar';
import UserIdeaBlock from '@/components/offer/UserIdeaBlock';

const getProductIcon = (offer) => {
  const title = (offer?.title || '').toLowerCase();
  const description = (offer?.description || '').toLowerCase();
  const productType = (offer?.productType || '').toLowerCase();
  if (title.includes('pdf') || title.includes('ebook') || description.includes('pdf') || productType.includes('pdf') || productType.includes('ebook')) return FileText;
  if (title.includes('checklist') || title.includes('check-list') || description.includes('checklist') || productType.includes('checklist')) return CheckSquare;
  if (title.includes('audio') || title.includes('podcast') || description.includes('audio') || productType.includes('audio')) return Headphones;
  if (title.includes('template') || title.includes('modèle') || description.includes('template')) return Layers;
  return Gift;
};

export default function OfferPetitExtra() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [sessionId, setSessionId] = useState(null);
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
      setSessionId(resolvedSessionId);
      if (resolvedSessionId) {
        const sessions = await base44.entities.Session.filter({ id: resolvedSessionId });
        if (sessions.length > 0) {
          const userSession = sessions[0];
          setSession(userSession);
          if (userSession.offer_generation?.offerChoices?.orderBump1Choices) {
            const choices = userSession.offer_generation.offerChoices.orderBump1Choices.map((choice, idx) => ({
              ...choice, id: choice.id || `bump_${idx}`, icon: getProductIcon(choice), badge: choice.productType || choice.badge || 'Bonus', result: choice.outcome
            }));
            setOffers(choices);
          }
          if (userSession.finalized_offer?.orderBump) {
            setSelectedOffer(userSession.finalized_offer.orderBump);
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
      const sid = sessionId || session?.id;
      await base44.functions.invoke('saveFinalizedOffer', { sessionId: sid, key: 'orderBump', offer });
      setIsSaving(false);
      setShowTransition(true);
    } catch (error) { console.error('Error saving:', error); setIsSaving(false); }
  };

  if (isLoading) return null;
  if (showTransition) return <OfferTransition message="Noah prépare ton Offre Supérieure..." onComplete={() => navigate(createPageUrl('OfferSuperieure'))} />;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <OfferSidebar currentStep={2} />

      <div className="lg:ml-72 pt-24 lg:pt-12 pb-12 relative">
        <div style={{ position: 'absolute', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)', top: '8%', left: '-3%', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1a1a1a] mb-2">Choisis ton Petit Extra</h2>
            <p className="text-[#888] text-sm max-w-lg mx-auto">Un bonus rapide et irrésistible qui renforce ton produit principal.</p>
          </div>

          {offers.length === 0 ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-[#1a1a1a] animate-spin mx-auto mb-4" />
              <p className="text-[#888]">Chargement des offres générées...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {offers.map((offer) => <OfferCardNew key={offer.id} offer={offer} icon={offer.icon} isSelected={selectedOffer?.id === offer.id} onSelect={handleSelect} colorScheme="green" />)}
            </div>
          )}

          {session && <UserIdeaBlock sessionId={session.id} offerKey="orderBump" existingIdeas={session.user_ideas} />}

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