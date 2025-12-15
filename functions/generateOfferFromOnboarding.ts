import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';
import { getSessionContext } from './getSessionContext.js';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es un expert en création d'offres pédagogiques pour l'enseignement en ligne.

RÈGLE CRITIQUE : Tu dois baser tes choix sur onboarding_summary en priorité.
Si une info manque, pose l'hypothèse la plus raisonnable MAIS reste cohérent avec le summary.
Tu n'as pas le droit d'ignorer le summary.

IMPORTANT : L'utilisateur veut ENSEIGNER sa compétence à d'autres, pas vendre des services.
Tous les produits doivent être des formations, cours, programmes d'accompagnement pédagogique.

Livrables hyper précis : durée exacte, nombre de vidéos/modules, support inclus, format concret.`;

Deno.serve(async (req) => {
  try {
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }

    const ctx = await getSessionContext(req, sessionId);
    const summary = ctx.onboarding_summary;

    const userPrompt = `Contexte utilisateur :
- Nom : ${ctx.name}
- Compétence à enseigner : ${ctx.skill || summary.who_to_teach || 'non renseignée'}
- Élèves idéaux : ${summary.who_to_teach || summary.learner_profile || 'non renseigné'}
- Problème d'apprentissage principal : ${summary.main_learning_problem || 'non renseigné'}
- Transformation finale promise : ${summary.big_transformation || 'non renseignée'}
- Quick win : ${summary.quick_win || 'non renseigné'}
- Méthode unique : ${summary.method_angle || 'non renseignée'}
- Erreur courante : ${summary.common_mistake || 'non renseignée'}
- Histoire/preuve : ${summary.proof_or_story || 'non renseignée'}
- Préférences format : ${ctx.format_preferences.join(', ') || 'non renseigné'}

Génère une offre complète d'enseignement avec :

1. mainOfferIdeas : 3 angles différents pour positionner l'offre d'enseignement
   Chaque idée doit avoir :
   - title : titre accrocheur orienté bénéfice pédagogique
   - problem : le problème d'apprentissage qu'on résout
   - stats : une stat ou tendance du marché e-learning
   - solution : comment l'enseignement va résoudre ce problème

2. offerChoices : 4 niveaux de produits pédagogiques avec 2 choix chacun

   mainProductChoices (prix: 17, 27, 37 ou 47€) :
   - Formation de base ou cours d'introduction
   - Durée précise (ex: "Formation de 3h en 12 vidéos")
   - Livrables concrets (vidéos, PDF, exercices)
   
   orderBump1Choices (prix: 14, 17, 27 ou 37€) :
   - Bonus pédagogique complémentaire
   - Templates, checklists, workbooks
   
   upsell1Choices (prix: 67, 97, 197 ou 297€) :
   - Programme avancé ou accompagnement
   - Durée + support (ex: "6 semaines avec 3 appels de groupe")
   
   upsell3Choices (prix: 1000, 2000, 3000 ou 5000€) :
   - Coaching/mentorat premium
   - Accompagnement personnalisé
   - Durée précise (ex: "3 mois en 1-to-1")

Chaque produit doit avoir :
- title : nom du produit pédagogique
- price : exactement l'un des prix indiqués (string)
- productType : type exact (ex: "Formation vidéo", "Programme", "Coaching", "Templates")
- description : description claire du contenu pédagogique
- outcome : résultat d'apprentissage précis pour l'élève

Garde une cohérence thématique : tous les produits enseignent la compétence "${ctx.skill}".`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
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
      skill: ctx.skill,
      updated_at: new Date().toISOString()
    });

    // Debug info
    const summaryKeysFilled = Object.keys(summary).filter(k => summary[k] && summary[k] !== '');

    return Response.json({
      success: true,
      offer,
      debug: {
        usedSummary: true,
        summaryKeysFilled: summaryKeysFilled,
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