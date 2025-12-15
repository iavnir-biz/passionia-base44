import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';
import { getSessionContext } from './getSessionContext.js';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es un expert en création d'offres pour l'enseignement en ligne.

RÈGLE CRITIQUE : Tu dois baser tes choix sur onboarding_summary en priorité.
Si une info manque, pose l'hypothèse la plus raisonnable MAIS reste cohérent avec le summary.
Tu n'as pas le droit d'ignorer le summary.

IMPORTANT : L'utilisateur veut ENSEIGNER sa compétence (formations, cours, programmes), PAS vendre des services de prestation.

Tous les produits doivent être :
- Des livrables pédagogiques concrets (vidéos, modules, exercices, ressources)
- Avec durées/quantités précises (ex: "10 vidéos de 15min", "guide PDF 50 pages")
- Orientés transformation de l'apprenant
- Prix cohérents avec le marché e-learning francophone`;

Deno.serve(async (req) => {
  try {
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }

    const ctx = await getSessionContext(req, sessionId);
    const summary = ctx.onboarding_summary;

    const userPrompt = `Contexte utilisateur :
- Prénom : ${ctx.name}
- Compétence à enseigner : ${ctx.skill || summary.who_to_teach || 'non renseignée'}
- Public cible (élèves) : ${summary.who_to_teach || summary.learner_profile || 'non renseigné'}
- Problème d'apprentissage principal : ${summary.main_learning_problem || 'non renseigné'}
- Quick win promis : ${summary.quick_win || 'non renseigné'}
- Transformation finale : ${summary.big_transformation || 'non renseignée'}
- Méthode/approche unique : ${summary.method_angle || 'non renseignée'}
- Erreur courante à éviter : ${summary.common_mistake || 'non renseignée'}
- Histoire/preuve : ${summary.proof_or_story || 'non renseignée'}
- Préférences de formats : ${summary.format_preferences?.join(', ') || 'non renseignées'}

Génère une offre complète d'enseignement avec :

1. **mainOfferIdeas** : 3 angles d'offre différents, chacun avec :
   - title : Titre accrocheur de l'offre globale
   - problem : Le problème d'apprentissage précis que cette offre résout
   - stats : Une statistique crédible ou insight de marché
   - solution : Comment cette offre résout le problème (2-3 phrases)

2. **offerChoices** : Pour chaque niveau de produit, propose 2 options :
   
   **mainProductChoices** (Produit principal) :
   - title : Nom du produit pédagogique
   - price : Un prix parmi "17€", "27€", "37€", "47€"
   - productType : Type exact (ex: "Formation vidéo", "Programme 30 jours", "Bootcamp intensif")
   - description : Détails livrables (ex: "12 vidéos HD (8-12min), 4 fiches pratiques PDF, 1 plan d'action personnalisable")
   - outcome : Résultat concret pour l'apprenant (commence par "Tu seras capable de...")

   **orderBump1Choices** (Bonus additionnel) :
   - title : Nom du bonus
   - price : Un prix parmi "14€", "17€", "27€", "37€"
   - productType : Type (ex: "Kit de ressources", "Boîte à outils", "Guide pratique")
   - description : Détails livrables
   - outcome : Bénéfice immédiat

   **upsell1Choices** (Offre supérieure) :
   - title : Nom du programme avancé
   - price : Un prix parmi "67€", "97€", "197€", "297€"
   - productType : Type (ex: "Masterclass", "Coaching de groupe", "Programme Premium")
   - description : Détails livrables (plus complet que le produit principal)
   - outcome : Transformation plus profonde

   **upsell3Choices** (Offre Premium/VIP) :
   - title : Nom de l'accompagnement haut de gamme
   - price : Un prix parmi "1000€", "2000€", "3000€", "5000€"
   - productType : Type (ex: "Accompagnement 1-to-1", "Mentorat VIP", "Programme All-Inclusive")
   - description : Détails livrables (ultra-complet avec suivi personnalisé)
   - outcome : Transformation garantie et mesurable

Chaque produit doit être ULTRA-PRÉCIS sur les livrables (nombre de vidéos, durées, PDF, exercices, etc.).
Pas de flou, pas de service de prestation, uniquement de l'enseignement structuré.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
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
      }
    });

    const offer = JSON.parse(completion.choices[0].message.content);

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
        skill: ctx.skill
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