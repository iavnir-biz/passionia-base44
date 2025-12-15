import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';
import { getSessionContext } from './getSessionContext.js';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const BASE_SYSTEM_PROMPT = `RÈGLE CRITIQUE : Tu dois baser tes choix sur onboarding_summary en priorité.
Si une info manque, pose l'hypothèse la plus raisonnable MAIS reste cohérent avec le summary.
Tu n'as pas le droit d'ignorer le summary.

IMPORTANT : L'utilisateur veut ENSEIGNER sa compétence à d'autres, pas vendre des services.
Toute communication doit refléter une approche pédagogique, pas commerciale.`;

async function generateEmails(ctx, offer) {
  const prompt = `${BASE_SYSTEM_PROMPT}

Tu es un expert en email marketing pour formateurs et créateurs de cours en ligne.

Contexte :
- Compétence enseignée : ${ctx.skill}
- Élèves idéaux : ${ctx.onboarding_summary.who_to_teach || 'non renseigné'}
- Problème d'apprentissage : ${ctx.onboarding_summary.main_learning_problem || 'non renseigné'}
- Transformation promise : ${ctx.onboarding_summary.big_transformation || 'non renseignée'}
- Quick win : ${ctx.onboarding_summary.quick_win || 'non renseigné'}

Offre principale : ${JSON.stringify(offer.mainProductChoices?.[0] || {})}

Rédige une séquence de 3 emails de lancement :

Email 1 - Problème/Agitation (J-2) :
- Sujet accrocheur
- Identifie le problème d'apprentissage
- Agite la frustration de ne pas progresser
- Annonce une solution

Email 2 - Solution/Valeur (J-1) :
- Présente la méthode d'enseignement
- Partage un aperçu gratuit (quick win)
- Crée l'anticipation

Email 3 - Lancement (J-0) :
- Annonce l'ouverture
- Présente l'offre complète
- Call-to-action clair
- Urgence/scarcité

Retourne un objet JSON avec email1, email2, email3 (chacun avec subject et body).`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
    max_tokens: 2000,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "email_sequence",
        strict: true,
        schema: {
          type: "object",
          properties: {
            email1: {
              type: "object",
              properties: {
                subject: { type: "string" },
                body: { type: "string" }
              },
              required: ["subject", "body"],
              additionalProperties: false
            },
            email2: {
              type: "object",
              properties: {
                subject: { type: "string" },
                body: { type: "string" }
              },
              required: ["subject", "body"],
              additionalProperties: false
            },
            email3: {
              type: "object",
              properties: {
                subject: { type: "string" },
                body: { type: "string" }
              },
              required: ["subject", "body"],
              additionalProperties: false
            }
          },
          required: ["email1", "email2", "email3"],
          additionalProperties: false
        }
      }
    }
  });

  return JSON.parse(completion.choices[0].message.content);
}

