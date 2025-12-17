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

OFFRE SÉLECTIONNÉE:
${session?.offer_generation ? `
${JSON.stringify(session.offer_generation, null, 2)}
` : 'Offre non définie'}
        `.trim();

        const systemMessage = `Tu es un expert en création d'avatars clients (buyer personas) ultra-détaillés.

Génère EXACTEMENT 3 AVATARS CLIENTS distincts et complémentaires pour cette offre.

STRUCTURE STRICTE pour chaque avatar:

{
  "name": "Nom du segment (ex: Le Salarié Désabusé, L'Entrepreneur Solo, L'Étudiant Ambitieux)",
  "tagline": "Phrase résumé en 10-15 mots",
  "profile": "Description démographique et psychographique complète (150-200 mots) : âge, situation, contexte de vie, niveau d'expertise actuel, habitudes",
  "frustrations": "3-5 frustrations majeures très spécifiques liées au problème (100-150 mots)",
  "goals": "3-5 objectifs concrets qu'ils veulent atteindre (100-150 mots)",
  "desires": "Désirs émotionnels profonds, aspirations, ce qu'ils veulent vraiment au-delà du rationnel (100-150 mots)",
  "fears": "Peurs, freins psychologiques, objections typiques qui les bloquent (100-150 mots)",
  "how_to_reach": "Où les trouver, comment leur parler, quel langage utiliser, quels canaux privilégier (100-150 mots)"
}

RÈGLES CRITIQUES:
- Les 3 avatars doivent être COMPLÉMENTAIRES (couvrir différents segments de l'audience cible)
- Chaque avatar = une personne réelle qu'on peut visualiser
- Langage émotionnel et spécifique (pas de généralités)
- Basé sur la psychologie du client idéal pour cette offre
- Tutoiement dans les descriptions
- Aucun jargon marketing
- 100% adapté à l'audience cible définie

Format JSON strict:
{
  "avatars": [
    { avatar 1 },
    { avatar 2 },
    { avatar 3 }
  ]
}`;

        console.log('Generating client avatars...');
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: userContext }
            ],
            temperature: 0.8,
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content);

        return Response.json({
            avatars: result.avatars,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error generating avatars:', error);
        return Response.json(
            { error: error.message || 'Failed to generate avatars' },
            { status: 500 }
        );
    }
});