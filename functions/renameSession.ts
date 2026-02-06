import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Renomme une session
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, newName } = await req.json();

    if (!sessionId || !newName) {
      return Response.json({ error: 'sessionId and newName required' }, { status: 400 });
    }

    // Vérifier que la session appartient à l'utilisateur
    const sessions = await base44.entities.Session.filter({ id: sessionId });
    if (!sessions || sessions.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    if (sessions[0].created_by !== user.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const sanitizedName = String(newName).slice(0, 100).trim();
    if (!sanitizedName) {
      return Response.json({ error: 'Invalid name' }, { status: 400 });
    }

    await base44.asServiceRole.entities.Session.update(sessionId, {
      session_name: sanitizedName
    });

    return Response.json({
      success: true,
      session_name: sanitizedName
    });

  } catch (error) {
    console.error('[renameSession] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
