import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
});

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

        // 🔥 P0-5: DB-first
        const sessions = await base44.asServiceRole.entities.Session.filter({ id: sessionId });
        if (!sessions || sessions.length === 0) {
            return Response.json({ error: 'Session not found' }, { status: 404 });
        }

        const session = sessions[0];

        // Check cache
        if (session.my_generated_offers) {
            return Response.json({
                ...session.my_generated_offers,
                fromCache: true
            });
        }

        const finalizedOffer = session.finalized_offer || {};
        const onboardingSummary = session.onboarding_summary || {};

        // Construct user context
        const userContext = `
PROFIL UTILISATEUR:
- Prénom: ${user.full_name || 'Non défini'}
- Email: ${user.email}

PROFIL BUSINESS:
- Passion/Expertise: ${session.skill || onboardingSummary.who_to_teach || 'Non défini'}
- Audience cible: ${onboardingSummary.learner_profile || 'Non défini'}
- Problème principal: ${onboardingSummary.main_learning_problem || 'Non défini'}
- Quick win promis: ${onboardingSummary.quick_win || 'Non défini'}
- Transformation promise: ${onboardingSummary.big_transformation || 'Non défini'}
- Angle de méthode: ${onboardingSummary.method_angle || 'Non défini'}

OFFRE FINALISÉE:
${JSON.stringify(finalizedOffer, null, 2)}
        `.trim();

        const systemMessage = `Tu es un coach business & structuration d'offres.
Ta mission : aider un créateur à CLARIFIER précisément son offre, pour qu'il puisse l'expliquer simplement, l'améliorer et la vendre avec confiance.

⚠️ TON : Explicatif, neutre, coach - PAS marketing vendeur
⚠️ INTERDIT : CTA d'achat, storytelling émotionnel, pression marketing, "Imagine-toi..."

LANGUE : Français
STYLE : Clair, factuel, pédagogique, orienté compréhension

Génère EXACTEMENT 4 OFFRES distinctes selon le funnel classique:
1. LOW TICKET (Produit d'appel) - 27-97€
2. ORDER BUMP (Vente additionnelle) - 17-47€
3. MID TICKET (Offre intermédiaire) - 197-497€
4. HIGH TICKET (Offre premium) - 997-2997€

STRUCTURE OBLIGATOIRE pour chaque offre :

{
  "title": "Nom du produit brandé (clair, concret, orienté résultat)",
  "subtitle": "Pour qui + en combien de temps",
  "product_type": "Type de produit (PDF / mini-formation / accompagnement / template / etc.)",
  "level": "Niveau (débutant / intermédiaire / avancé)",
  "duration": "Durée estimée pour consommer le produit (ex: 2h, 3 semaines, 30 jours)",
  "price": "Prix conseillé (ex: 47€)",
  "original_value": "Prix de référence ou valeur perçue (ex: 297€)",
  
  "problem": "Le problème précis que ce produit aide à résoudre. Pourquoi ce problème bloque. Ce qui se passe si pas résolu. 3-4 phrases factuelles.",
  
  "before": "Situation typique AVANT d'avoir ce produit. 2-3 phrases concrètes.",
  "after": "Situation typique APRÈS l'avoir appliqué. Ce qui change concrètement (compétences, clarté, actions). 2-3 phrases.",
  
  "deliverables": [
    "Nom du livrable + Format + Objectif + Comment l'utiliser",
    "Ex: Module 1 'Les fondamentaux' (3 vidéos, 45 min) - Comprendre X pour pouvoir Y"
  ],
  
  "how_to_use": "Quand utiliser ce produit. À quel moment du parcours. Combien de temps par jour/semaine. Ce que la personne doit FAIRE. 3-4 phrases pratiques.",
  
  "ideal_for": [
    "Niveau précis",
    "Situation précise",
    "Objectif actuel précis"
  ],
  
  "not_for": [
    "Cas précis où ce produit n'est pas adapté",
    "Ex: Si tu cherches du 100% sur-mesure"
  ],
  
  "ecosystem_role": "Rôle de cette offre (produit d'appel / complément / produit principal). Ce qu'elle prépare. Vers quoi elle peut amener. 2-3 phrases stratégiques."
}

RÈGLES CRITIQUES:
- Prix réalistes et adaptés au marché français
- Livrables ULTRA PRÉCIS avec format et durée
- Orientation enseignement / transmission
- Progression logique LOW → ORDER BUMP → MID → HIGH
- Tutoiement strict
- Ton explicatif, pas vendeur
- Tout doit aider à COMPRENDRE l'offre, pas à la vendre

Format JSON strict:
{
  "low": { offre low ticket complète },
  "bump": { offre order bump complète },
  "mid": { offre mid ticket complète },
  "high": { offre high ticket complète }
}`;

        console.log('Generating offers...');
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: userContext }
            ],
            temperature: 0.8,
            response_format: { type: "json_object" }
        });

        const offers = JSON.parse(completion.choices[0].message.content);

        const result = {
            ...offers,
            generatedAt: new Date().toISOString()
        };

        // 🔥 Save to Session
        await base44.asServiceRole.entities.Session.update(sessionId, {
            my_generated_offers: result
        });

        return Response.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error('Error generating offers:', error);
        return Response.json(
            { error: error.message || 'Failed to generate offers' },
            { status: 500 }
        );
    }
});