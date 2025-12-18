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

        const { profile, session } = await req.json();

        // Construct user context
        const userContext = `
PROFIL UTILISATEUR:
- Prénom: ${user.full_name || 'Non défini'}
- Email: ${user.email}

PROFIL BUSINESS:
${profile ? `
- Passion/Expertise: ${profile.passion || 'Non défini'}
- Audience cible: ${profile.target_audience || 'Non défini'}
- Problème principal: ${profile.main_problem || 'Non défini'}
- Quick win promis: ${profile.quick_win || 'Non défini'}
- Transformation finale: ${profile.transformation || 'Non défini'}
- Méthode unique: ${profile.unique_method || 'Non défini'}
` : 'Profil non renseigné'}

INFORMATIONS ONBOARDING:
${session?.onboarding_summary ? `
- Qui enseigner: ${session.onboarding_summary.who_to_teach || 'Non défini'}
- Profil apprenant: ${session.onboarding_summary.learner_profile || 'Non défini'}
- Problème d'apprentissage: ${session.onboarding_summary.main_learning_problem || 'Non défini'}
- Transformation promise: ${session.onboarding_summary.big_transformation || 'Non défini'}
- Angle de méthode: ${session.onboarding_summary.method_angle || 'Non défini'}
` : 'Onboarding non complété'}

OFFRE EXISTANTE:
${session?.offer_generation ? `
${JSON.stringify(session.offer_generation, null, 2)}
` : 'Offre non définie'}
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
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: userContext }
            ],
            temperature: 0.8,
            response_format: { type: "json_object" }
        });

        const offers = JSON.parse(completion.choices[0].message.content);

        return Response.json({
            ...offers,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error generating offers:', error);
        return Response.json(
            { error: error.message || 'Failed to generate offers' },
            { status: 500 }
        );
    }
});