async function generateSalesPage(ctx, offer) {
  const prompt = `${BASE_SYSTEM_PROMPT}

Tu es un expert en rédaction de pages de vente pour formations en ligne.

Contexte :
- Compétence enseignée : ${ctx.skill}
- Élèves idéaux : ${ctx.onboarding_summary.who_to_teach || 'non renseigné'}
- Problème d'apprentissage : ${ctx.onboarding_summary.main_learning_problem || 'non renseigné'}
- Transformation promise : ${ctx.onboarding_summary.big_transformation || 'non renseignée'}
- Méthode unique : ${ctx.onboarding_summary.method_angle || 'non renseignée'}
- Erreur courante : ${ctx.onboarding_summary.common_mistake || 'non renseignée'}
- Histoire/preuve : ${ctx.onboarding_summary.proof_or_story || 'non renseignée'}

Offre principale : ${JSON.stringify(offer.mainProductChoices?.[0] || {})}

Rédige une page de vente complète en format Markdown avec :

1. Headline accrocheur (bénéfice transformation)
2. Sous-titre (pour qui / problème)
3. Section problème (3-4 douleurs d'apprentissage)
4. Section solution (ta méthode unique)
5. Présentation de l'offre (contenu détaillé)
6. Bénéfices pédagogiques (liste à puces)
7. Pour qui c'est fait / pas fait
8. Garantie satisfaction
9. Call-to-action puissant
10. FAQ (5 questions)

Ton : pédagogique, bienveillant, expert, motivant. Pas agressif.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
    max_tokens: 2500
  });

  return completion.choices[0].message.content;
}

async function generateActionPlan(ctx, offer) {
  const prompt = `${BASE_SYSTEM_PROMPT}

Tu es un expert en stratégie de lancement pour formateurs.

Contexte :
- Compétence enseignée : ${ctx.skill}
- Élèves idéaux : ${ctx.onboarding_summary.who_to_teach || 'non renseigné'}
- Transformation promise : ${ctx.onboarding_summary.big_transformation || 'non renseignée'}

Offre : ${JSON.stringify(offer)}

Crée un plan d'action 30 jours pour lancer la formation.

Structure : 4 semaines avec actions quotidiennes concrètes.

Semaine 1 : Préparation
- Créer le contenu pédagogique
- Préparer les premiers modules
- Setup technique

Semaine 2 : Audience
- Créer du contenu gratuit
- Construire une liste email
- Engagement communauté

Semaine 3 : Pré-lancement
- Séquence emails
- Webinaire ou masterclass gratuite
- Témoignages/social proof

Semaine 4 : Lancement
- Ouverture des inscriptions
- Suivi quotidien
- Clôture avec bonus

Pour chaque jour : une action précise, actionnable, mesurable.

Retourne un objet JSON avec week1, week2, week3, week4 (chacun avec day1 à day7, chaque jour ayant action et description).`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 2500,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "action_plan",
        strict: true,
        schema: {
          type: "object",
          properties: {
            week1: {
              type: "object",
              properties: {
                day1: { type: "object", properties: { action: { type: "string" }, description: { type: "string" } }, required: ["action", "description"], additionalProperties: false },
                day2: { type: "object", properties: { action: { type: "string" }, description: { type: "string" } }, required: ["action", "description"], additionalProperties: false },
                day3: { type: "object", properties: { action: { type: "string" }, description: { type: "string" } }, required: ["action", "description"], additionalProperties: false },
                day4: { type: "object", properties: { action: { type: "string" }, description: { type: "string" } }, required: ["action", "description"], additionalProperties: false },
                day5: { type: "object", properties: { action: { type: "string" }, description: { type: "string" } }, required: ["action", "description"], additionalProperties: false },
                day6: { type: "object", properties: { action: { type: "string" }, description: { type: "string" } }, required: ["action", "description"], additionalProperties: false },
                day7: { type: "object", properties: { action: { type: "string" }, description: { type: "string" } }, required: ["action", "description"], additionalProperties: false }
              },
              required: ["day1", "day2", "day3", "day4", "day5", "day6", "day7"],
              additionalProperties: false
            },
            week2: {
              type: "object",
              properties: {
                day1: { type: "object", properties: { action: { type: "string" }, description: { type: "string" } }, required: ["action", "description"], additionalProperties: false },
                day2: { type: "object", properties: { action: { type: "string" }, description: { type: "string" } }, required: ["action", "description"], additionalProperties: false },
                day3: { type: "object", properties: { action: { type: "string" }, description: { type: "string" } }, required: ["action", "description"], additionalProperties: false },
                day4: { type: "object", properties: { action: { type: "string" }, description: { type: "string" } }, required: ["action", "description"], additionalProperties: false },
                day5: { type: "object", properties: { action: { type: "string" }, description: { type: "string" } }, required: ["action", "description"], additionalProperties: false },
                day6: { type: "object", properties: { action: { type: "string" }, description: { type: "string" } }, required: ["action", "description"], additionalProperties: false },
                day7: { type: "object", properties: { action: { type: "string" }, description: { type: "string" } }, required: ["action", "description"], additionalProperties: false }
              },
              required: ["day1", "day2", "day3", "day4", "day5", "day6", "day7"],
              additionalProperties: false
            },
            week3: {
              type: "object",
              properties: {
                day1: { type: "object", properties: { action: { type: "string" }, description: { type: "string" } }, required: ["action", "description"], additionalProperties: false },
                day2: { type: "object", properties: { action: { type: "string" }, description: { type: "string" } }, required: ["action", "description"], additionalProperties: false },
                day3: { type: "object", properties: { action: { type: "string" }, description: { type: "string" } }, required: ["action", "description"], additionalProperties: false },
                day4: { type: "object", properties: { action: { type: "string" }, description: { type: "string" } }, required: ["action", "description"], additionalProperties: false },
                day5: { type: "object", properties: { action: { type: "string" }, description: { type: "string" } }, required: ["action", "description"], additionalProperties: false },
                day6: { type: "object", properties: { action: { type: "string" }, description: { type: "string" } }, required: ["action", "description"], additionalProperties: false },
                day7: { type: "object", properties: { action: { type: "string" }, description: { type: "string" } }, required: ["action", "description"], additionalProperties: false }
              },
              required: ["day1", "day2", "day3", "day4", "day5", "day6", "day7"],
              additionalProperties: false
            },
            week4: {
              type: "object",
              properties: {
                day1: { type: "object", properties: { action: { type: "string" }, description: { type: "string" } }, required: ["action", "description"], additionalProperties: false },
                day2: { type: "object", properties: { action: { type: "string" }, description: { type: "string" } }, required: ["action", "description"], additionalProperties: false },
                day3: { type: "object", properties: { action: { type: "string" }, description: { type: "string" } }, required: ["action", "description"], additionalProperties: false },
                day4: { type: "object", properties: { action: { type: "string" }, description: { type: "string" } }, required: ["action", "description"], additionalProperties: false },
                day5: { type: "object", properties: { action: { type: "string" }, description: { type: "string" } }, required: ["action", "description"], additionalProperties: false },
                day6: { type: "object", properties: { action: { type: "string" }, description: { type: "string" } }, required: ["action", "description"], additionalProperties: false },
                day7: { type: "object", properties: { action: { type: "string" }, description: { type: "string" } }, required: ["action", "description"], additionalProperties: false }
              },
              required: ["day1", "day2", "day3", "day4", "day5", "day6", "day7"],
              additionalProperties: false
            }
          },
          required: ["week1", "week2", "week3", "week4"],
          additionalProperties: false
        }
      }
    }
  });

  return JSON.parse(completion.choices[0].message.content);
}

async function generateIdeas(ctx, offer) {
  const prompt = `${BASE_SYSTEM_PROMPT}

Tu es un expert en stratégie de contenu pour formateurs.

Contexte :
- Compétence enseignée : ${ctx.skill}
- Élèves idéaux : ${ctx.onboarding_summary.who_to_teach || 'non renseigné'}
- Quick win : ${ctx.onboarding_summary.quick_win || 'non renseigné'}

Génère 10 idées de contenu gratuit (lead magnets) pour attirer des élèves potentiels.

Format : titre + description courte + valeur pédagogique

Exemples de types :
- Checklist
- Mini-cours PDF
- Vidéo tuto
- Template/Workbook
- Guide pas-à-pas
- Masterclass gratuite

Retourne un tableau JSON d'objets avec title, type, description, learningValue.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    max_tokens: 1500,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "content_ideas",
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
                  type: { type: "string" },
                  description: { type: "string" },
                  learningValue: { type: "string" }
                },
                required: ["title", "type", "description", "learningValue"],
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

