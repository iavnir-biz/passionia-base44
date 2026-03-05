import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Cette page a été fusionnée dans OnboardingFirstName.
// Ce redirect assure la compatibilité si quelqu'un navigue directement vers /OnboardingDynamic.
export default function OnboardingDynamic() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(createPageUrl('Onboarding'), { replace: true });
  }, [navigate]);
  return null;
}