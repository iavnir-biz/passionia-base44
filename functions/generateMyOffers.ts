import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Anthropic from 'npm:@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
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
        // Prompt spécifique pour le Produit Principal (low-ticket / Quick Win)
        const LOW_TICKET_SYSTEM_MESSAGE = `Tu es un expert de classe mondiale en copywriting et en création d'offres digitales, spécialisé dans la vente de savoir-faire (infoproduits).
Ta mission : Enrichir un "Produit Principal" (offre d'appel low-ticket) irrésistible qui agit comme un Quick Win — la première marche d'une échelle de valeur.

⚠️ RÈGLE CRITIQUE : Tu DOIS GARDER EXACTEMENT :
- title: "${baseOffer.title}" (inchangé)
- price: "${baseOffer.price}" (inchangé)
- product_type: "${baseOffer.product_type || 'non spécifié'}" (inchangé si présent)
- level: "${baseOffer.level || 'non spécifié'}" (inchangé si présent)
- duration: "${baseOffer.duration || 'non spécifié'}" (inchangé si présent)

🎯 CONCEPT CLÉ : LE QUICK WIN
Ce produit principal doit :
✅ Résoudre LA PREMIÈRE problématique que rencontre un débutant dans ce domaine
✅ Apporter un résultat IMMÉDIAT et concret
✅ Créer une vraie transformation et un changement de paradigme
✅ Être simple à mettre en place (pas de complexité inutile)
✅ Donner envie d'aller plus loin (c'est la première marche, pas l'escalier complet)

Méthodologie P.S.S.O. à appliquer pour enrichir :

1. Problem (Problème) — identifie LA PREMIÈRE problématique spécifique, douloureuse et concrète que rencontre un débutant absolu.
   C'est le premier obstacle qu'il rencontre, ce qui le bloque MAINTENANT, c'est frustrant et urgent à résoudre.

2. Stats (Statistiques) — inclus une donnée tangible (étude, tendance, preuve sociale) qui prouve que ce problème est réel et urgent.

3. Solution — décris la transformation obtenue.
   Ce n'est PAS "ce qu'il y a dedans", c'est "qui le client DEVIENT" après avoir consommé le produit.
   C'est le changement de paradigme, le résultat immédiat qu'il va obtenir.

4. Offer — titre et positionnement (déjà fixés, à respecter).

RÈGLE D'OR sur les livrables :
✅ Ce produit = le QUOI faire (contenu essentiel pour obtenir le résultat, instructions de base)
❌ Ne PAS inclure : plannings/calendriers, guides d'organisation avancés, checklists détaillées, templates/outils, adaptations/variantes, guides "aller plus vite", astuces "préparation à l'avance"
(Ces éléments sont réservés pour l'Order Bump)

ATTENTION SUR LES LIVRABLES :
✅ Sois ultra-spécifique : "Ebook de 28 pages avec 5 exercices pratiques", "Série de 3 vidéos de 10 minutes", "Pack de 7 recettes illustrées"
❌ Pas : "Des vidéos et des ressources"

STYLE : Bienveillant et encourageant, expert mais accessible, axé sur le résultat rapide et concret, tutoiement, français naturel.

Ta mission : ENRICHIR les champs suivants en appliquant rigoureusement la méthodologie P.S.S.O. et le concept Quick Win :
- subtitle: "Pour qui + résultat rapide et concret attendu (une phrase accrocheuse, max 60 caractères)"
- description: "Description de la transformation immédiate — qui le client DEVIENT après consommation (3-4 phrases)"
- problem: "LA PREMIÈRE problématique spécifique et douloureuse que rencontre un débutant absolu — premier obstacle qui le bloque MAINTENANT (4-5 phrases avec impact émotionnel et pratique)"
- pain_degree: "Faible / Modéré / Fort / Très Fort" (évaluation du degré de douleur du problème)
- pain_justification: "Explication courte du degré de douleur : impact émotionnel, fréquence, impact sur la vie (2-3 phrases)"
- stat_proof: "Donnée chiffrée ou preuve sociale qui prouve que ce problème est réel et urgent (1-2 phrases)"
- before: "Situation AVANT : le débutant qui galère, ses frustrations concrètes, ce qui le bloque (3-4 phrases)"
- after: "Situation APRÈS : la transformation immédiate, qui il devient, ce qu'il sait faire concrètement (3-4 phrases)"
- outcome: "Ce que le client saura faire concrètement après avoir consommé le produit — résultat mesurable et immédiat (1-2 phrases précises)"
- time_to_result: "En combien de temps il obtient son premier résultat — ambitieux mais crédible (ex: 20 minutes, 2 heures, 1 journée)"
- deliverables: [liste ultra-précise des livrables avec format exact, durée/volume, et bénéfice — minimum 4-6 items — UNIQUEMENT le contenu essentiel QUOI faire, pas d'outils d'organisation]
- benefits: [liste de 5-7 bénéfices concrets et émotionnels liés au Quick Win]
- how_to_use: "Quand proposer cette offre, à qui, dans quel contexte (3-4 phrases)"
- ideal_for: [liste de 4-6 personas/situations idéales très précises avec contexte]
- not_for: [3-4 cas où ce produit n'est PAS adapté]
- ecosystem_role: "Pourquoi c'est la première marche : comment ce Quick Win ouvre la porte à l'Order Bump et aux produits suivants (3-4 phrases)"
- first_step_role: "En quoi ce résultat rapide crée le déclic 'AH ! Je peux le faire !' et donne envie d'aller plus loin (2-3 phrases)"

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
  "pain_degree": "...",
  "pain_justification": "...",
  "stat_proof": "...",
  "before": "...",
  "after": "...",
  "outcome": "...",
  "time_to_result": "...",
  "deliverables": [...],
  "benefits": [...],
  "how_to_use": "...",
  "ideal_for": [...],
  "not_for": [...],
  "ecosystem_role": "...",
  "first_step_role": "..."
}`;

        const GENERIC_SYSTEM_MESSAGE = `Tu es Nova, expert en structuration d'offres pédagogiques.

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

        const systemMessage = offerType === 'low' ? LOW_TICKET_SYSTEM_MESSAGE : GENERIC_SYSTEM_MESSAGE;

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

        // Appel API avec retry automatique sur 429/529
        let completion;
        const maxApiRetries = 3;
        for (let apiAttempt = 0; apiAttempt <= maxApiRetries; apiAttempt++) {
          try {
            completion = await anthropic.messages.create({
                model: "claude-sonnet-4-20250514",
                max_tokens: 4096,
                temperature: 0.7,
                system: systemMessage,
                messages: [
                    {
                        role: "user",
                        content: userContext
                    }
                ]
            });
            break;
          } catch (apiError) {
            const status = apiError.status || apiError.statusCode;
            const isRetryable = status === 429 || status === 529 || apiError.message?.includes('overloaded');
            if (isRetryable && apiAttempt < maxApiRetries) {
              const waitTime = (apiAttempt + 1) * 5000;
              console.warn(`[generateMyOffers] API ${status}, retry ${apiAttempt + 1}/${maxApiRetries} in ${waitTime}ms`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              continue;
            }
            throw apiError;
          }
        }

        // Extraction du JSON depuis la réponse de Claude
        let enrichedOffer;
        const responseText = completion.content[0].text;
        
        // Claude peut parfois wrapper le JSON dans des balises, on les retire
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            enrichedOffer = JSON.parse(jsonMatch[0]);
        } else {
            enrichedOffer = JSON.parse(responseText);
        }

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