import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const OFFER_TYPES = {
  low: 'mainProduct',
  bump: 'orderBump',
  mid: 'upsell1',
  high: 'upsell3'
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        console.log('[generateMyOffers] body received:', body);

        const sessionId = body.sessionId || body.session?.id || user.sessionId;
        const { offerType } = body;
        console.log('[generateMyOffers] resolved sessionId:', sessionId, 'offerType:', offerType);

        if (!sessionId) {
            return Response.json({ error: 'sessionId required' }, { status: 400 });
        }

        if (!offerType || !OFFER_TYPES[offerType]) {
            return Response.json({ error: 'Valid offerType required (low, bump, mid, high)' }, { status: 400 });
        }

        // 🔥 DB-first: load Session
        const sessions = await base44.asServiceRole.entities.Session.filter({ id: sessionId });
        if (!sessions || sessions.length === 0) {
            return Response.json({ error: 'Session not found' }, { status: 404 });
        }

        const session = sessions[0];

        // Check cache: if this specific offer is already enriched with REAL data
        const cachedOffer = session.my_generated_offers?.[offerType];
        const isReallyEnriched = cachedOffer && (
            (cachedOffer.before && cachedOffer.after) ||
            (cachedOffer.benefits && cachedOffer.benefits.length > 0) ||
            (cachedOffer.deliverables && cachedOffer.deliverables.length > 3)
        );
        
        if (isReallyEnriched) {
            console.log(`[generateMyOffers] ${offerType} already enriched, returning from cache`);
            return Response.json({
                ...cachedOffer,
                fromCache: true
            });
        }

        // 🔥 GET BASE OFFER (source of truth: finalized_offer)
        const finalizedOffer = session.finalized_offer || {};
        const baseOfferKey = OFFER_TYPES[offerType];
        const baseOffer = finalizedOffer[baseOfferKey] || {};

        console.log(`[generateMyOffers] Base offer (${baseOfferKey}):`, baseOffer);

        if (!baseOffer.title || !baseOffer.price) {
            return Response.json({
                error: `Offre ${offerType} incomplète. Complète d'abord les choix en onboarding.`
            }, { status: 400 });
        }

        const onboardingSummary = session.onboarding_summary || {};
        const avatars = session.generated_avatars || {};

        // SYSTEM PROMPT: ENRICHIR UNIQUEMENT
        const systemMessage = `Tu es Nova, expert en structuration d'offres pédagogiques.

⚠️ RÈGLE CRITIQUE : Tu DOIS GARDER EXACTEMENT :
- title: "${baseOffer.title}" (inchangé)
- price: "${baseOffer.price}" (inchangé)
- product_type: "${baseOffer.product_type || 'non spécifié'}" (inchangé si présent)
- level: "${baseOffer.level || 'non spécifié'}" (inchangé si présent)
- duration: "${baseOffer.duration || 'non spécifié'}" (inchangé si présent)

Ta SEULE mission : ENRICHIR les champs manquants avec une analyse détaillée type PSSO (Problème-Solution-Stratégie-Opportunité) :
- subtitle: "Pour qui + résultat attendu (une phrase accrocheuse)"
- description: "Description détaillée de l'offre, sa valeur unique et ce qui la différencie (3-4 phrases)"
- problem: "Problème précis et émotionnel que cette offre résout (4-5 phrases avec impact émotionnel)"
- before: "Situation actuelle détaillée : frustrations, blocages, conséquences (3-4 phrases)"
- after: "Situation après transformation : résultats concrets, émotions positives, nouveau quotidien (3-4 phrases)"
- deliverables: [liste très détaillée des livrables avec format, durée, et bénéfice de chaque élément - minimum 5-8 items]
- benefits: [liste de 5-7 bénéfices concrets et émotionnels]
- how_to_use: "Stratégie d'utilisation : quand proposer cette offre, à qui, dans quel contexte, comment la positionner (4-5 phrases)"
- ideal_for: [liste de 5-7 personas/situations très précises avec contexte]
- not_for: [5-6 cas précis où ce produit n'est pas adapté]
- ecosystem_role: "Analyse stratégique : rôle dans le funnel, synergie avec les autres offres, objectif business (4-5 phrases)"

STYLE : Coach pédagogique, tutoiement, français naturel, précis et détaillé, zero fluff marketing.

IMPORTANT : Chaque champ doit être riche en détails, contexte et nuances. Utilise le contexte business fourni pour personnaliser au maximum.

SORTIE ATTENDUE (JSON strict, une seule offre) :
{
  "title": "${baseOffer.title}",
  "price": "${baseOffer.price}",
  "product_type": "${baseOffer.product_type || ''}",
  "level": "${baseOffer.level || ''}",
  "duration": "${baseOffer.duration || ''}",
  "subtitle": "...",
  "description": "...",
  "problem": "...",
  "before": "...",
  "after": "...",
  "deliverables": [...],
  "benefits": [...],
  "how_to_use": "...",
  "ideal_for": [...],
  "not_for": [...],
  "ecosystem_role": "..."
}`;

        const userContext = `
CONTEXTE UTILISATEUR:
- Prénom: ${user.full_name || 'Non défini'}
- Email: ${user.email}

OFFRE À ENRICHIR (${offerType.toUpperCase()}):
${JSON.stringify(baseOffer, null, 2)}

CONTEXTE BUSINESS:
- Compétence: ${session.skill || onboardingSummary.who_to_teach || 'Non défini'}
- Audience cible: ${onboardingSummary.learner_profile || 'Non défini'}
- Problème principal: ${onboardingSummary.main_learning_problem || 'Non défini'}
- Transformation promise: ${onboardingSummary.big_transformation || 'Non défini'}

AVATARS CLIENTS (référence):
${JSON.stringify(avatars, null, 2)}`;

        console.log(`[generateMyOffers] Enriching ${offerType}...`);
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: userContext }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const enrichedOffer = JSON.parse(completion.choices[0].message.content);

        // 🔥 MERGE & SAVE to Session
        const currentOffers = session.my_generated_offers || {};
        const updatedOffers = {
            ...currentOffers,
            [offerType]: enrichedOffer
        };

        await base44.asServiceRole.entities.Session.update(sessionId, {
            my_generated_offers: updatedOffers
        });

        console.log(`[generateMyOffers] ${offerType} enriched and saved`);

        return Response.json({
            success: true,
            ...enrichedOffer
        });

    } catch (error) {
        console.error('[generateMyOffers] Error:', error);
        return Response.json(
            { error: error.message || 'Failed to enrich offer' },
            { status: 500 }
        );
    }
});