async function generateFirstSaleStrategy(ctx, offer) {
  const prompt = `${BASE_SYSTEM_PROMPT}

Tu es un expert en lancement pour nouveaux formateurs.

Contexte :
- Compétence enseignée : ${ctx.skill}
- Élèves idéaux : ${ctx.onboarding_summary.who_to_teach || 'non renseigné'}
- Quick win : ${ctx.onboarding_summary.quick_win || 'non renseigné'}

Offre principale : ${JSON.stringify(offer.mainProductChoices?.[0] || {})}

Rédige une stratégie "Première Vente en 7 Jours" ultra-concrète.

Structure :
1. Mindset (paragraphe motivation)
2. Étape par étape (7 jours, 1 action/jour)
3. Scripts de messages (pour réseaux sociaux / email / DM)
4. Objections courantes + réponses
5. Célébration première vente

Ton : pragmatique, bienveillant, réaliste, pas de bullshit.

Retourne un objet JSON avec mindset, steps (array de 7 objets avec day, action, details), scripts (object avec social, email, dm), objections (array de 5 objets avec objection et response), celebration (string).`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 2000,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "first_sale_strategy",
        strict: true,
        schema: {
          type: "object",
          properties: {
            mindset: { type: "string" },
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "number" },
                  action: { type: "string" },
                  details: { type: "string" }
                },
                required: ["day", "action", "details"],
                additionalProperties: false
              },
              minItems: 7,
              maxItems: 7
            },
            scripts: {
              type: "object",
              properties: {
                social: { type: "string" },
                email: { type: "string" },
                dm: { type: "string" }
              },
              required: ["social", "email", "dm"],
              additionalProperties: false
            },
            objections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  objection: { type: "string" },
                  response: { type: "string" }
                },
                required: ["objection", "response"],
                additionalProperties: false
              },
              minItems: 5,
              maxItems: 5
            },
            celebration: { type: "string" }
          },
          required: ["mindset", "steps", "scripts", "objections", "celebration"],
          additionalProperties: false
        }
      }
    }
  });

  return JSON.parse(completion.choices[0].message.content);
}

Deno.serve(async (req) => {
  try {
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }

    const ctx = await getSessionContext(req, sessionId);
    
    // Get finalized offer (or draft)
    const offer = ctx.session.finalized_offer || ctx.session.offer_draft;
    
    if (!offer) {
      return Response.json({ 
        error: 'No offer found. Please generate offer first.' 
      }, { status: 400 });
    }

    // Generate all content in parallel
    const [emails, salesPage, actionPlan, ideas, firstSaleStrategy] = await Promise.all([
      generateEmails(ctx, offer),
      generateSalesPage(ctx, offer),
      generateActionPlan(ctx, offer),
      generateIdeas(ctx, offer),
      generateFirstSaleStrategy(ctx, offer)
    ]);

    const generatedContent = {
      emails: JSON.stringify(emails),
      salesPage,
      actionPlan: JSON.stringify(actionPlan),
      ideas: JSON.stringify(ideas),
      firstSaleStrategy: JSON.stringify(firstSaleStrategy),
      generatedAt: new Date().toISOString()
    };

    // Save to Session
    const base44 = createClientFromRequest(req);
    await base44.asServiceRole.entities.Session.update(sessionId, {
      generatedContent,
      updated_at: new Date().toISOString()
    });

    // Debug info
    const summary = ctx.onboarding_summary;
    const summaryKeysFilled = Object.keys(summary).filter(k => summary[k] && summary[k] !== '');

    return Response.json({
      success: true,
      data: generatedContent,
      debug: {
        usedSummary: true,
        summaryKeysFilled: summaryKeysFilled,
        skill: ctx.skill,
        offerUsed: !!offer
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