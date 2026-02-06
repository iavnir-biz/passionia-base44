import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Vérifie si un utilisateur peut créer une nouvelle session
 * Gratuit : 1 session max
 * Payant : 5 sessions max
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isPaid = user.has_purchased === true;
    const maxSessions = isPaid ? 5 : 1;

    // Compter les sessions existantes pour cet utilisateur
    const sessions = await base44.entities.Session.filter({ created_by: user.email });
    const currentCount = sessions.length;

    const canCreate = currentCount < maxSessions;
    let reason = 'ok';
    if (!canCreate) {
      reason = isPaid ? 'limit_reached' : 'upgrade_required';
    }

    return Response.json({
      success: true,
      canCreate,
      reason,
      current: currentCount,
      max: maxSessions,
      has_purchased: isPaid,
      sessions: sessions.map(s => ({
        id: s.id,
        session_number: s.session_number || 1,
        session_name: s.session_name || `Session ${s.session_number || 1}`,
        created_date: s.created_date,
        is_regenerating: s.is_regenerating || false
      }))
    });

  } catch (error) {
    console.error('[checkSessionLimits] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
