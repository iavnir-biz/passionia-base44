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

        // Generate ad image
        console.log('Generating ad image...');
        const imagePrompt = `Crée une image publicitaire professionnelle et moderne pour un produit d'enseignement digital sur le sujet: ${profile?.passion || 'développement personnel'}. 
        Style: minimaliste, moderne, couleurs vives et engageantes, typographie claire. 
        Public cible: ${profile?.target_audience || 'entrepreneurs et formateurs'}.
        L'image doit être accrocheuse et inciter à l'action, sans texte dessus.`;

        const imageResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: imagePrompt,
            n: 1,
            size: "1024x1024",
            quality: "standard"
        });

        const imageUrl = imageResponse.data[0].url;

        // Generate copy elements
        console.log('Generating ad copy...');
        const systemMessage = `Tu es un expert en copywriting publicitaire spécialisé dans les produits d'enseignement digitaux.

Génère 5 variantes DISTINCTES et CRÉATIVES pour chaque élément publicitaire:

1. HEADLINES (Titres): 40-60 caractères max
   - Accrocheurs et percutants
   - Posent une question ou créent la curiosité
   - Mettent en avant le bénéfice principal

2. SUBTITLES (Sous-titres): 80-100 caractères max
   - Complètent le titre
   - Créent l'urgence ou la désirabilité
   - Mentionnent la transformation

3. DESCRIPTIONS (Corps de texte): 120-150 caractères max
   - Expliquent la proposition de valeur
   - Incluent preuve sociale ou statistique
   - Adressent l'objection principale

4. CTAs (Boutons d'action): 15-25 caractères max
   - Action claire et directe
   - Créent l'urgence
   - Variés (pas que "Acheter maintenant")

RÈGLES:
- Utilise le tutoiement
- Style conversationnel mais professionnel
- Pas d'émojis
- Chaque variante doit être UNIQUE et apporter un angle différent
- Format JSON strict

Retourne au format JSON:
{
  "headlines": ["titre 1", "titre 2", "titre 3", "titre 4", "titre 5"],
  "subtitles": ["sous-titre 1", "sous-titre 2", "sous-titre 3", "sous-titre 4", "sous-titre 5"],
  "descriptions": ["description 1", "description 2", "description 3", "description 4", "description 5"],
  "ctas": ["cta 1", "cta 2", "cta 3", "cta 4", "cta 5"]
}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: userContext }
            ],
            temperature: 0.9,
            response_format: { type: "json_object" }
        });

        const copyElements = JSON.parse(completion.choices[0].message.content);

        return Response.json({
            image_url: imageUrl,
            headlines: copyElements.headlines,
            subtitles: copyElements.subtitles,
            descriptions: copyElements.descriptions,
            ctas: copyElements.ctas,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error generating ad copy:', error);
        return Response.json(
            { error: error.message || 'Failed to generate ad copy' },
            { status: 500 }
        );
    }
});