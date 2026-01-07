import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Loader2, Video, FileText, Headphones, CheckSquare, BookOpen, GraduationCap, Play } from 'lucide-react';
import OfferCardNew from '@/components/onboarding/OfferCardNew';
import OfferTransition from '@/components/offer/OfferTransition';
import OfferSidebar from '@/components/onboarding/OfferSidebar';

// Fonction pour déterminer l'icône selon le type de produit
const getProductIcon = (offer) => {
  const title = (offer?.title || '').toLowerCase();
  const description = (offer?.description || '').toLowerCase();
  const productType = (offer?.productType || '').toLowerCase();
  
  if (title.includes('pdf') || title.includes('ebook') || description.includes('pdf') || productType.includes('pdf') || productType.includes('ebook')) {
    return FileText;
  }
  if (title.includes('checklist') || title.includes('check-list') || description.includes('checklist') || productType.includes('checklist')) {
    return CheckSquare;
  }
  if (title.includes('audio') || title.includes('podcast') || description.includes('audio') || productType.includes('audio')) {
    return Headphones;
  }
  if (title.includes('formation complète') || title.includes('masterclass') || description.includes('formation complète')) {
    return GraduationCap;
  }
  if (title.includes('atelier') || title.includes('workshop') || description.includes('atelier')) {
    return BookOpen;
  }
  // Par défaut, vidéo/mini-formation
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

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      console.log('OfferProductPrincipal: User loaded', { 
        hasSessionId: !!currentUser.sessionId,
        sessionId: currentUser.sessionId 
      });
      
      // Charger la session et les offres générées
      if (currentUser.sessionId) {
        const sessions = await base44.entities.Session.filter({ id: currentUser.sessionId });
        console.log('OfferProductPrincipal: Sessions fetched', { 
          count: sessions.length,
          sessionId: currentUser.sessionId 
        });
        
        if (sessions.length > 0) {
          const userSession = sessions[0];
          setSession(userSession);
          
          console.log('OfferProductPrincipal: Session loaded', {
            hasOfferGeneration: !!userSession.offer_generation,
            hasMainProductChoices: !!userSession.offer_generation?.offerChoices?.mainProductChoices
          });
          
          // Récupérer les offres depuis offer_generation (Full Stack Offer)
          if (userSession.offer_generation?.offerChoices?.mainProductChoices) {
            const choices = userSession.offer_generation.offerChoices.mainProductChoices.map((choice, idx) => ({
              ...choice,
              id: choice.id || `main_${idx}`,
              icon: getProductIcon(choice),
              badge: choice.productType || choice.badge || 'Formation'
            }));
            console.log('OfferProductPrincipal: Offers loaded', { count: choices.length });
            setOffers(choices);
          } else {
            console.warn('OfferProductPrincipal: No offers found in session.offer_generation');
          }
        } else {
          console.error('OfferProductPrincipal: No session found with this ID');
        }
      } else {
        console.error('OfferProductPrincipal: User has no sessionId');
      }
      
      // Charger la sélection précédente si existe
      if (userSession.finalized_offer?.mainProduct) {
        setSelectedOffer(userSession.finalized_offer.mainProduct);
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
      // 🔥 SAVE BACKEND ATOMIC (anti-race)
      await base44.functions.invoke('saveFinalizedOffer', {
        sessionId: session.id,
        key: 'mainProduct',
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
        message="Noah prépare ton Petit Extra..." 
        onComplete={() => navigate(createPageUrl('OfferPetitExtra'))}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      <OfferSidebar currentStep={1} />
      
      <div className="ml-72 py-12">
        <div className="max-w-3xl mx-auto px-4">
          {/* Step Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">
              <span className="text-[#61f7a2]">Étape 1 sur 5</span>
              <span className="text-gray-900"> : Choisis ton Produit Principal</span>
            </h2>
            <p className="text-gray-700 mx-auto text-sm max-w-lg">C'est ton offre d'entrée. Choisis l'option la plus simple pour commencer.</p>
          </div>

          {/* Offer Cards */}
          {offers.length === 0 ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Chargement des offres générées...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {offers.map((offer) =>
              <OfferCardNew
                key={offer.id}
                offer={offer}
                icon={offer.icon}
                isSelected={selectedOffer?.id === offer.id}
                onSelect={handleSelect}
                colorScheme="blue" />
              )}
            </div>
          )}

          {isSaving &&
          <div className="mt-6 flex items-center justify-center gap-2 text-[#61f7a2]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Enregistrement...</span>
            </div>
          }
        </div>
      </div>
    </div>
  );
}