import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Retourne l'état de la génération en temps réel
 * Utilisé pour le polling depuis le frontend
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await req.json().catch(() => ({}));
    const resolvedSessionId = sessionId || user.sessionId;

    if (!resolvedSessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }

    // Get session
    const sessions = await base44.asServiceRole.entities.Session.filter({ id: resolvedSessionId });
    if (sessions.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = sessions[0];

    // Retourner l'état de la génération
    const generationStatus = session.generation_status || {};
    const generationInProgress = session.generation_in_progress || false;
    const allAssetsReady = session.all_assets_ready || false;

    // Calculer le progrès global (0-100%)
    const steps = ['completeMarketAnalysis', 'avatars', 'detailedOffers', 'salesMessages', 'marketingEmails'];
    const completedSteps = steps.filter(step => generationStatus[step]?.status === 'done').length;
    const totalSteps = steps.length;
    const globalProgress = Math.round((completedSteps / totalSteps) * 100);

    return Response.json({
      success: true,
      inProgress: generationInProgress,
      allReady: allAssetsReady,
      globalProgress,
      completedSteps,
      totalSteps,
      status: generationStatus,
      startedAt: session.generation_started_at,
      completedAt: session.generation_completed_at
    });

  } catch (error) {
    console.error('[checkGenerationProgress] Error:', error);
    return Response.json({
      error: error.message
    }, { status: 500 });
  }
});
