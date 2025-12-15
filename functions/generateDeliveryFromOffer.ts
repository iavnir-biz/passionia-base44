import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';
import { getSessionContext } from './getSessionContext.js';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const BASE_SYSTEM_PROMPT = `Tu es un expert en marketing et lancement de formations en ligne.

RÈGLE CRITIQUE : Tu dois baser tes choix sur onboarding_summary ET finalized_offer en priorité.
Si une info manque, pose l'hypothèse la plus raisonnable MAIS reste cohérent avec le contexte fourni.

IMPORTANT : L'utilisateur veut ENSEIGNER sa compétence (formations, cours), PAS vendre des services.
Tous les contenus doivent parler de "formation", "programme", "cours", "élèves", "apprenants".`;

async function generateEmails(ctx, summary, offer, openai) {
  const systemPrompt = `Tu es expert en email marketing pour vendre un produit d'enseignement.
Tu écris en français, tutoiement, ton direct et humain.
Tu suis la cohérence stricte: onboarding_summary + finalized_offer.

Interdiction:
- inventer des résultats irréalistes
- inventer des témoignages
- contredire l'offre

Format EXACT:
Email 1: Sujet: ...
Corps: ...

Email 2: Sujet: ...
Corps: ...

Email 3: Sujet: ...
Corps: ...

Pas de markdown. Beaucoup de sauts de ligne.
CTA standard: "Réponds INFO" ou "Envoie INFO".`;

  const mainProduct = offer.mainProduct || offer.product_principal || {};
  
  const prompt = `name: ${ctx.name}
skill: ${ctx.skill}
onboarding_summary: ${JSON.stringify(summary, null, 2)}
finalized_offer: ${JSON.stringify(offer, null, 2)}

Produit principal à vendre:
${JSON.stringify(mainProduct, null, 2)}

Écris 3 emails:
- Email 1: problème + prise de conscience
- Email 2: solution + quick win + preuve perso (si proof_or_story)
- Email 3: urgence simple + CTA INFO`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ],
    temperature: 0.5,
    max_tokens: 2500,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "email_sequence",
        strict: true,
        schema: {
          type: "object",
          properties: {
            emails: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "number" },
                  subject: { type: "string" },
                  body: { type: "string" }
                },
                required: ["day", "subject", "body"],
                additionalProperties: false
              },
              minItems: 3,
              maxItems: 3
            }
          },
          required: ["emails"],
          additionalProperties: false
        }
      }
    }
  });

  return JSON.parse(completion.choices[0].message.content);
}

async function generateSalesPage(ctx, summary, offer, openai) {
  const systemPrompt = `Tu es copywriter. Objectif: page de vente d'un produit d'enseignement.
Tu suis PAS (Problem-Agitate-Solution) + sections claires.
Pas de markdown. Sections séparées par des sauts de ligne.
Interdiction d'inventer des stats "source X" si non certain.`;

  const mainProduct = offer.mainProduct || offer.product_principal || {};
  
  const prompt = `name: ${ctx.name}
skill: ${ctx.skill}
onboarding_summary: ${JSON.stringify(summary, null, 2)}
finalized_offer: ${JSON.stringify(offer, null, 2)}
produit: ${JSON.stringify(mainProduct, null, 2)}

Génère une page de vente complète avec:
- Promesse claire
- À qui c'est destiné / pas destiné
- Le problème + agitation
- Le mécanisme/méthode (method_angle)
- Ce que contient le produit (ultra précis)
- Résultat attendu (outcome)
- FAQ (5 questions)
- CTA final: "Envoie INFO"`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ],
    temperature: 0.5,
    max_tokens: 3000
  });

  return completion.choices[0].message.content;
}

async function generateActionPlan(ctx, summary, offer, openai) {
  const systemPrompt = `Tu es coach business. Tu produis un plan d'action simple sur 7 jours.
Tout doit être cohérent avec finalized_offer.
Pas de jargon, pas de markdown.
Chaque jour = 3 actions maximum, très concrètes.`;

  const prompt = `name: ${ctx.name}
onboarding_summary: ${JSON.stringify(summary, null, 2)}
finalized_offer: ${JSON.stringify(offer, null, 2)}

Crée un plan d'action 7 jours:
Jour 1 à Jour 7
Chaque jour:
Étape 1:
Étape 2:
Étape 3:`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ],
    temperature: 0.4,
    max_tokens: 2000,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "action_plan",
        strict: true,
        schema: {
          type: "object",
          properties: {
            days: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  dayNumber: { type: "number" },
                  step1: { type: "string" },
                  step2: { type: "string" },
                  step3: { type: "string" }
                },
                required: ["dayNumber", "step1", "step2", "step3"],
                additionalProperties: false
              },
              minItems: 7,
              maxItems: 7
            }
          },
          required: ["days"],
          additionalProperties: false
        }
      }
    }
  });

  return JSON.parse(completion.choices[0].message.content);
}

