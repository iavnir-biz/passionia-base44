import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook centralisé pour charger la session utilisateur.
 * 1. Essaie localStorage (fast path)
 * 2. Fallback: query DB par email (nouveau device / cache vidé)
 * 3. Re-sync localStorage pour les prochaines visites
 */
export function useSessionLoader() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Load profile
      const profiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
      if (profiles.length > 0) setProfile(profiles[0]);

      // 1. Try localStorage first (fast path)
      let foundSession = null;
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
          // Re-sync localStorage
          localStorage.setItem('passionia_active_session_id', foundSession.id);
          console.log('[useSessionLoader] Restored session from DB:', foundSession.id);
        }
      }

      if (foundSession) setSession(foundSession);
    } catch (error) {
      console.error('[useSessionLoader] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return { user, session, profile, loading, reload: loadData };
}