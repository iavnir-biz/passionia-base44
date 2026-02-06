import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Finalise la régénération d'une session
 * Appelé quand l'onboarding est terminé après un "Recommencer"
 * Remet is_regenerating = false
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }

    // Vérifier la session
    const sessions = await base44.asServiceRole.entities.Session.filter({ id: sessionId });
    if (!sessions || sessions.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = sessions[0];
    if (session.created_by !== user.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Marquer la régénération comme terminée
    await base44.asServiceRole.entities.Session.update(sessionId, {
      is_regenerating: false
    });

    console.log('[completeRegeneration] Regeneration completed:', {
      sessionId,
      userEmail: user.email
    });

    return Response.json({
      success: true,
      sessionId
    });

  } catch (error) {
    console.error('[completeRegeneration] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
