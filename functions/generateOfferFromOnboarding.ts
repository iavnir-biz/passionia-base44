import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';
import { getSessionContext } from './getSessionContext.js';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es un stratège de classe mondiale en création d'offres pour produits d'enseignement (formations, coaching, ebooks).
Tu ne vends JAMAIS des services "done-for-you" comme activité principale : tout doit être pensé pour TRANSMETTRE un savoir-faire.

Règle absolue : tu utilises onboarding_summary comme source principale de vérité.
Tu peux utiliser onboarding_history uniquement pour ajouter du contexte ou des exemples, sans contredire le summary.

Objectif : générer une "Full Stack Offer" cohérente, spécifique, actionnable.

Contraintes:
1) Tout en français, naturel, sans jargon.
2) Livrables ULTRA précis (nb de vidéos, durée des lives, nombre de sessions, format exact).
3) Respect strict des prix autorisés:
   - mainProduct: 17€/27€/37€/47€
   - orderBump: 14€/17€/27€/37€
   - upsell1: 67€/97€/197€/297€
   - upsell3: 1000€/2000€/3000€/5000€
4) Pas de downsell.
5) "Stats" : interdiction d'inventer une statistique "source X dit Y" si tu n'es pas certain.
   Si tu n'as pas une stat vérifiable, écris une preuve de demande sous forme "signal marché" (ex: volume de recherches, forums, tendances, audiences)
   et termine par "(à vérifier)".
6) Les titres doivent être "marketing mais authentiques", et refléter le vocabulaire de la cible dans le summary.

Sortie: JSON STRICT selon le schéma fourni, rien d'autre.`;

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

    // Check if finalized_offer is missing when it should exist
    if (ctx.session.is_onboarding_done && !ctx.session.finalized_offer) {
      return Response.json({ 
        error: 'Session marquée comme terminée mais finalized_offer absent. L\'utilisateur doit finaliser son offre.' 
      }, { status: 400 });
    }

    const userPrompt = `Données utilisateur:
- name: ${ctx.name}
- skill: ${ctx.skill || summary.who_to_teach || 'non renseignée'}

onboarding_summary (source principale):
${JSON.stringify(summary, null, 2)}

Préférences de format:
${summary.format_preferences?.join(', ') || 'non renseignées'}

Tâche:
1) Génère 3 idées "mainOfferIdeas" basées sur P.S.S.O:
- Problem: douleur d'apprentissage précise de l'élève (basé sur main_learning_problem)
- Stats: soit une statistique prudente, soit un "signal marché (à vérifier)"
- Solution: transformation d'apprentissage (basé sur quick_win + big_transformation)
- Title: titre percutant qui parle à ${summary.who_to_teach || summary.learner_profile || 'la cible'}

2) Génère 2 choix pour chaque niveau de funnel:
   
   **mainProductChoices** (Produit principal - 17€/27€/37€/47€):
   - title : Nom accrocheur du produit pédagogique
   - price : Exactement "17€", "27€", "37€" ou "47€"
   - productType : Type précis (ex: "Formation vidéo 5 modules", "Programme 21 jours", "Bootcamp intensif 3 semaines")
   - description : Livrables ULTRA précis (ex: "8 vidéos HD de 12-15min chacune + 4 fiches PDF téléchargeables + 1 workbook 30 pages + accès groupe privé 30j")
   - outcome : Résultat concret aligné avec quick_win ou big_transformation (commence par "Tu seras capable de...")

   **orderBump1Choices** (Bonus additionnel - 14€/17€/27€/37€):
   - title : Nom du bonus complémentaire
   - price : Exactement "14€", "17€", "27€" ou "37€"
   - productType : Type (ex: "Kit de 10 templates", "Boîte à outils PDF", "Guide pratique 25 pages")
   - description : Livrables précis avec quantités
   - outcome : Bénéfice immédiat qui accélère le quick_win

   **upsell1Choices** (Offre supérieure - 67€/97€/197€/297€):
   - title : Nom du programme avancé
   - price : Exactement "67€", "97€", "197€" ou "297€"
   - productType : Type (ex: "Masterclass 6 semaines", "Coaching de groupe 8 sessions", "Programme Premium")
   - description : Livrables détaillés (ex: "Tout du produit principal + 6 lives Zoom de 90min + 12 modules vidéo supplémentaires + support prioritaire")
   - outcome : Transformation plus profonde alignée avec big_transformation

   **upsell3Choices** (Offre Premium/VIP - 1000€/2000€/3000€/5000€):
   - title : Nom de l'accompagnement exclusif
   - price : Exactement "1000€", "2000€", "3000€" ou "5000€"
   - productType : Type (ex: "Accompagnement 1-to-1 sur 3 mois", "Mentorat VIP 12 semaines", "Programme All-Inclusive")
   - description : Livrables ultra-complets (ex: "Tout des niveaux précédents + 12 sessions coaching individuelles de 60min + revue personnalisée hebdomadaire + accès direct WhatsApp + garantie résultats")
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
          name: "offer_generation",
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
                    problem: { type: "string" },
                    stats: { type: "string" },
                    solution: { type: "string" }
                  },
                  required: ["title", "problem", "stats", "solution"],
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
                        title: { type: "string" },
                        price: { type: "string" },
                        productType: { type: "string" },
                        description: { type: "string" },
                        outcome: { type: "string" }
                      },
                      required: ["title", "price", "productType", "description", "outcome"],
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
                        title: { type: "string" },
                        price: { type: "string" },
                        productType: { type: "string" },
                        description: { type: "string" },
                        outcome: { type: "string" }
                      },
                      required: ["title", "price", "productType", "description", "outcome"],
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
                        title: { type: "string" },
                        price: { type: "string" },
                        productType: { type: "string" },
                        description: { type: "string" },
                        outcome: { type: "string" }
                      },
                      required: ["title", "price", "productType", "description", "outcome"],
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
                        title: { type: "string" },
                        price: { type: "string" },
                        productType: { type: "string" },
                        description: { type: "string" },
                        outcome: { type: "string" }
                      },
                      required: ["title", "price", "productType", "description", "outcome"],
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
            await base44.asServiceRole.entities.Session.update(sessionId, {
            offer_draft: offer,
            skill: ctx.skill || summary.who_to_teach || '',
            updated_at: new Date().toISOString()
            });

            // Debug info
            const summaryKeysFilled = Object.keys(summary).filter(k => summary[k] && summary[k] !== '');

            return Response.json({
            success: true,
            offer,
            debug: {
            usedSummary: true,
            summaryKeysFilled,
            skill: ctx.skill,
            retries: retryCount
            }
            });

  } catch (error) {
    console.error('Error in generateOfferFromOnboarding:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});