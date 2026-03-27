import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// 🔥 VALIDATION CONFIG
const ALLOWED_PRICES = {
  mainProduct: ['17€', '27€', '37€', '47€'],
  orderBump: ['14€', '17€', '27€', '37€'],
  upsell1: ['67€', '97€', '197€', '297€'],
  upsell3: ['1000€', '2000€', '3000€', '5000€']
};

const ALLOWED_FORMATS = {
  mainProduct: ['PDF', 'ebook', 'mini-formation (3 à 5 vidéos)', 'pack de 3 vidéos courtes', 'template'],
  orderBump: ['check-list', 'modèles', 'scripts', 'études de cas', 'audio bonus'],
  upsell1: ['visio 1-on-1 (1 heure)', 'formation complète (10+ vidéos)', 'communauté', 'live mensuel (1 heure)', 'atelier (2 heures)', 'masterclass enregistrée'],
  upsell3: ['coaching personnalisé (ex: 3 mois)', 'accompagnement', 'done-for-you', 'consulting', 'retraite/séminaire']
};

const MAX_LENGTHS = {
  title: 300,
  description: 2000,
  outcome: 300
};

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

    // 🔥 1) VALIDATION CHAMPS OBLIGATOIRES
    const requiredFields = ['title', 'price', 'productType', 'description', 'outcome'];
    const missingFields = requiredFields.filter(field => !offer[field] || offer[field].trim() === '');
    
    if (missingFields.length > 0) {
      console.error('❌ [saveFinalizedOffer] Champs manquants:', missingFields);
      return Response.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    // 🔥 2) VALIDATION PRIX AUTORISÉ
    const normalizedPrice = offer.price.trim();
    if (!ALLOWED_PRICES[key].includes(normalizedPrice)) {
      console.error('❌ [saveFinalizedOffer] Prix invalide:', {
        key,
        received: normalizedPrice,
        allowed: ALLOWED_PRICES[key]
      });
      return Response.json({ 
        error: `Invalid price for ${key}. Allowed: ${ALLOWED_PRICES[key].join(', ')}` 
      }, { status: 400 });
    }

    // 🔥 3) VALIDATION FORMAT (soft avec warning)
    const normalizedFormat = offer.productType.trim();
    if (!ALLOWED_FORMATS[key].includes(normalizedFormat)) {
      console.warn('⚠️ [saveFinalizedOffer] Format inhabituel:', {
        key,
        received: normalizedFormat,
        allowed: ALLOWED_FORMATS[key]
      });
      // Pas de reject, juste un warning (pour permettre variations LLM)
    }

    // 🔥 4) PROTECTION ANTI-PAYLOAD ÉNORME
    const truncatedOffer = {
      ...offer,
      title: offer.title.slice(0, MAX_LENGTHS.title),
      description: offer.description.slice(0, MAX_LENGTHS.description),
      outcome: offer.outcome.slice(0, MAX_LENGTHS.outcome)
    };

    if (offer.title.length > MAX_LENGTHS.title || 
        offer.description.length > MAX_LENGTHS.description || 
        offer.outcome.length > MAX_LENGTHS.outcome) {
      console.warn('⚠️ [saveFinalizedOffer] Texte tronqué:', {
        titleOriginal: offer.title.length,
        descOriginal: offer.description.length,
        outcomeOriginal: offer.outcome.length
      });
    }

    // 🔥 LECTURE SERVEUR (atomic) + MERGE
    const sessions = await base44.asServiceRole.entities.Session.filter({ id: sessionId });
    
    if (!sessions || sessions.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = sessions[0];
    const currentFinalized = session.finalized_offer || {};
    
    // Merge la nouvelle offre (avec données nettoyées)
    currentFinalized[key] = truncatedOffer;

    // 🔥 5) CALCUL AUTO is_offer_complete + potential_revenue
    const isComplete = Boolean(
      currentFinalized.mainProduct && 
      currentFinalized.orderBump && 
      currentFinalized.upsell1 && 
      currentFinalized.upsell3
    );

    let updateData = { finalized_offer: currentFinalized };

    // 🔥 INVALIDATION CACHE COMPLÈTE : Reset tous les contenus générés qui dépendent de l'offre
    const cacheInvalidation = {
      market_validation: null,
      future_vision: null,
      plan_de_route: null,
      generated_sales_messages: null,
      generated_marketing_emails: null,
      generated_sales_pages: null,
      my_generated_offers: null,
      generated_avatars: null
    };

    console.log('🔥 CACHE_INVALIDATED', { 
      sessionId, 
      keysReset: Object.keys(cacheInvalidation),
      reason: 'finalized_offer_updated',
      timestamp: new Date().toISOString()
    });

    Object.assign(updateData, cacheInvalidation);

    if (isComplete) {
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
        potential_revenue: monthlyRevenue,
        prices: { mainPrice, bumpPrice, upsell1Price, upsell3Price }
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