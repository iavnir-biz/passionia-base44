import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import OfferCard from './OfferCard';

export default function OfferSelectionPage({
  title,
  subtitle,
  offers,
  fieldName,
  nextPage,
  sectionTitle = "Ton Offre"
}) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
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
      
      // Pre-fill if exists
      if (currentUser.offer && currentUser.offer[fieldName]) {
        setSelectedOffer(currentUser.offer[fieldName]);
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
      const currentOffer = user?.offer || {};
      await base44.auth.updateMe({ 
        offer: {
          ...currentOffer,
          [fieldName]: offer
        }
      });
      
      // Auto-advance after selection
      setTimeout(() => {
        navigate(createPageUrl(nextPage));
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
    <div className="min-h-screen bg-[#11112b] flex flex-col">
      {/* Section badge */}
      <div className="w-full py-4 flex justify-center">
        <div className="px-4 py-2 bg-[#61f7a2]/20 rounded-full">
          <span className="text-[#61f7a2] font-semibold text-sm">{sectionTitle}</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-400 text-lg">
                {subtitle}
              </p>
            )}
          </div>

          {/* Offer Cards Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {offers.map((offer, index) => (
              <OfferCard
                key={index}
                offer={offer}
                isSelected={selectedOffer?.title === offer.title}
                onSelect={handleSelect}
              />
            ))}
          </div>

          {/* Saving indicator */}
          {isSaving && (
            <div className="mt-6 flex items-center justify-center gap-2 text-[#61f7a2]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Enregistrement...</span>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}