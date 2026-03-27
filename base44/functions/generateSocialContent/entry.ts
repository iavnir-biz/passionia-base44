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

        const systemMessage = `Tu es un expert en création de contenu pour réseaux sociaux (TikTok, Instagram, Facebook).

Génère 5 variantes DISTINCTES et ENGAGEANTES pour chaque type de contenu:

1. POSTS (Publications textuelles): 150-200 caractères
   - Commence par un hook accrocheur
   - Storytelling ou conseil pratique
   - Se termine par une question ou un CTA
   - Utilise des émojis stratégiquement
   - Hashtags pertinents (3-5)

2. CARROUSELS (Slides Instagram/LinkedIn):
   - Titre accrocheur du carrousel
   - 5-8 slides par carrousel
   - Chaque slide = une idée claire et concise (15-20 mots max)
   - Progression logique du contenu
   - Dernier slide = CTA fort

3. REELS/STORIES (Scripts vidéo courte 15-30 sec):
   - Hook puissant (3 premières secondes)
   - Script complet avec timing
   - Pattern: Hook → Problème → Solution → CTA
   - Dynamique et conversationnel
   - CTA clair à la fin

RÈGLES:
- Tutoiement obligatoire
- Style authentique et personnel
- Orientation enseignement/transmission
- Chaque variante unique avec angle différent
- Émojis pour les posts uniquement
- Format JSON strict

Retourne au format JSON:
{
  "posts": ["post 1 avec émojis et hashtags", "post 2...", ...],
  "carousels": [
    {
      "title": "Titre carrousel 1",
      "slides": ["slide 1", "slide 2", "slide 3", ...]
    },
    ...
  ],
  "reels": [
    {
      "hook": "Hook accrocheur en 1 phrase",
      "script": "Script complet 15-30 sec",
      "cta": "Call-to-action final"
    },
    ...
  ]
}`;

        console.log('Generating social content...');
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: userContext }
            ],
            temperature: 0.9,
            response_format: { type: "json_object" }
        });

        const content = JSON.parse(completion.choices[0].message.content);

        return Response.json({
            posts: content.posts,
            carousels: content.carousels,
            reels: content.reels,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error generating social content:', error);
        return Response.json(
            { error: error.message || 'Failed to generate social content' },
            { status: 500 }
        );
    }
});