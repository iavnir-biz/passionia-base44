import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Loader2, Star, Users, Crown, Award, Sparkles } from 'lucide-react';
import OfferBuilderLayout from '@/components/onboarding/OfferBuilderLayout';
import OfferCardNew from '@/components/onboarding/OfferCardNew';

// Fonction pour déterminer l'icône selon le type de produit
const getProductIcon = (offer) => {
  const title = (offer?.title || '').toLowerCase();
  const description = (offer?.description || '').toLowerCase();
  const productType = (offer?.productType || '').toLowerCase();
  
  if (title.includes('coaching') || title.includes('mentorat') || description.includes('coaching') || description.includes('mentorat') || productType.includes('coaching')) {
    return Users;
  }
  if (title.includes('vip') || title.includes('premium') || title.includes('exclusif') || description.includes('vip')) {
    return Crown;
  }
  if (title.includes('masterclass') || title.includes('élite') || description.includes('masterclass')) {
    return Award;
  }
  // Par défaut, étoile premium
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
          if (userSession.offer_generation?.offerChoices?.upsell3Choices) {
            const choices = userSession.offer_generation.offerChoices.upsell3Choices.map((choice, idx) => ({
              ...choice,
              id: choice.id || `premium_${idx}`,
              icon: getProductIcon(choice),
              badge: choice.productType || choice.badge || 'Premium',
              result: choice.outcome
            }));
            setOffers(choices);
          }
        }
      }
      
      if (currentUser.offer?.offre_premium) {
        setSelectedOffer(currentUser.offer.offre_premium);
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
        finalizedOffer.upsell3 = offer;
        
        // Calculer le potentiel de revenus
        const parsePrice = (priceStr) => {
          if (!priceStr) return 0;
          const cleaned = priceStr.replace(/[^0-9]/g, '');
          return parseInt(cleaned, 10) || 0;
        };
        
        const mainPrice = parsePrice(finalizedOffer.mainProduct?.price || '0');
        const bumpPrice = parsePrice(finalizedOffer.orderBump?.price || '0');
        const upsell1Price = parsePrice(finalizedOffer.upsell1?.price || '0');
        const upsell3Price = parsePrice(offer.price || '0');
        
        const mainSales = 30;
        const bumpSales = Math.round(30 * 0.5);
        const upsell1Sales = Math.round(30 * 0.3);
        const upsell3Sales = Math.max(1, Math.round(30 * 0.03));
        
        const monthlyRevenue = (mainPrice * mainSales) + (bumpPrice * bumpSales) + (upsell1Price * upsell1Sales) + (upsell3Price * upsell3Sales);
        
        await base44.entities.Session.update(session.id, { 
          finalized_offer: finalizedOffer,
          potential_revenue: monthlyRevenue,
          is_offer_complete: true
        });
      }
      
      const currentOffer = user?.offer || {};
      await base44.auth.updateMe({ 
        offer: { ...currentOffer, offre_premium: offer }
      });
      setTimeout(() => {
        navigate(createPageUrl('OfferResume'));
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
    <OfferBuilderLayout currentStep={4}>
      <div className="max-w-3xl mx-auto px-4">
        {/* Step Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#61f7a2] mb-2">
            Étape 4 sur 4 : Choisis ton Offre Premium
          </h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">
            Ton offre haut de gamme pour une transformation maximale.
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
                colorScheme="gold"
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