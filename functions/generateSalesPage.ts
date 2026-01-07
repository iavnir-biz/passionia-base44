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
    if (session.generated_sales_pages) {
      return Response.json({
        success: true,
        salesPage: session.generated_sales_pages,
        fromCache: true
      });
    }

    const finalizedOffer = session.finalized_offer || {};
    const onboardingSummary = session.onboarding_summary || {};
    const onboardingFull = session.onboarding_full || {};

    const skill = session.skill || onboardingSummary.who_to_teach || 'ta compétence';
    const mainProduct = finalizedOffer.mainProduct || {};
    const painPoints = onboardingSummary.main_learning_problem || '';
    const lifeChanges = onboardingFull.life_change || '';
    const inactionCost = onboardingFull.if_nothing_changes || '';

    const profile = {
      passion: skill,
      transformation: onboardingSummary.big_transformation || mainProduct.outcome || '',
      quick_win: onboardingSummary.quick_win || '',
      main_problem: painPoints
    };

    session.offer_generation = {
      offerChoices: {
        product_principal: mainProduct
      }
    };
    session.onboarding_full = onboardingFull;

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

    // Extract product data from session
    const mainProduct = session.offer_generation?.offerChoices?.product_principal || {};
    const mainProductTitle = mainProduct.title || profile.passion;
    const mainProductPrice = mainProduct.price || 'Prix à définir';
    const mainProductType = mainProduct.delivery_type || 'Formation digitale';
    const mainProductDescription = mainProduct.description || mainProduct.full_description || '';
    const mainProductOutcome = profile.transformation || profile.quick_win || '';
    
    const painPoints = profile.main_problem || '';
    const lifeChanges = session.onboarding_full?.life_change || '';
    const inactionCost = session.onboarding_full?.if_nothing_changes || '';
    const skill = profile.passion || '';

    // Generate sales page content with GPT-4 - Structure complète et visuelle
    const contentPrompt = `Tu es un expert en Copywriting et Web Design. Tu dois créer une PAGE DE VENTE HTML COMPLÈTE, VISUELLE et PRÊTE À L'EMPLOI.

DONNÉES CLIENT :
- Expert : ${user.full_name}
- Compétence : ${skill}
- Produit : ${mainProductTitle}
- Prix : ${mainProductPrice}€
- Format : ${mainProductType}
- Description : ${mainProductDescription}
- Transformation : ${mainProductOutcome}
- Douleurs : ${painPoints}
- Rêves : ${lifeChanges}
- Coût inaction : ${inactionCost}

STRUCTURE OBLIGATOIRE (HTML complet) :

1. **Bandeau urgence** (sticky top, fond vert #61f7a2)
   "🔥 Offre de lancement - Accès anticipé avec bonus inclus"

2. **Hero Section** (bg-gradient, padding généreux)
   - Titre H1 GRAND et accrocheur avec ${skill} + ${mainProductOutcome}
   - Sous-titre H2 clair (problème → solution)
   - CTA bouton XXL vert #61f7a2 "Je veux accéder maintenant"
   - Image hero (placeholder "HERO_IMAGE_PLACEHOLDER")

3. **Section Frustrations** (fond blanc, 3 colonnes)
   "Tu en as marre de..."
   - 3-5 frustrations en cards avec icônes 😤

4. **Section Pas besoin** (fond gris très clair)
   "Le meilleur ? Tu n'as PAS besoin de..."
   - 3 éléments avec croix rouge ❌

5. **Solution** (fond blanc, centré)
   Présenter ${mainProductTitle} avec conviction
   - Box centrale avec ombre
   - Liste bénéfices avec checkmarks verts ✓

6. **Comment ça marche** (3 étapes visuelles)
   - 3 cards numérotées (1, 2, 3)
   - Icônes illustratives
   - Texte court et clair

7. **Pour qui** (2 colonnes)
   - Colonne verte : "✅ C'est pour toi si..."
   - Colonne rouge (optionnelle) : "❌ Pas pour toi si..."

8. **Contenu détaillé** (liste enrichie)
   "Ce que tu vas obtenir :"
   - Modules/ressources détaillés
   - Bonus visuels
   - Transformation finale en gras

9. **Témoignages** (cards avec photos placeholder)
   - 3 témoignages réalistes
   - Avatars ronds
   - Résultats concrets

10. **Prix & Offre** (section centrale, fond clair)
    - Ancien prix barré
    - Prix actuel GRAND ${mainProductPrice}€
    - Garantie 30 jours avec badge
    - CTA bouton XXL

11. **FAQ** (accordéon visuel)
    - 5-6 questions pertinentes
    - Réponses rassurantes

12. **CTA Final** (section sombre, contraste fort)
    - Rappel promesse
    - Urgence
    - Bouton CTA final ÉNORME

DESIGN OBLIGATOIRE :
- HTML5 complet avec <!DOCTYPE html>
- Tailwind CDN dans <head>
- Sections bien espacées (py-16, py-20)
- Typographie hiérarchisée (text-5xl, text-3xl, text-xl...)
- Couleurs : #61f7a2 (CTA), #f3f4f6 (backgrounds), #111827 (textes)
- Boutons avec hover et ombres
- Responsive mobile-first
- Icônes émojis pour illustrations
- Espacements généreux entre sections

CRITÈRE DE QUALITÉ :
La page DOIT ressembler à une vraie landing page professionnelle.
Chaque section doit avoir du contenu riche et personnalisé.
Le HTML doit être COMPLET et directement utilisable.

Retourne UNIQUEMENT le code HTML complet (pas de \`\`\`html, pas d'explication).`;

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
      /HERO_IMAGE_PLACEHOLDER/g, 
      heroImageUrl
    );
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

    // 🔥 Save to Session
    await base44.asServiceRole.entities.Session.update(sessionId, {
      generated_sales_pages: salesPage
    });

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