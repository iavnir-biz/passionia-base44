import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Loader2, Video, FileText, Headphones, CheckSquare, BookOpen, GraduationCap, Lightbulb } from 'lucide-react';
import OfferCardNew from '@/components/onboarding/OfferCardNew';
import OfferTransition from '@/components/offer/OfferTransition';
import OfferSidebar from '@/components/onboarding/OfferSidebar';
import UserIdeaBlock from '@/components/offer/UserIdeaBlock';

const getProductIcon = (offer) => {
  const title = (offer?.title || '').toLowerCase();
  const description = (offer?.description || '').toLowerCase();
  const productType = (offer?.productType || '').toLowerCase();
  if (title.includes('pdf') || description.includes('pdf') || productType.includes('pdf') || productType.includes('ebook')) return FileText;
  if (title.includes('checklist') || description.includes('checklist') || productType.includes('checklist')) return CheckSquare;
  if (title.includes('audio') || description.includes('audio') || productType.includes('audio')) return Headphones;
  if (title.includes('formation complète') || title.includes('masterclass')) return GraduationCap;
  if (title.includes('atelier') || title.includes('workshop')) return BookOpen;
  return Video;
};

export default function OfferProductPrincipal() {
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
          if (userSession.offer_generation?.offerChoices?.mainProductChoices) {
            const choices = userSession.offer_generation.offerChoices.mainProductChoices.map((choice, idx) => ({
              ...choice, id: choice.id || `main_${idx}`,
              icon: getProductIcon(choice), badge: choice.productType || choice.badge || 'Formation'
            }));
            setOffers(choices);
          }
          if (userSession.finalized_offer?.mainProduct) {
            setSelectedOffer(userSession.finalized_offer.mainProduct);
          }
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = async (offer) => {
    setSelectedOffer(offer);
    setIsSaving(true);
    try {
      await base44.functions.invoke('saveFinalizedOffer', { sessionId: session.id, key: 'mainProduct', offer });
      setIsSaving(false);
      setShowTransition(true);
    } catch (error) {
      console.error('Error saving:', error);
      setIsSaving(false);
    }
  };

  if (isLoading) return null;
  if (showTransition) return <OfferTransition message="Noah prépare ton Petit Extra..." onComplete={() => navigate(createPageUrl('OfferPetitExtra'))} />;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <OfferSidebar currentStep={1} />

      <div className="lg:ml-72 pt-24 lg:pt-12 pb-12">
        <div className="max-w-3xl mx-auto px-4">
          {/* Info banner */}
          <div className="mb-6 p-4 bg-[#f8f8f8] border border-[#e5e5e5] rounded-xl flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5"
                 style={{ background: 'linear-gradient(135deg, #f97316, #ec4899)' }}>
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm text-[#666] leading-relaxed">
              Je t'ai préparé <span className="font-semibold text-[#1a1a1a]">2 options prêtes à vendre</span>. Tu pourras modifier ou améliorer cette offre à tout moment.
            </p>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">Choisis ton Produit Principal</h2>
            <p className="text-[#888] text-sm max-w-lg mx-auto">C'est ton offre d'entrée. Choisis l'option la plus simple pour commencer.</p>
          </div>

          {/* Cards */}
          {offers.length === 0 ? (
            <div className="text-center py-12">
              <Loader2 className="w-6 h-6 text-[#1a1a1a] animate-spin mx-auto mb-4" />
              <p className="text-[#888]">Chargement des offres...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {offers.map((offer) => (
                <OfferCardNew key={offer.id} offer={offer} icon={offer.icon}
                  isSelected={selectedOffer?.id === offer.id} onSelect={handleSelect} colorScheme="blue" />
              ))}
            </div>
          )}

          {session && <UserIdeaBlock sessionId={session.id} offerKey="mainProduct" existingIdeas={session.user_ideas} />}

          {isSaving && (
            <div className="mt-6 flex items-center justify-center gap-2 text-[#888]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Enregistrement...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}