import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai';
import { getSessionContext } from './getSessionContext.js';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es l'OfferArchitect — l'IA qui conçoit l'offre pédagogique idéale pour un formateur débutant ou intermédiaire.

RÈGLES CRITIQUES :
1. Tu utilises EN PRIORITÉ les données de onboarding_summary (contexte ultra-riche).
2. Si onboarding_summary est incomplet, tu complètes avec onboarding_history (brut).
3. Toute proposition doit être 100 % enseignable (pas de prestation de service).
4. Chaque produit est livrable immédiatement après achat : contenu éducatif pur (vidéos, PDF, templates, etc.).
5. Prix EXACTEMENT ceux indiqués, avec le symbole €.

LOGIQUE :
- who_to_teach → cible précise
- main_learning_problem → le problème N°1
- quick_win → résultat rapide (< 7 jours)
- big_transformation → transformation finale
- method_angle → ta méthode unique
- common_mistake → l'erreur typique à éviter

Tu ne proposes JAMAIS : coaching 1-1 (sauf si packagé comme formation), services freelance, prestations à la demande.
Tu proposes TOUJOURS : formations vidéo, ebooks, templates, checklist, replays de lives, communauté (Telegram/Discord/WhatsApp), masterclass, guides PDF, scripts, swipe files.

Tes prix sont STRICTEMENT issus de cette liste :
- Produit principal : 17€, 27€, 37€, 47€
- Order Bump : 14€, 17€, 27€, 37€
- Upsell 1 : 67€, 97€, 197€, 297€
- Upsell 3 (Premium) : 1000€, 2000€, 3000€, 5000€`;

const ALLOWED_PRICES = {
  mainProduct: ['17€', '27€', '37€', '47€'],
  orderBump: ['14€', '17€', '27€', '37€'],
  upsell1: ['67€', '97€', '197€', '297€'],
  upsell3: ['1000€', '2000€', '3000€', '5000€']
};

function validateOffer(offer) {
  const errors = [];

  // Validate structure
  if (!offer.mainOfferIdeas || !Array.isArray(offer.mainOfferIdeas)) {
    errors.push('mainOfferIdeas manquant ou invalide');
  }
  if (!offer.offerChoices) {
    errors.push('offerChoices manquant');
  }

  if (offer.offerChoices) {
    // Validate each choice has exactly 2 items
    const choices = ['mainProductChoices', 'orderBump1Choices', 'upsell1Choices', 'upsell3Choices'];
    for (const choice of choices) {
      if (!Array.isArray(offer.offerChoices[choice]) || offer.offerChoices[choice].length !== 2) {
        errors.push(`${choice} doit contenir exactement 2 items`);
      }
    }

    // Validate prices
    if (offer.offerChoices.mainProductChoices) {
      for (const item of offer.offerChoices.mainProductChoices) {
        if (!ALLOWED_PRICES.mainProduct.includes(item.price)) {
          errors.push(`Prix mainProduct invalide: ${item.price}. Autorisés: ${ALLOWED_PRICES.mainProduct.join(', ')}`);
        }
      }
    }
    if (offer.offerChoices.orderBump1Choices) {
      for (const item of offer.offerChoices.orderBump1Choices) {
        if (!ALLOWED_PRICES.orderBump.includes(item.price)) {
          errors.push(`Prix orderBump invalide: ${item.price}. Autorisés: ${ALLOWED_PRICES.orderBump.join(', ')}`);
        }
      }
    }
    if (offer.offerChoices.upsell1Choices) {
      for (const item of offer.offerChoices.upsell1Choices) {
        if (!ALLOWED_PRICES.upsell1.includes(item.price)) {
          errors.push(`Prix upsell1 invalide: ${item.price}. Autorisés: ${ALLOWED_PRICES.upsell1.join(', ')}`);
        }
      }
    }
    if (offer.offerChoices.upsell3Choices) {
      for (const item of offer.offerChoices.upsell3Choices) {
        if (!ALLOWED_PRICES.upsell3.includes(item.price)) {
          errors.push(`Prix upsell3 invalide: ${item.price}. Autorisés: ${ALLOWED_PRICES.upsell3.join(', ')}`);
        }
      }
    }
  }

  return errors;
}

Deno.serve(async (req) => {
  try {
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }

    const ctx = await getSessionContext(req, sessionId);
    const summary = ctx.onboarding_summary;

    // Check minimum conditions
    if (!ctx.session.is_onboarding_done) {
      return Response.json({ 
        error: 'Onboarding non terminé. Terminer l\'onboarding avant de générer l\'offre.' 
      }, { status: 400 });
    }

    if (!summary || Object.keys(summary).length === 0) {
      return Response.json({ 
        error: 'onboarding_summary vide. Impossible de générer une offre.' 
      }, { status: 400 });
    }

    const userPrompt = `Données utilisateur:

