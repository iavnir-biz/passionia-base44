import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook fiable pour charger la session active de l'utilisateur.
 * 
 * Stratégie :
 * 1. Essaye localStorage (rapide)
 * 2. Fallback : cherche toutes les sessions de l'utilisateur en DB
 * 3. Re-sync localStorage pour les prochaines visites
 * 
 * Résout le bug : perte de données quand localStorage est vide
 * (nouveau device, cache vidé, navigation privée)
 */
export function useActiveSession() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      let foundSession = null;

      // 1. Try localStorage first (fast path)
      const localSessionId = localStorage.getItem('passionia_active_session_id') || currentUser.sessionId;
      if (localSessionId) {
        const localSessions = await base44.entities.Session.filter({ id: localSessionId });
        if (localSessions.length > 0) foundSession = localSessions[0];
      }

      // 2. Fallback: query ALL sessions by user email
      if (!foundSession) {
        const allSessions = await base44.entities.Session.filter(
          { created_by: currentUser.email },
          '-created_date',
          10
        );
        if (allSessions.length > 0) {
          foundSession = allSessions[0];
          // Re-sync localStorage for future visits
          localStorage.setItem('passionia_active_session_id', foundSession.id);
          console.log('[useActiveSession] Restored session from DB:', foundSession.id);
        }
      }

      if (foundSession) setSession(foundSession);
    } catch (error) {
      console.error('[useActiveSession] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return { user, session, loading, reload: loadSession };
}