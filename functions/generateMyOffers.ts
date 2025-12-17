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

        const systemMessage = `Tu es un expert en création d'offres de produits d'enseignement digitaux.

Génère EXACTEMENT 4 OFFRES distinctes selon le funnel classique:

1. LOW TICKET (Produit d'appel) - 27-97€
2. ORDER BUMP (Vente additionnelle) - 17-47€
3. MID TICKET (Offre intermédiaire) - 197-497€
4. HIGH TICKET (Offre premium) - 997-2997€

STRUCTURE STRICTE pour chaque offre:

{
  "title": "Nom accrocheur de l'offre",
  "price": "Prix exact (ex: 47€)",
  "description": "Pitch de 2-3 phrases max expliquant la transformation promise",
  "deliverables": [
    "Livrable 1 précis",
    "Livrable 2 précis",
    "Livrable 3 précis",
    "Livrable 4 précis (si applicable)"
  ],
  "benefits": [
    "Bénéfice transformation 1",
    "Bénéfice transformation 2",
    "Bénéfice transformation 3"
  ]
}

RÈGLES CRITIQUES:
- Prix réalistes et adaptés au marché français
- Livrables CONCRETS (pas de vague promesse)
- Format: vidéos, PDF, templates, coaching, etc.
- Durée / quantité précise
- Orientation enseignement / transmission
- Progression logique LOW → ORDER BUMP → MID → HIGH
- Tutoiement dans les descriptions
- Langage simple et clair

Format JSON strict:
{
  "low": { offre low ticket },
  "bump": { offre order bump },
  "mid": { offre mid ticket },
  "high": { offre high ticket }
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