Compétence : ${ctx.skill || ctx.session.skill || 'non spécifié'}
Audience (élève cible) : ${summary.who_to_teach || 'non spécifié'}
Profil apprenant : ${summary.learner_profile || 'non spécifié'}
Problème principal : ${summary.main_learning_problem || 'non spécifié'}
Quick win : ${summary.quick_win || 'non spécifié'}
Grande transformation : ${summary.big_transformation || 'non spécifié'}
Méthode/angle : ${summary.method_angle || 'non spécifié'}
Erreur courante : ${summary.common_mistake || 'non spécifié'}
Preuve/histoire : ${summary.proof_or_story || 'non spécifié'}
Formats préférés : ${(summary.format_preferences || []).join(', ') || 'non spécifié'}

Génère une offre complète structurée en 4 niveaux :

1. mainOfferIdeas : 3 idées de produits principaux alignés avec quick_win (17-47€)
2. offerChoices.mainProductChoices : 2 produits principaux concrets
3. offerChoices.orderBump1Choices : 2 order bumps (compléments immédiats, 14-37€)
4. offerChoices.upsell1Choices : 2 upsells intermédiaires (67-297€)
5. offerChoices.upsell3Choices : 2 upsells premium (1000-5000€)

Pour chaque produit dans offerChoices.* :
- id : identifiant unique (ex: main_video_course)
- title : Nom du produit (max 60 caractères)
- badge : Label court (ex: "Débutant", "Avancé", "Masterclass")
- price : EXACTEMENT un des prix autorisés avec le symbole € (ex: "27€")
- deliverables : Liste ultra-précise des livrables (ex: ["5 vidéos HD (15 min chacune)", "1 checklist PDF (3 pages)", "Accès Telegram privé 30j"])
- outcome : Transformation garantie et mesurable, liée à big_transformation

