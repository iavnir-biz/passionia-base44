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

        const systemMessage = `Tu es un expert en marketing, copywriting et création d'offres digitales à forte conversion.

Ta mission est de générer le DÉTAIL COMPLET d'une offre digitale orientée RÉSULTAT et TRANSFORMATION,
et NON une simple fiche produit.

⚠️ INTERDIT :
- Ton scolaire ou académique
- Description générique
- Liste de caractéristiques sans contexte
- Langage passif

LANGUE : Français
TON : Direct, clair, motivant, orienté utilisateur
STYLE : Marketing, concret, humain, accessible

Génère EXACTEMENT 4 OFFRES distinctes selon le funnel classique:
1. LOW TICKET (Produit d'appel) - 27-97€
2. ORDER BUMP (Vente additionnelle) - 17-47€
3. MID TICKET (Offre intermédiaire) - 197-497€
4. HIGH TICKET (Offre premium) - 997-2997€

STRUCTURE OBLIGATOIRE pour chaque offre (dans cet ordre) :

{
  "title": "Titre orienté résultat (pas le format)",
  "subtitle": "Pour qui + en combien de temps + sans complexité",
  "price": "Prix exact (ex: 47€)",
  "original_value": "Valeur totale estimée (ex: 297€)",
  "pain_before": "Décris précisément la situation frustrante actuelle de la personne. 2-3 phrases où elle peut se reconnaître.",
  "transformation_after": "Décris la situation idéale après avoir suivi l'offre. Projection concrète et réaliste. 2-3 phrases.",
  "solution": "Présente l'offre comme la solution logique au problème. Explique pourquoi cette approche fonctionne. 2-3 phrases.",
  "deliverables": [
    "Module 1 : Description précise de ce que l'utilisateur va apprendre ou obtenir",
    "Module 2 : Description précise",
    "Module 3 : Description précise",
    "Bonus : Si applicable"
  ],
  "benefits": [
    "Résultat concret 1 (émotionnel ou pratique)",
    "Résultat concret 2 (pas de répétition des livrables)",
    "Résultat concret 3"
  ],
  "for_who": [
    "Pour qui doit acheter cette offre (2-3 profils)",
    "Exemple: Tu es débutant mais motivé"
  ],
  "not_for_who": [
    "Qui ne doit pas l'acheter",
    "Exemple: Tu cherches un miracle sans effort"
  ],
  "why_now": "Raison d'acheter maintenant (offre de lancement, bonus, test bêta, rareté). 1-2 phrases."
}

RÈGLES CRITIQUES:
- Prix réalistes et adaptés au marché français
- Livrables CONCRETS (pas de vague promesse)
- Format: vidéos, PDF, templates, coaching, etc.
- Durée / quantité précise
- Orientation enseignement / transmission
- Progression logique LOW → ORDER BUMP → MID → HIGH
- Tutoiement strict
- Le texte doit donner envie d'acheter immédiatement
- Tout doit être prêt à être affiché tel quel dans une page "Détails de l'offre"

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