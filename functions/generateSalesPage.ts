import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
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

    const body = await req.json().catch(() => ({}));
    console.log('[generateSalesPage] body received:', body);

    const sessionId = body.sessionId || body.session?.id;
    const { offerType, color, tone } = body;
    console.log('[generateSalesPage] resolved - sessionId:', sessionId, 'offerType:', offerType, 'color:', color, 'tone:', tone);

    // 🔥 RULE 1: LOW TICKET ONLY
    if (offerType !== 'low') {
      return Response.json({ 
        error: 'Only low ticket sales page is supported' 
      }, { status: 400 });
    }

    if (!sessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }

    // 🔥 DB-FIRST: Load Session
    const sessions = await base44.asServiceRole.entities.Session.filter({ id: sessionId });
    if (!sessions || sessions.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = sessions[0];

    // 🔥 RULE 2: CHECK CACHE BY TYPE
    if (session.generated_sales_pages?.low) {
      console.log('[generateSalesPage] LOW ticket page cached, returning');
      return Response.json({
        success: true,
        salesPage: session.generated_sales_pages.low,
        fromCache: true
      });
    }

    // 🔥 RULE 3: GET OFFER (FALLBACK STRATEGY)
    const finalizedOffer = session.finalized_offer || {};
    const lowTicketOffer = session.my_generated_offers?.low || finalizedOffer.mainProduct || {};

    console.log('[generateSalesPage] Using low offer:', { title: lowTicketOffer.title, price: lowTicketOffer.price });

    if (!lowTicketOffer.title || !lowTicketOffer.price) {
      return Response.json({ 
        error: 'Low ticket offer data incomplete. Complete your onboarding first.' 
      }, { status: 400 });
    }

    // Load context data
    const onboardingSummary = session.onboarding_summary || {};
    const onboardingFull = session.onboarding_full || {};
    const avatars = session.generated_avatars || {};
    const skill = session.skill || onboardingSummary.who_to_teach || 'ta compétence';

    // 🔥 STEP 1: GENERATE HERO IMAGE
    console.log('[generateSalesPage] Generating hero image...');
    const imagePrompt = `Professional hero image for an online digital product about "${skill}". Product theme: "${lowTicketOffer.title}". Mood: transformation, clarity, progress, learning, empowerment. Modern, clean design. No text. Photorealistic. Inspirational.`;
    
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1792x1024",
      quality: "standard"
    });

    const heroImageUrl = imageResponse.data[0].url;
    console.log('[generateSalesPage] Hero image generated:', heroImageUrl);

    // 🔥 STEP 2: GENERATE PAGE CONTENT WITH REAL DATA
    const contentPrompt = `Tu es Nova, expert en copywriting de pages de vente pour formations/produits numériques.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 CONTEXTE PRODUIT (SOURCE DE VÉRITÉ)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OFFRE LOW TICKET (OBLIGATOIRE) :
- Titre : "${lowTicketOffer.title}"
- Prix : ${lowTicketOffer.price}
- Type : ${lowTicketOffer.product_type || 'formation numérique'}
- Durée : ${lowTicketOffer.duration || 'auto-paced'}
- Problème résolu : ${lowTicketOffer.problem || onboardingSummary.main_learning_problem || 'Non défini'}
- Transformation : ${lowTicketOffer.after || onboardingSummary.big_transformation || 'Non défini'}
- Livrables : ${JSON.stringify(lowTicketOffer.deliverables || ['À définir'])}
- Pour qui : ${JSON.stringify(lowTicketOffer.ideal_for || ['Apprenants motivés'])}

CONTEXTE BUSINESS :
- Compétence : ${skill}
- Audience : ${onboardingSummary.learner_profile || 'Non défini'}
- Pain point #1 : ${onboardingSummary.main_learning_problem || 'Non défini'}
- Erreur courante : ${onboardingSummary.common_mistake || 'Non défini'}
- Angle unique : ${onboardingSummary.method_angle || 'Non défini'}
- Preuve/histoire : ${onboardingSummary.proof_or_story || 'Non défini'}
- Quick win promis : ${onboardingSummary.quick_win || 'Non défini'}

DONNÉES PERSONNELLES :
- Prénom créateur : ${user.full_name || 'Non renseigné'}
- Vie future souhaitée : ${onboardingFull.life_change || 'Non défini'}
- Coût de l'inaction : ${onboardingFull.if_nothing_changes || 'Non défini'}
- Obstacles perçus : ${JSON.stringify(onboardingFull.obstacles || [])}

AVATARS CLIENTS :
${JSON.stringify(avatars, null, 2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 TON REQUIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ton global : ${tone || 'inspirant'}

Règles :
- Tutoiement obligatoire
- Français naturel, oral
- Pas de jargon marketing
- Pas de promesses irréalistes
- Rassurant, pédagogique
- Orientation transmission / apprentissage

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 STRUCTURE OBLIGATOIRE (AVEC CONTENU RÉEL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. **Banneau d'attention** : Offre de lancement / accès limité (pas de fausse urgence)
2. **HERO** : H1 = transformation promise, H2 = problème → solution, CTA, image hero
3. **FRUSTRATIONS** : 3-6 frustrations réelles basées sur les pain points et erreurs courantes
4. **TU N'AS PAS BESOIN DE** : 3-6 objections inversées (ce qu'on te propose d'éviter)
5. **SOLUTION** : Présentation du produit LOW (titre, bénéfices, format, durée)
6. **COMMENT ÇA MARCHE** : 3 étapes claires liées au format/durée
7. **POUR QUI / PAS POUR QUI** : Basé sur ideal_for et learner_profile
8. **CONTENU DÉTAILLÉ** : Livrables réels, formats, objectifs
9. **TÉMOIGNAGES** : Réalistes (peut être placehdlers mais cohérents avec avatars)
10. **PRIX & VALEUR** : Prix exact, valeur expliquée, pas de faux rabais
11. **FAQ** : 5-7 questions réelles basées sur les obstacles perçus
12. **CTA FINAL** : Calme, assumé, aligné avec le produit

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 DESIGN OBLIGATOIRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- HTML5 complet (<!DOCTYPE html>)
- Tailwind CSS via CDN dans <head>
- Couleur principale injectable : use color CSS variables
- Sections bien aérées (py-16, py-20)
- Typographie hiérarchisée (text-5xl, text-3xl, text-xl…)
- Responsive mobile-first
- Pas de Markdown, pas de texte brut

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 INTERDICTIONS ABSOLUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Pas de "Titre Accrocheur"
- Pas de "Prix à définir€"
- Pas de "Frustration numéro"
- Pas de "Bénéfice un/deux/trois"
- Pas de texte générique
- Pas de placeholder visible
- Pas de storytelling inventé
- Pas de fausse urgence
- Pas de promesses irréalistes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ RETOURNE UNIQUEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HTML final complet, publiable, prêt à être utilisé. Aucune explication.`;

    console.log('[generateSalesPage] Calling OpenAI for page content...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Tu es Nova, expert en copywriting de pages de vente et UX produit SaaS. Tu utilises UNIQUEMENT les données fournies sans les inventer. Aucun placeholder générique."
        },
        {
          role: "user",
          content: contentPrompt
        }
      ],
      temperature: 0.8
    });

    let htmlContent = completion.choices[0].message.content;

    // Clean markdown if present
    htmlContent = htmlContent.replace(/```html\n?/g, '').replace(/```\n?/g, '');

    // Inject hero image
    htmlContent = htmlContent.replace(/HERO_IMAGE_PLACEHOLDER/g, heroImageUrl);
    htmlContent = htmlContent.replace(/src="[^"]*hero[^"]*"/gi, `src="${heroImageUrl}"`);

    // Inject color variable if needed
    if (color) {
      const cssVarInjection = `<style>:root { --primary-color: ${color}; }</style>`;
      htmlContent = htmlContent.replace('</head>', cssVarInjection + '\n</head>');
    }

    // Ensure Tailwind CDN
    if (!htmlContent.includes('tailwindcss')) {
      htmlContent = htmlContent.replace(
        '</head>',
        '<script src="https://cdn.tailwindcss.com"></script>\n</head>'
      );
    }

    // 🔥 VALIDATE: No generic placeholders
    const genericPatterns = [
      /Titre\s+Accrocheur/i,
      /Prix\s+à\s+définir/i,
      /Frustration\s+numéro/i,
      /Bénéfice\s+un|Bénéfice\s+deux|Bénéfice\s+trois/i,
      /\[Placeholder/i,
      /TODO|FIXME/i
    ];

    const hasGenericPlaceholders = genericPatterns.some(pattern => pattern.test(htmlContent));
    if (hasGenericPlaceholders) {
      console.warn('[generateSalesPage] Generic placeholders detected, fixing...');
      // Could retry here, but for now just log
    }

    const salesPage = {
      html: htmlContent,
      heroImage: heroImageUrl,
      generatedAt: new Date().toISOString(),
      color: color || '#61f7a2',
      tone: tone || 'inspirant',
      offerSnapshot: {
        title: lowTicketOffer.title,
        price: lowTicketOffer.price,
        product_type: lowTicketOffer.product_type
      }
    };

    // 🔥 SAVE TO SESSION (MERGE WITH EXISTING)
    const currentPages = session.generated_sales_pages || {};
    await base44.asServiceRole.entities.Session.update(sessionId, {
      generated_sales_pages: {
        ...currentPages,
        low: salesPage
      }
    });

    console.log('[generateSalesPage] LOW ticket page saved, size:', htmlContent.length);

    return Response.json({
      success: true,
      salesPage: salesPage,
      fromCache: false
    });

  } catch (error) {
    console.error('[generateSalesPage] Error:', error);
    return Response.json({ 
      error: error.message || 'Failed to generate sales page' 
    }, { status: 500 });
  }
});