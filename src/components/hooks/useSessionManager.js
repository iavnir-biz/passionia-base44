import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const ACTIVE_SESSION_KEY = 'passionia_active_session_id';

/**
 * Hook principal pour gérer les sessions multiples
 * Gère : activeSessionId, liste des sessions, création, régénération
 */
export function useSessionManager() {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionIdState] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionMeta, setSessionMeta] = useState({
    current: 0,
    max: 1,
    has_purchased: false,
    canCreate: false
  });

  // Persister activeSessionId dans localStorage
  const setActiveSessionId = useCallback((id) => {
    setActiveSessionIdState(id);
    if (id) {
      localStorage.setItem(ACTIVE_SESSION_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  }, []);

  // Charger les sessions depuis le backend
  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await base44.functions.invoke('getUserSessions', {});

      if (data?.success) {
        setSessions(data.sessions || []);
        setSessionMeta({
          current: data.current,
          max: data.max,
          has_purchased: data.has_purchased,
          canCreate: data.canCreate
        });

        // Résoudre la session active
        const storedId = localStorage.getItem(ACTIVE_SESSION_KEY);
        const sessionList = data.sessions || [];

        if (sessionList.length > 0) {
          // Si une session est stockée et existe encore, la garder
          const storedExists = sessionList.find(s => s.id === storedId);
          if (storedExists) {
            setActiveSessionIdState(storedId);
            setActiveSession(storedExists);
          } else {
            // Sinon prendre la dernière session
            const latest = sessionList[sessionList.length - 1];
            setActiveSessionId(latest.id);
            setActiveSession(latest);
          }
        }
      }
    } catch (err) {
      console.error('[useSessionManager] Error loading sessions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setActiveSessionId]);

  // Créer une nouvelle session
  const createSession = useCallback(async (prefilledSkill = '') => {
    try {
      setError(null);
      const { data } = await base44.functions.invoke('createNewSession', {
        prefilledSkill
      });

      if (data?.success) {
        const newSessionId = data.session.id;
        setActiveSessionId(newSessionId);

        // Mettre à jour le sessionId sur le user (compatibilité)
        await base44.auth.updateMe({ sessionId: newSessionId });

        // Recharger la liste
        await loadSessions();
        return { success: true, sessionId: newSessionId, session: data.session };
      } else {
        return { success: false, error: data?.error, message: data?.message };
      }
    } catch (err) {
      console.error('[useSessionManager] Error creating session:', err);
      const errorData = err?.data || {};
      return {
        success: false,
        error: errorData.error || 'server_error',
        message: errorData.message || err.message
      };
    }
  }, [loadSessions, setActiveSessionId]);

  // Régénérer une session existante
  const regenerateSession = useCallback(async (sessionId) => {
    try {
      setError(null);
      const { data } = await base44.functions.invoke('regenerateSession', {
        sessionId
      });

      if (data?.success) {
        setActiveSessionId(sessionId);

        // Mettre à jour le sessionId sur le user
        await base44.auth.updateMe({ sessionId });

        // Stocker le flag de régénération pour l'onboarding
        localStorage.setItem('regenerating_session_id', sessionId);

        await loadSessions();
        return { success: true, sessionId };
      } else {
        return { success: false, error: data?.error, message: data?.message };
      }
    } catch (err) {
      console.error('[useSessionManager] Error regenerating session:', err);
      return { success: false, error: 'server_error', message: err.message };
    }
  }, [loadSessions, setActiveSessionId]);

  // Renommer une session
  const renameSession = useCallback(async (sessionId, newName) => {
    try {
      const { data } = await base44.functions.invoke('renameSession', {
        sessionId,
        newName
      });

      if (data?.success) {
        // Mettre à jour localement
        setSessions(prev =>
          prev.map(s => s.id === sessionId ? { ...s, session_name: data.session_name } : s)
        );
        if (activeSessionId === sessionId) {
          setActiveSession(prev => prev ? { ...prev, session_name: data.session_name } : prev);
        }
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      console.error('[useSessionManager] Error renaming session:', err);
      return { success: false };
    }
  }, [activeSessionId]);

  // Changer la session active
  const switchSession = useCallback((sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setActiveSessionId(sessionId);
      setActiveSession(session);

      // Mettre à jour le sessionId sur le user (compatibilité)
      base44.auth.updateMe({ sessionId }).catch(() => {});
    }
  }, [sessions, setActiveSessionId]);

  // Charger au mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    // State
    sessions,
    activeSessionId,
    activeSession,
    loading,
    error,
    ...sessionMeta,

    // Actions
    loadSessions,
    createSession,
    regenerateSession,
    renameSession,
    switchSession,
    setActiveSessionId
  };
}
