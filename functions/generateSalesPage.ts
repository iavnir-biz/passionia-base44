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

    // 🔥 EXTRACTION DONNÉES EXISTANTES (OBLIGATOIRE)
    const lowTicketOffer = session.my_generated_offers?.low || {};
    const avatars = session.generated_avatars || {};
    const onboardingSummary = session.onboarding_summary || {};
    const onboardingFull = session.onboarding_full || {};

    // Vérification critique
    if (!lowTicketOffer.title) {
      return Response.json({ 
        error: 'Offre LOW TICKET non trouvée. Complète d\'abord la génération des offres.' 
      }, { status: 400 });
    }

    // Generate sales page content with GPT-4 - Méthode PAS stricte
    const contentPrompt = `TU ES NOVA — EXPERT EN COPYWRITING DE PAGES DE VENTE & UX PRODUIT SAAS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 CONTEXTE PRODUIT (CRITIQUE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cette génération concerne **UNIQUEMENT la page de vente du PRODUIT LOW TICKET**.
Ce produit est le **produit principal d'entrée** de l'écosystème de l'utilisateur.

⚠️ INTERDICTION ABSOLUE :
- Modifier le titre de l'offre
- Changer le prix
- Inventer des livrables
- Proposer une autre offre

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 DONNÉES PRODUIT (SOURCE DE VÉRITÉ)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OFFRE LOW TICKET :
${JSON.stringify(lowTicketOffer, null, 2)}

AVATARS CLIENTS :
${JSON.stringify(avatars, null, 2)}

ONBOARDING SUMMARY :
${JSON.stringify(onboardingSummary, null, 2)}

ONBOARDING FULL :
- Vie future souhaitée : ${onboardingFull.life_change || 'Non renseigné'}
- Coût de l'inaction : ${onboardingFull.if_nothing_changes || 'Non renseigné'}
- Obstacles : ${JSON.stringify(onboardingFull.obstacles || [])}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 MÉTHODE COPYWRITING OBLIGATOIRE : PAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tu DOIS structurer toute la page selon la méthode **PAS** :

- **PROBLEM** : douleurs réelles des avatars
- **AGITATE** : conséquences concrètes si rien ne change (utilise onboarding_full.if_nothing_changes)
- **SOLUTION** : le PRODUIT LOW TICKET comme réponse logique

⚠️ PAS ne doit JAMAIS être visible dans les titres.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧑‍🎓 TON & POSITIONNEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Tutoiement strict
- Ton : clair, pédagogique, rassurant
- Jamais agressif, jamais manipulateur
- Jamais "marketing bullshit"

Tu t'adresses à quelqu'un d'intelligent mais bloqué, pas à un prospect naïf.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧩 STRUCTURE OBLIGATOIRE DE LA PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. **Bandeau d'attention sobre** (pas de fausse urgence)
   Expliquer simplement ce que c'est

2. **HERO**
   - H1 : transformation promise du produit LOW (utilise lowTicketOffer.after)
   - H2 : problème → solution (utilise lowTicketOffer.problem)
   - CTA clair
   - Image hero (placeholder "HERO_IMAGE_PLACEHOLDER")

3. **PROBLÈME** (utilise avatars)
   - Frustrations réelles tirées des avatars
   - Langage exact des avatars

4. **AGITATION**
   - "Si rien ne change…"
   - Conséquences concrètes tirées de onboarding_full.if_nothing_changes

5. **SOLUTION**
   - Présentation du produit LOW (titre exact : ${lowTicketOffer.title})
   - Ce qu'il fait / ce qu'il ne fait pas (utilise lowTicketOffer.ideal_for / not_for)

6. **COMMENT ÇA MARCHE**
   - Étapes simples (utilise lowTicketOffer.how_to_use)
   - Usage réel du produit

7. **POUR QUI / PAS POUR QUI**
   - Basé sur lowTicketOffer.ideal_for / not_for

8. **CONTENU DÉTAILLÉ**
   - Livrables EXACTS tirés de lowTicketOffer.deliverables
   - Formats + objectifs

9. **TÉMOIGNAGES RÉALISTES**
   - Crédibles, miroir avatars
   - Pas de promesses irréelles

10. **PRIX & VALEUR**
    - Prix : ${lowTicketOffer.price} (EXACT, ne pas modifier)
    - Valeur expliquée : ${lowTicketOffer.original_value}
    - Pas de faux rabais

11. **FAQ**
    - Objections réelles des avatars
    - Rassurer sans vendre

12. **CTA FINAL**
    - Calme, assumé
    - Aligné produit low ticket

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 DESIGN OBLIGATOIRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- HTML5 complet avec <!DOCTYPE html>
- Tailwind CSS via CDN dans <head>
- Sections aérées (py-16, py-20)
- Typographie hiérarchisée (text-5xl, text-3xl, text-xl...)
- Couleurs : #61f7a2 (CTA), #f3f4f6 (backgrounds), #111827 (textes)
- Responsive mobile-first
- Pas de Markdown, pas de texte brut

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 INTERDICTIONS ABSOLUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Pas de "deviens riche"
- Pas de fausse urgence
- Pas de manipulation émotionnelle
- Pas de storytelling inventé
- Pas de promesses irréalistes
- Pas de CTA agressifs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ CRITÈRE DE QUALITÉ FINAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

La page doit être :
- Publiable telle quelle
- Cohérente avec l'offre choisie
- Alignée avatars / onboarding
- Donner confiance à un vrai utilisateur

Retourne UNIQUEMENT le HTML final complet. Aucune explication.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Tu es Nova, expert en copywriting de pages de vente et UX produit SaaS. Tu appliques strictement la méthode PAS (Problem-Agitate-Solution) et utilises UNIQUEMENT les données fournies sans les modifier."
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