import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import LoadingStateAI from '@/components/common/LoadingStateAI';

export default function OfferGenerationStart() {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate AI processing time before showing the first offer page
    const timer = setTimeout(() => {
      navigate(createPageUrl('OfferProductPrincipal'));
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return <LoadingStateAI message="Création de votre offre personnalisée..." />;
}