async function generateIdeas(ctx, summary, offer, openai) {
  const systemPrompt = `Tu es spécialiste de productisation.
Tu proposes 10 idées de produits d'enseignement cohérentes avec l'élève cible.
Titres courts, bénéfice clair, format précis.`;

  const prompt = `skill: ${ctx.skill}
onboarding_summary: ${JSON.stringify(summary, null, 2)}

Donne 10 idées structurées:
- Titre
- Format (PDF / mini-formation 3-5 vidéos / template / etc.)
- Quick win promis`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ],
    temperature: 0.6,
    max_tokens: 2000,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "product_ideas",
        strict: true,
        schema: {
          type: "object",
          properties: {
            ideas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  format: { type: "string" },
                  quickWin: { type: "string" }
                },
                required: ["title", "format", "quickWin"],
                additionalProperties: false
              },
              minItems: 10,
              maxItems: 10
            }
          },
          required: ["ideas"],
          additionalProperties: false
        }
      }
    }
  });

  return JSON.parse(completion.choices[0].message.content);
}

async function generateFirstSaleStrategy(ctx, summary, offer, openai) {
  const systemPrompt = `Tu es expert acquisition/closing.
Tu livres un plan "première vente en 24h".
Tout doit être copiable-collable. Français. Tutoiement.
Pas de markdown. Beaucoup de sauts de ligne.
CTA standard: "Envoie INFO".
Pas de promesses irréalistes.`;

  const mainProduct = offer.mainProduct || offer.product_principal || {};

  const prompt = `name: ${ctx.name}
skill: ${ctx.skill}
onboarding_summary: ${JSON.stringify(summary, null, 2)}
produit: ${JSON.stringify(mainProduct, null, 2)}

Génère exactement ces sections:
SECTION 1 : OÙ TROUVER TES CLIENTS MAINTENANT
SECTION 2 : MESSAGES DM PRÊTS À ENVOYER
SECTION 3 : STORIES À PUBLIER
SECTION 4 : SCRIPT REEL VIRAL
SECTION 5 : CARROUSEL 7 SLIDES
SECTION 6 : STRUCTURE DU PETIT PRODUIT`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ],
    temperature: 0.5,
    max_tokens: 2000
  });

  return completion.choices[0].message.content;
}

Deno.serve(async (req) => {
  try {
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }

    const ctx = await getSessionContext(req, sessionId);
    const summary = ctx.onboarding_summary;
    
    // Retrieve finalized offer
    const offer = ctx.session.finalized_offer;
    if (!offer) {
      return Response.json({ 
        error: 'No finalized offer found. User must select offer choices first.' 
      }, { status: 400 });
    }

    // Generate all content in parallel
    const [emails, salesPage, actionPlan, ideas, firstSaleStrategy] = await Promise.all([
      generateEmails(ctx, summary, offer, openai),
      generateSalesPage(ctx, summary, offer, openai),
      generateActionPlan(ctx, summary, offer, openai),
      generateIdeas(ctx, summary, offer, openai),
      generateFirstSaleStrategy(ctx, summary, offer, openai)
    ]);

    const generatedContent = {
      emails: JSON.stringify(emails),
      salesPage,
      actionPlan: JSON.stringify(actionPlan),
      ideas: JSON.stringify(ideas),
      firstSaleStrategy,
      generatedAt: new Date().toISOString()
    };

    // Save to Session
    const base44 = createClientFromRequest(req);
    await base44.asServiceRole.entities.Session.update(sessionId, {
      generatedContent
    });

    // Debug info
    const summaryKeysFilled = Object.keys(summary).filter(k => summary[k] && summary[k] !== '');

    return Response.json({
      success: true,
      data: generatedContent,
      debug: {
        usedSummary: true,
        summaryKeysFilled,
        usedOffer: true,
        skill: ctx.skill
      }
    });

  } catch (error) {
    console.error('Error in generateDeliveryFromOffer:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});