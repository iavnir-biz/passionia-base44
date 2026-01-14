import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Loader2, Presentation, GraduationCap, Video, BookOpen, Users } from 'lucide-react';
import OfferCardNew from '@/components/onboarding/OfferCardNew';
import OfferTransition from '@/components/offer/OfferTransition';
import OfferSidebar from '@/components/onboarding/OfferSidebar';

// Fonction pour déterminer l'icône selon le type de produit
const getProductIcon = (offer) => {
  const title = (offer?.title || '').toLowerCase();
  const description = (offer?.description || '').toLowerCase();
  const productType = (offer?.productType || '').toLowerCase();
  
  if (title.includes('formation complète') || title.includes('masterclass') || description.includes('formation complète') || productType.includes('formation')) {
    return GraduationCap;
  }
  if (title.includes('atelier') || title.includes('workshop') || description.includes('atelier') || productType.includes('atelier')) {
    return Presentation;
  }
  if (title.includes('coaching') || title.includes('accompagnement') || description.includes('coaching') || productType.includes('coaching')) {
    return Users;
  }
  if (title.includes('vidéo') || title.includes('video') || description.includes('vidéo')) {
    return Video;
  }
  // Par défaut, atelier
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

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Charger la session et les offres générées
      if (currentUser.sessionId) {
        const sessions = await base44.entities.Session.filter({ id: currentUser.sessionId });
        if (sessions.length > 0) {
          const userSession = sessions[0];
          setSession(userSession);
          
          // Récupérer les offres depuis offer_generation
          if (userSession.offer_generation?.offerChoices?.upsell1Choices) {
            const choices = userSession.offer_generation.offerChoices.upsell1Choices.map((choice, idx) => ({
              ...choice,
              id: choice.id || `upsell_${idx}`,
              icon: getProductIcon(choice),
              badge: choice.productType || choice.badge || 'Formation',
              result: choice.outcome
            }));
            setOffers(choices);
          }
        }
      }
      
      if (userSession.finalized_offer?.upsell1) {
        setSelectedOffer(userSession.finalized_offer.upsell1);
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
      await base44.functions.invoke('saveFinalizedOffer', {
        sessionId: session.id,
        key: 'upsell1',
        offer
      });
      
      setIsSaving(false);
      setShowTransition(true);
    } catch (error) {
      console.error('Error saving:', error);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return null;
  }

  if (showTransition) {
    return (
      <OfferTransition 
        message="Noah prépare ton Offre Premium..." 
        onComplete={() => navigate(createPageUrl('OfferPremium'))}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      <OfferSidebar currentStep={3} />
      
      <div className="lg:ml-72 pt-32 lg:pt-12 pb-12">
        <div className="max-w-3xl mx-auto px-4">
          {/* Step Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">
              <span className="text-gray-900"> Choisis ton Offre Supérieure</span>
            </h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">
              Une solution plus complète pour tes élèves motivés.
            </p>
          </div>

          {/* Offer Cards */}
          {offers.length === 0 ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Chargement des offres générées...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {offers.map((offer) => (
                <OfferCardNew
                  key={offer.id}
                  offer={offer}
                  icon={offer.icon}
                  isSelected={selectedOffer?.id === offer.id}
                  onSelect={handleSelect}
                  colorScheme="purple"
                />
              ))}
            </div>
          )}

          {isSaving && (
            <div className="mt-6 flex items-center justify-center gap-2 text-[#61f7a2]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Enregistrement...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}