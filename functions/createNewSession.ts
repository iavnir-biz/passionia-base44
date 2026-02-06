import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Crée une nouvelle session pour un utilisateur
 * Vérifie les limites avant création
 * Gratuit : 1 session max / Payant : 3 sessions max
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isPaid = user.has_purchased === true;
    const maxSessions = isPaid ? 3 : 1;

    // Compter les sessions existantes
    const existingSessions = await base44.entities.Session.filter({ created_by: user.email });
    const currentCount = existingSessions.length;

    if (currentCount >= maxSessions) {
      return Response.json({
        success: false,
        error: isPaid ? 'limit_reached' : 'upgrade_required',
        message: isPaid
          ? 'Tu as créé tes 3 sessions. Elles restent accessibles dans ton dashboard.'
          : 'Passe Premium pour débloquer 3 sessions.',
        current: currentCount,
        max: maxSessions
      }, { status: 403 });
    }

    // Calculer le numéro de session
    const sessionNumbers = existingSessions.map(s => s.session_number || 1);
    const nextNumber = sessionNumbers.length > 0 ? Math.max(...sessionNumbers) + 1 : 1;

    // Lire le body pour des données optionnelles
    let bodyData = {};
    try {
      bodyData = await req.json();
    } catch (_) {
      // Pas de body, c'est OK
    }

    const prefilledSkill = bodyData.prefilledSkill || '';

    // Créer la nouvelle session
    const newSession = await base44.entities.Session.create({
      session_number: nextNumber,
      session_name: `Session ${nextNumber}`,
      onboarding_history: [],
      onboarding_summary: prefilledSkill ? { who_to_teach: prefilledSkill } : {},
      onboarding_full: prefilledSkill ? { coreSkill: prefilledSkill } : {},
      skill: prefilledSkill,
      is_onboarding_done: false,
      is_regenerating: false,
      regeneration_count: 0,
      generation_in_progress: false
    });

    console.log('[createNewSession] Session created:', {
      sessionId: newSession.id,
      sessionNumber: nextNumber,
      userEmail: user.email,
      totalSessions: currentCount + 1
    });

    return Response.json({
      success: true,
      session: {
        id: newSession.id,
        session_number: nextNumber,
        session_name: `Session ${nextNumber}`
      },
      current: currentCount + 1,
      max: maxSessions
    });

  } catch (error) {
    console.error('[createNewSession] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
