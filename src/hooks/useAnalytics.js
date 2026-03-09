import { trackClick, trackEvent } from '@/lib/analytics';

export const useAnalytics = () => {
  return {
    trackClick,
    trackEvent,
  };
};
