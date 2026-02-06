import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Récupère toutes les sessions d'un utilisateur
 * Avec métadonnées et résumé pour le dashboard
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

    // Récupérer toutes les sessions
    const sessions = await base44.entities.Session.filter({ created_by: user.email });

    // Formatter pour le dashboard
    const formattedSessions = sessions
      .map(s => ({
        id: s.id,
        session_number: s.session_number || 1,
        session_name: s.session_name || `Session ${s.session_number || 1}`,
        skill: s.skill || s.onboarding_full?.coreSkill || '',
        created_date: s.created_date,
        updated_date: s.updated_date,
        last_regenerated_at: s.last_regenerated_at || null,
        regeneration_count: s.regeneration_count || 0,
        is_regenerating: s.is_regenerating || false,
        is_onboarding_done: s.is_onboarding_done || false,
        generation_in_progress: s.generation_in_progress || false,
        // Résumé des assets générés
        has_market_analysis: !!s.complete_market_analysis,
        has_avatars: !!s.generated_avatars,
        has_offers: !!s.detailed_offers || !!s.finalized_offer?.mainProduct?.title,
        has_sales_messages: !!s.generated_sales_messages,
        has_emails: !!s.generated_marketing_emails,
        has_sales_page: !!s.generated_sales_pages,
        has_plan: !!s.plan_de_route || !!s.plan_progress,
        // Aperçu offre principale
        main_offer_title: s.finalized_offer?.mainProduct?.title || null,
        main_offer_price: s.finalized_offer?.mainProduct?.price || null,
        potential_revenue: s.potential_revenue || null,
        // Compteur d'assets
        assets_count: [
          s.complete_market_analysis,
          s.generated_avatars,
          s.detailed_offers || s.finalized_offer?.mainProduct?.title,
          s.generated_sales_messages,
          s.generated_marketing_emails,
          s.generated_sales_pages
        ].filter(Boolean).length,
        assets_total: 6
      }))
      .sort((a, b) => a.session_number - b.session_number);

    return Response.json({
      success: true,
      sessions: formattedSessions,
      current: formattedSessions.length,
      max: maxSessions,
      has_purchased: isPaid,
      canCreate: formattedSessions.length < maxSessions
    });

  } catch (error) {
    console.error('[getUserSessions] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
