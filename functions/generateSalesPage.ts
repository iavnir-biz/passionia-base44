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

    // Generate hero image with DALL-E
    const imagePrompt = `Professional hero image for a ${profile.passion} online course/training. Modern, clean, professional style with soft colors. Show success, transformation, learning. No text, photorealistic, inspirational.`;
    
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1792x1024",
      quality: "standard"
    });

    const heroImageUrl = imageResponse.data[0].url;

    // Generate sales page content with GPT-4
    const contentPrompt = `Tu es un expert en copywriting et pages de vente.

Crée une page de vente complète et persuasive en HTML pour :

PROFIL:
- Compétence: ${profile.passion}
- Public cible: ${profile.target_audience}
- Problème principal: ${profile.main_problem}
- Transformation: ${profile.transformation}
- Quick win: ${profile.quick_win}
- Méthode unique: ${profile.unique_method || 'Non défini'}

OFFRE:
${session.finalized_offer ? JSON.stringify(session.finalized_offer, null, 2) : 'Offre en cours de finalisation'}

STRUCTURE REQUISE (en HTML avec Tailwind CSS inline):

1. **Hero Section** (avec l'image fournie)
   - Titre percutant (H1) qui parle de la transformation
   - Sous-titre qui identifie le problème
   - CTA principal clair et visible
   - Image hero (URL fournie séparément)

2. **Section Problème**
   - 3-4 points de douleur identifiés
   - Empathie et connexion

3. **Section Solution**
   - Présentation de l'offre
   - Bénéfices clairs (pas features)
   - Transformation promise

4. **Section Comment ça marche**
   - 3-4 étapes simples
   - Rassurer sur la facilité

5. **Section Témoignages/Preuves**
   - 2-3 témoignages fictifs mais réalistes
   - Résultats concrets

6. **Section Prix & Offre**
   - Valeur perçue
   - Prix avec justification
   - Garantie

7. **Section FAQ**
   - 5-6 questions fréquentes

8. **CTA Final**
   - Urgence/rareté
   - Dernier call to action

IMPORTANT:
- Utilise Tailwind CSS pour le styling (inline dans le HTML)
- Design moderne, épuré, professionnel
- Responsive mobile-first
- Couleurs principales: #61f7a2 (vert accent), #11112b (sombre), blanc
- Ton: Tu, proche, bienveillant mais professionnel
- Retourne UNIQUEMENT le HTML complet (pas de markdown, pas d'explication)`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Tu es un expert en copywriting et web design. Tu génères des pages de vente HTML optimisées avec Tailwind CSS."
        },
        {
          role: "user",
          content: contentPrompt
        }
      ],
      temperature: 0.8
    });

    let htmlContent = completion.choices[0].message.content;

    // Clean up the response - remove markdown code blocks if present
    htmlContent = htmlContent.replace(/```html\n?/g, '').replace(/```\n?/g, '');

    // Inject the hero image URL into the HTML
    htmlContent = htmlContent.replace(
      /src="[^"]*hero[^"]*"/gi, 
      `src="${heroImageUrl}"`
    );

    // Ensure Tailwind CDN is included
    if (!htmlContent.includes('tailwindcss')) {
      htmlContent = htmlContent.replace(
        '</head>',
        '<script src="https://cdn.tailwindcss.com"></script>\n</head>'
      );
    }

    const salesPage = {
      html: htmlContent,
      heroImage: heroImageUrl,
      generatedAt: new Date().toISOString()
    };

    return Response.json({
      success: true,
      salesPage
    });

  } catch (error) {
    console.error('Error generating sales page:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});