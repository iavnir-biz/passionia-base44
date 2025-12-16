import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Loader2, Presentation, GraduationCap } from 'lucide-react';
import OfferBuilderLayout from '@/components/onboarding/OfferBuilderLayout';
import OfferCardNew from '@/components/onboarding/OfferCardNew';

export default function OfferSuperieure() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
          
          // Récupérer les offres depuis offer_draft
          if (userSession.offer_draft?.offerChoices?.upsell1Choices) {
            const choices = userSession.offer_draft.offerChoices.upsell1Choices.map(choice => ({
              ...choice,
              icon: Presentation,
              result: choice.outcome
            }));
            setOffers(choices);
          }
        }
      }
      
      if (currentUser.offer?.offre_superieure) {
        setSelectedOffer(currentUser.offer.offre_superieure);
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
      // Sauvegarder dans Session.finalized_offer
      if (session) {
        const finalizedOffer = session.finalized_offer || {};
        finalizedOffer.upsell1 = offer;
        await base44.entities.Session.update(session.id, { finalized_offer: finalizedOffer });
      }
      
      const currentOffer = user?.offer || {};
      await base44.auth.updateMe({ 
        offer: { ...currentOffer, offre_superieure: offer }
      });
      setTimeout(() => {
        navigate(createPageUrl('OfferPremium'));
      }, 500);
    } catch (error) {
      console.error('Error saving:', error);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#11112b] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin" />
      </div>
    );
  }

  return (
    <OfferBuilderLayout currentStep={3}>
      <div className="max-w-3xl mx-auto px-4">
        {/* Step Title */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-[#61f7a2] mb-2">
            Étape 3 sur 4 : Choisis ton Offre Supérieure
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
    </OfferBuilderLayout>
  );
}