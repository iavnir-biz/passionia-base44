import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook léger pour vérifier les limites de sessions
 * Utilisé par les guards et boutons
 */
export function useSessionLimits() {
  const [limits, setLimits] = useState({
    canCreate: false,
    current: 0,
    max: 1,
    has_purchased: false,
    remaining: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    checkLimits();
  }, []);

  const checkLimits = async () => {
    try {
      const { data } = await base44.functions.invoke('checkSessionLimits', {});

      if (data?.success) {
        setLimits({
          canCreate: data.canCreate,
          current: data.current,
          max: data.max,
          has_purchased: data.has_purchased,
          remaining: data.max - data.current,
          loading: false,
          error: null
        });
      }
    } catch (err) {
      console.error('[useSessionLimits] Error:', err);
      setLimits(prev => ({ ...prev, loading: false, error: err.message }));
    }
  };

  const getMessage = () => {
    if (limits.loading) return '';

    if (!limits.has_purchased) {
      if (limits.current >= limits.max) {
        return 'Passe Premium pour débloquer 5 sessions et recommencer ton parcours autant de fois que tu veux.';
      }
      return '';
    }

    if (limits.current >= limits.max) {
      return 'Tu as utilisé tes 5 générations. Elles restent accessibles dans ton dashboard. Tu peux les régénérer autant de fois que tu veux.';
    }

    return `${limits.current}/${limits.max} sessions créées. Il te reste ${limits.remaining} session${limits.remaining > 1 ? 's' : ''}.`;
  };

  return {
    ...limits,
    message: getMessage(),
    refresh: checkLimits
  };
}
