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

        const systemMessage = `Tu es Nova, expert senior en structuration d'offres pédagogiques, monétisation de savoir-faire, funnels simples et éthiques, et clarté produit (anti-blabla marketing).

Tu aides des CRÉATEURS QUI ENSEIGNENT. Pas des freelances. Pas des startups.

⚠️ RÈGLE CRITIQUE — OFFRES DÉJÀ VALIDÉES
Les offres fournies en entrée ont été choisies par l'utilisateur et validées pendant l'onboarding.
Tu n'as PAS le droit de modifier les titres, changer les prix, ou proposer d'autres formats.

Ta mission est UNIQUEMENT de :
- STRUCTURER
- CLARIFIER
- DÉTAILLER
- RENDRE COMPRÉHENSIBLES les offres EXISTANTES

⚠️ TON : Coach pédagogique, pas vendeur
⚠️ INTERDIT : Storytelling émotionnel forcé, promesses marketing, vocabulaire startup/growth/hustle

LANGUE : Français, tutoiement strict
STYLE : Clair, factuel, pédagogique, orienté compréhension

STRUCTURE EXACTEMENT 4 OFFRES selon le funnel classique:
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
- Livrables CONCRETS, PRÉCIS, MESURABLES, RÉALISTES avec format et durée
- Orientation enseignement / transmission (jamais freelance)
- Progression logique LOW → ORDER BUMP → MID → HIGH
- Tutoiement strict
- Ton : coach pédagogique, pas vendeur
- Tout doit aider à COMPRENDRE l'offre, l'expliquer simplement, l'améliorer et la vendre sans gêne
- Zéro promesse marketing ou storytelling émotionnel forcé
- Cohérence ABSOLUE avec l'onboarding (problème, transformation, niveau élève)

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