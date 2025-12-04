import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import LoadingStateAI from '@/components/common/LoadingStateAI';

export default function OfferGenerationStart() {
  const navigate = useNavigate();
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    generateOffer();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % 5);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const generateOffer = async () => {
    try {
      const user = await base44.auth.me();
      
      // Mark onboarding as completed
      await base44.auth.updateMe({ onboardingCompleted: true });
      
      // Navigate to offer selection pages
      navigate(createPageUrl('OfferProductPrincipal'));
    } catch (error) {
      console.error('Error:', error);
      navigate(createPageUrl('Results'));
    }
  };

  return <LoadingStateAI step={loadingStep} />;
}