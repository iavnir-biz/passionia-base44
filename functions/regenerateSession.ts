import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Régénère une session existante (user payant uniquement)
 * Efface les données onboarding + offres + assets
 * Le user sera redirigé vers le début de l'onboarding
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Seuls les utilisateurs payants peuvent régénérer
    if (!user.has_purchased) {
      return Response.json({
        success: false,
        error: 'upgrade_required',
        message: 'Passe Premium pour débloquer la régénération de tes sessions.'
      }, { status: 403 });
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }

    // Vérifier que la session existe et appartient à cet user
    const sessions = await base44.entities.Session.filter({ id: sessionId });
    if (!sessions || sessions.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = sessions[0];
    if (session.created_by !== user.email) {
      return Response.json({ error: 'Unauthorized access to this session' }, { status: 403 });
    }

    // Vérifier que la session n'est pas déjà en cours de régénération
    if (session.is_regenerating) {
      return Response.json({
        success: false,
        error: 'already_regenerating',
        message: 'Cette session est déjà en cours de régénération.'
      }, { status: 409 });
    }

    const currentRegenCount = session.regeneration_count || 0;

    // Réinitialiser la session
    await base44.asServiceRole.entities.Session.update(sessionId, {
      // Flag régénération
      is_regenerating: true,
      regeneration_count: currentRegenCount + 1,
      last_regenerated_at: new Date().toISOString(),

      // Reset onboarding
      onboarding_history: [],
      onboarding_summary: {},
      onboarding_full: {},
      skill: '',
      is_onboarding_done: false,

      // Reset offres
      finalized_offer: null,
      detailed_offers: null,
      is_offer_complete: false,
      potential_revenue: null,

      // Reset assets générés
      complete_market_analysis: null,
      generated_avatars: null,
      generated_sales_messages: null,
      generated_marketing_emails: null,
      generated_sales_pages: null,
      plan_de_route: null,
      plan_progress: null,

      // Reset génération
      generation_in_progress: false,
      generation_status: null,
      generation_started_at: null,
      generation_completed_at: null,
      generation_error: null,
      all_assets_ready: false,

      // Reset divers
      market_validation: null,
      future_vision: null,
      has_seen_upsell: false
    });

    console.log('[regenerateSession] Session reset:', {
      sessionId,
      userEmail: user.email,
      regenerationCount: currentRegenCount + 1
    });

    return Response.json({
      success: true,
      sessionId,
      regeneration_count: currentRegenCount + 1,
      message: 'Session réinitialisée. Redirige vers l\'onboarding.'
    });

  } catch (error) {
    console.error('[regenerateSession] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