Important:
- Tout doit être 100% aligné avec who_to_teach + main_learning_problem + quick_win + big_transformation du summary.
- Ne propose rien qui ne peut pas être enseigné (pas de prestation de service).
- Livrables ULTRA précis: nombre exact de vidéos/lives/PDFs/sessions, durées exactes, formats exacts.
- Prix EXACTEMENT ceux indiqués (avec le symbole €).`;

    let offer = null;
    let retryCount = 0;
    const maxRetries = 1;

    while (retryCount <= maxRetries) {
      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ];

      // Add retry message if this is a retry
      if (retryCount > 0) {
        messages.push({
          role: "assistant",
          content: "Je comprends, je vais corriger."
        });
        messages.push({
          role: "user",
          content: "Ton JSON était invalide, renvoie strictement le schéma avec les contraintes exactes."
        });
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.4,
        max_tokens: 3000,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "offer_structure",
            strict: true,
            schema: {
              type: "object",
              properties: {
                mainOfferIdeas: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" }
                    },
                    required: ["title", "description"],
                    additionalProperties: false
                  },
                  minItems: 3,
                  maxItems: 3
                },
                offerChoices: {
                  type: "object",
                  properties: {
                    mainProductChoices: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          title: { type: "string" },
                          badge: { type: "string" },
                          price: { 
                            type: "string",
                            enum: ["17€", "27€", "37€", "47€"]
                          },
                          deliverables: {
                            type: "array",
                            items: { type: "string" }
                          },
                          outcome: { type: "string" }
                        },
                        required: ["id", "title", "badge", "price", "deliverables", "outcome"],
                        additionalProperties: false
                      },
                      minItems: 2,
                      maxItems: 2
                    },
                    orderBump1Choices: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          title: { type: "string" },
                          badge: { type: "string" },
                          price: { 
                            type: "string",
                            enum: ["14€", "17€", "27€", "37€"]
                          },
                          deliverables: {
                            type: "array",
                            items: { type: "string" }
                          },
                          outcome: { type: "string" }
                        },
                        required: ["id", "title", "badge", "price", "deliverables", "outcome"],
                        additionalProperties: false
                      },
                      minItems: 2,
                      maxItems: 2
                    },
                    upsell1Choices: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          title: { type: "string" },
                          badge: { type: "string" },
                          price: { 
                            type: "string",
                            enum: ["67€", "97€", "197€", "297€"]
                          },
                          deliverables: {
                            type: "array",
                            items: { type: "string" }
                          },
                          outcome: { type: "string" }
                        },
                        required: ["id", "title", "badge", "price", "deliverables", "outcome"],
                        additionalProperties: false
                      },
                      minItems: 2,
                      maxItems: 2
                    },
                    upsell3Choices: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          title: { type: "string" },
                          badge: { type: "string" },
                          price: { 
                            type: "string",
                            enum: ["1000€", "2000€", "3000€", "5000€"]
                          },
                          deliverables: {
                            type: "array",
                            items: { type: "string" }
                          },
                          outcome: { type: "string" }
                        },
                        required: ["id", "title", "badge", "price", "deliverables", "outcome"],
                        additionalProperties: false
                      },
                      minItems: 2,
                      maxItems: 2
                    }
                  },
                  required: ["mainProductChoices", "orderBump1Choices", "upsell1Choices", "upsell3Choices"],
                  additionalProperties: false
                }
              },
              required: ["mainOfferIdeas", "offerChoices"],
              additionalProperties: false
            }
          }
        }
      });

      // Try to parse and validate
      try {
        offer = JSON.parse(completion.choices[0].message.content);
        const validationErrors = validateOffer(offer);

        if (validationErrors.length === 0) {
          // Validation passed, break the loop
          break;
        } else {
          // Validation failed
          if (retryCount < maxRetries) {
            console.log(`Validation failed (attempt ${retryCount + 1}):`, validationErrors);
            retryCount++;
          } else {
            // Max retries reached, return error
            return Response.json({
              error: 'Validation failed after retry',
              validationErrors
            }, { status: 500 });
          }
        }
      } catch (parseError) {
        // JSON parse failed
        if (retryCount < maxRetries) {
          console.log(`JSON parse failed (attempt ${retryCount + 1}):`, parseError.message);
          retryCount++;
        } else {
          return Response.json({
            error: 'Invalid JSON after retry',
            details: parseError.message
          }, { status: 500 });
        }
      }
    }

    // Save to Session
    const base44 = createClientFromRequest(req);
    
    const summaryKeysFilled = Object.keys(summary).filter(k => summary[k] && summary[k] !== '');
    const skillUsed = ctx.skill || ctx.session.skill || '';
    
    await base44.asServiceRole.entities.Session.update(sessionId, {
      offer_draft: offer,
      skill: skillUsed,
      offer_generation_debug: {
        summaryKeysFilled,
        skillUsed,
        retries: retryCount,
        model: "gpt-4o-mini",
        generatedAt: new Date().toISOString()
      }
    });

    return Response.json({
      success: true,
      offer,
      debug: {
        summaryKeysFilled,
        skillUsed,
        retries: retryCount,
        model: "gpt-4o-mini"
      }
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});