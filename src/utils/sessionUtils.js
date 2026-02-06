import { base44 } from '@/api/base44Client';

const ACTIVE_SESSION_KEY = 'passionia_active_session_id';

/**
 * Résout la session active pour l'utilisateur courant
 * Priorité : localStorage > user.sessionId > première session par email
 * Utilisable dans n'importe quelle page
 *
 * @param {Object} user - L'utilisateur courant (base44.auth.me())
 * @returns {Object|null} La session active ou null
 */
export async function getActiveSession(user) {
  if (!user) return null;

  // 1. Essayer le localStorage (mis par useSessionManager ou OnboardingFirstName)
  const storedId = localStorage.getItem(ACTIVE_SESSION_KEY);
  if (storedId) {
    try {
      const sessions = await base44.entities.Session.filter({ id: storedId });
      if (sessions.length > 0) {
        return sessions[0];
      }
    } catch (e) {
      console.warn('[getActiveSession] localStorage ID failed:', e);
    }
  }

  // 2. Essayer user.sessionId
  if (user.sessionId) {
    try {
      const sessions = await base44.entities.Session.filter({ id: user.sessionId });
      if (sessions.length > 0) {
        // Synchroniser localStorage
        localStorage.setItem(ACTIVE_SESSION_KEY, user.sessionId);
        return sessions[0];
      }
    } catch (e) {
      console.warn('[getActiveSession] user.sessionId failed:', e);
    }
  }

  // 3. Fallback : première session par email
  try {
    const sessions = await base44.entities.Session.filter({ created_by: user.email });
    if (sessions.length > 0) {
      // Prendre la dernière session créée
      const sorted = sessions.sort((a, b) =>
        new Date(b.created_date || 0) - new Date(a.created_date || 0)
      );
      const session = sorted[0];

      // Synchroniser
      localStorage.setItem(ACTIVE_SESSION_KEY, session.id);
      try {
        await base44.auth.updateMe({ sessionId: session.id });
      } catch (_) {}

      return session;
    }
  } catch (e) {
    console.warn('[getActiveSession] email fallback failed:', e);
  }

  return null;
}

/**
 * Récupère l'ID de la session active
 * @param {Object} user - L'utilisateur courant
 * @returns {string|null} L'ID de la session active
 */
export function getActiveSessionId(user) {
  return localStorage.getItem(ACTIVE_SESSION_KEY) || user?.sessionId || null;
}

/**
 * Définit la session active
 * @param {string} sessionId - L'ID de la session
 */
export function setActiveSessionId(sessionId) {
  if (sessionId) {
    localStorage.setItem(ACTIVE_SESSION_KEY, sessionId);
  }
}
