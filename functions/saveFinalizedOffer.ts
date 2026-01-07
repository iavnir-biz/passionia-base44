import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, key, offer } = await req.json();

    if (!sessionId || !key || !offer) {
      return Response.json({ 
        error: 'Missing required fields: sessionId, key, offer' 
      }, { status: 400 });
    }

    // Validation des clés autorisées
    const allowedKeys = ['mainProduct', 'orderBump', 'upsell1', 'upsell3'];
    if (!allowedKeys.includes(key)) {
      return Response.json({ 
        error: `Invalid key. Allowed: ${allowedKeys.join(', ')}` 
      }, { status: 400 });
    }

    // 🔥 LECTURE SERVEUR (atomic) + MERGE
    const sessions = await base44.asServiceRole.entities.Session.filter({ id: sessionId });
    
    if (!sessions || sessions.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = sessions[0];
    const currentFinalized = session.finalized_offer || {};
    
    // Merge la nouvelle offre
    currentFinalized[key] = offer;

    // Calculer potential_revenue si toutes les offres sont présentes
    let updateData = { finalized_offer: currentFinalized };

    if (currentFinalized.mainProduct && 
        currentFinalized.orderBump && 
        currentFinalized.upsell1 && 
        currentFinalized.upsell3) {
      
      const parsePrice = (priceStr) => {
        if (!priceStr) return 0;
        const cleaned = priceStr.replace(/[^0-9]/g, '');
        return parseInt(cleaned, 10) || 0;
      };

      const mainPrice = parsePrice(currentFinalized.mainProduct.price || '0');
      const bumpPrice = parsePrice(currentFinalized.orderBump.price || '0');
      const upsell1Price = parsePrice(currentFinalized.upsell1.price || '0');
      const upsell3Price = parsePrice(currentFinalized.upsell3.price || '0');

      const monthlyRevenue = 
        (mainPrice * 30) + 
        (bumpPrice * 15) + 
        (upsell1Price * 9) + 
        (upsell3Price * 1);

      updateData.potential_revenue = monthlyRevenue;
      updateData.is_offer_complete = true;

      console.log('✅ [saveFinalizedOffer] Offre complète:', {
        sessionId,
        potential_revenue: monthlyRevenue
      });
    }

    // Update atomique
    await base44.asServiceRole.entities.Session.update(sessionId, updateData);

    console.log('✅ [saveFinalizedOffer] Saved:', {
      sessionId,
      key,
      offerTitle: offer.title,
      isComplete: updateData.is_offer_complete || false
    });

    return Response.json({ 
      success: true,
      is_offer_complete: updateData.is_offer_complete || false,
      potential_revenue: updateData.potential_revenue || null
    });

  } catch (error) {
    console.error('❌ [saveFinalizedOffer] Error:', error);
    return Response.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
});