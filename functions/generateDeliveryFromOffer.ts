import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai';
import { getSessionContext } from './getSessionContext.js';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es le ContentDeliveryCoach de Passion IA.

Mission : générer 5 documents marketing/vente prêts à l'emploi pour lancer une offre éducative en ligne.

RÈGLES CRITIQUES :
1. Utilise EN PRIORITÉ onboarding_summary (données structurées riches).
2. Complète avec finalized_offer (l'offre validée par l'user).
3. Ton ton : direct, anti-bullshit, coach bienveillant mais cash.
4. Pas de blabla marketing creux. Que du concret.
5. Tout est orienté ACTION et RÉSULTATS mesurables.

Tu génères :
- emails : séquence d'emails de vente
- salesPage : page de vente PAS (Problème-Agitate-Solution)
- actionPlan : plan d'action 7 jours
- ideas : 10 idées de produits éducatifs
- firstSaleStrategy : stratégie "première vente en 24h"

LOGIQUE :
- who_to_teach → cible précise
- main_learning_problem → douleur N°1
- quick_win → promesse rapide
- big_transformation → transformation finale
- method_angle → ton approche unique
- common_mistake → l'erreur à éviter

Aucun contenu générique. Tout doit être personnalisé avec la compétence et le profil apprenant.`;

Deno.serve(async (req) => {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }

    const ctx = await getSessionContext(req, sessionId);
    const summary = ctx.onboarding_summary;
    const finalizedOffer = ctx.session.finalized_offer;

    if (!finalizedOffer) {
      return Response.json({ 
        error: 'finalized_offer manquant. L\'utilisateur doit d\'abord finaliser son offre.' 
      }, { status: 400 });
    }

    const skill = ctx.skill || ctx.session.skill || '';
    
    // --- 1. EMAILS ---
    const emailsPrompt = `Génère une séquence de 3 emails de vente pour lancer "${finalizedOffer.mainProduct?.title || 'le produit'}".

Contexte :
- Compétence : ${skill}
- Audience (élève cible) : ${summary.who_to_teach || 'non spécifié'}
- Profil apprenant : ${summary.learner_profile || 'non spécifié'}
- Problème principal : ${summary.main_learning_problem || 'non spécifié'}
- Quick win : ${summary.quick_win || 'non spécifié'}
- Grande transformation : ${summary.big_transformation || 'non spécifié'}
- Méthode/angle : ${summary.method_angle || 'non spécifié'}
- Preuve/histoire : ${summary.proof_or_story || 'non spécifié'}

RÈGLES STRICTES :
1. Système "anti-bullshit" : zéro blabla, que du concret
2. Format : plain text, pas de HTML
3. Structure par email :
   - Objet percutant (max 50 caractères)
   - Corps : 150-200 mots MAX
   - 1 seul CTA : "Réponds INFO pour recevoir le lien"
4. Ton : direct, bienveillant, cash
5. Pas de "cher ami", "tu sais quoi", etc.

Email 1 : Problème + Empathie
Email 2 : Solution + Preuve sociale
Email 3 : Urgence douce + CTA final`;

    console.log("OPENAI_CALL start", { fn: "generateDeliveryFromOffer", sessionId, model: "gpt-4o-mini", type: "emails" });

    const emailsCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: emailsPrompt }
      ],
      temperature: 0.5,
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

    console.log("OPENAI_CALL end", { fn: "generateDeliveryFromOffer", sessionId, usage: emailsCompletion.usage, type: "emails" });

    const emails = JSON.parse(emailsCompletion.choices[0].message.content);

    // --- 2. SALES PAGE ---
    const salesPagePrompt = `Génère une page de vente pour "${finalizedOffer.mainProduct?.title || 'le produit'}".

Contexte :
- Compétence : ${skill}
- Audience (élève cible) : ${summary.who_to_teach || 'non spécifié'}
- Profil apprenant : ${summary.learner_profile || 'non spécifié'}
- Problème principal : ${summary.main_learning_problem || 'non spécifié'}
- Quick win : ${summary.quick_win || 'non spécifié'}
- Grande transformation : ${summary.big_transformation || 'non spécifié'}
- Méthode/angle : ${summary.method_angle || 'non spécifié'}
- Prix : ${finalizedOffer.mainProduct?.price || 'N/A'}

RÈGLES STRICTES :
1. Structure PAS (Problème-Agitate-Solution)
2. Format : plain text, pas de HTML
3. Sections obligatoires :
   - Titre accrocheur (max 80 caractères)
   - Sous-titre (problème + promesse, max 120 caractères)
   - Le Problème (150 mots)
   - Ce que tu vas recevoir (liste à puces des livrables)
   - La Transformation (100 mots)
   - FAQ (5 questions/réponses courtes)
   - CTA final : "Envoie INFO pour recevoir le lien d'achat"
4. Ton : direct, anti-bullshit, orienté résultats
5. Pas de "garantie satisfait ou remboursé" (trop classique)`;

    console.log("OPENAI_CALL start", { fn: "generateDeliveryFromOffer", sessionId, model: "gpt-4o-mini", type: "salesPage" });

    const salesPageCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: salesPagePrompt }
      ],
      temperature: 0.5,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "sales_page",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              subtitle: { type: "string" },
              problem: { type: "string" },
              deliverables: {
                type: "array",
                items: { type: "string" }
              },
              transformation: { type: "string" },
              faq: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    q: { type: "string" },
                    a: { type: "string" }
                  },
                  required: ["q", "a"],
                  additionalProperties: false
                },
                minItems: 5,
                maxItems: 5
              },
              cta: { type: "string" }
            },
            required: ["title", "subtitle", "problem", "deliverables", "transformation", "faq", "cta"],
            additionalProperties: false
          }
        }
      }
    });

    console.log("OPENAI_CALL end", { fn: "generateDeliveryFromOffer", sessionId, usage: salesPageCompletion.usage, type: "salesPage" });

    const salesPage = JSON.parse(salesPageCompletion.choices[0].message.content);

    // --- 3. ACTION PLAN ---
    const actionPlanPrompt = `Génère un plan d'action 7 jours pour lancer "${finalizedOffer.mainProduct?.title || 'le produit'}".

Contexte :
- Compétence : ${skill}
- Audience (élève cible) : ${summary.who_to_teach || 'non spécifié'}
- Profil apprenant : ${summary.learner_profile || 'non spécifié'}
- Formats préférés : ${(summary.format_preferences || []).join(', ') || 'non spécifié'}

RÈGLES STRICTES :
1. 7 jours, 1 focus par jour
2. Maximum 3 actions concrètes par jour
3. Pas de "prépare ton mindset" ou blabla mental
4. Que des actions MESURABLES et RÉALISABLES
5. Ton : coach directif mais bienveillant`;

    console.log("OPENAI_CALL start", { fn: "generateDeliveryFromOffer", sessionId, model: "gpt-4o-mini", type: "actionPlan" });

    const actionPlanCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: actionPlanPrompt }
      ],
      temperature: 0.5,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "action_plan_7days",
          strict: true,
          schema: {
            type: "object",
            properties: {
              day1: {
                type: "object",
                properties: {
                  focus: { type: "string" },
                  actions: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 3,
                    maxItems: 3
                  }
                },
                required: ["focus", "actions"],
                additionalProperties: false
              },
              day2: {
                type: "object",
                properties: {
                  focus: { type: "string" },
                  actions: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 3,
                    maxItems: 3
                  }
                },
                required: ["focus", "actions"],
                additionalProperties: false
              },
              day3: {
                type: "object",
                properties: {
                  focus: { type: "string" },
                  actions: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 3,
                    maxItems: 3
                  }
                },
                required: ["focus", "actions"],
                additionalProperties: false
              },
              day4: {
                type: "object",
                properties: {
                  focus: { type: "string" },
                  actions: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 3,
                    maxItems: 3
                  }
                },
                required: ["focus", "actions"],
                additionalProperties: false
              },
              day5: {
                type: "object",
                properties: {
                  focus: { type: "string" },
                  actions: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 3,
                    maxItems: 3
                  }
                },
                required: ["focus", "actions"],
                additionalProperties: false
              },
              day6: {
                type: "object",
                properties: {
                  focus: { type: "string" },
                  actions: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 3,
                    maxItems: 3
                  }
                },
                required: ["focus", "actions"],
                additionalProperties: false
              },
              day7: {
                type: "object",
                properties: {
                  focus: { type: "string" },
                  actions: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 3,
                    maxItems: 3
                  }
                },
                required: ["focus", "actions"],
                additionalProperties: false
              }
            },
            required: ["day1", "day2", "day3", "day4", "day5", "day6", "day7"],
            additionalProperties: false
          }
        }
      }
    });

    console.log("OPENAI_CALL end", { fn: "generateDeliveryFromOffer", sessionId, usage: actionPlanCompletion.usage, type: "actionPlan" });

    const actionPlan = JSON.parse(actionPlanCompletion.choices[0].message.content);

    // --- 4. PRODUCT IDEAS ---
    const ideasPrompt = `Génère 10 idées de produits éducatifs pour monétiser "${skill}".

Contexte :
- Compétence : ${skill}
- Audience (élève cible) : ${summary.who_to_teach || 'non spécifié'}
- Profil apprenant : ${summary.learner_profile || 'non spécifié'}
- Problème principal : ${summary.main_learning_problem || 'non spécifié'}
- Formats préférés : ${(summary.format_preferences || []).join(', ') || 'non spécifié'}

RÈGLES STRICTES :
1. Uniquement des produits ÉDUCATIFS (formations, ebooks, templates, communautés)
2. Pas de coaching 1-1, pas de prestations de service
3. Chaque idée :
   - title : nom du produit (max 60 caractères)
   - format : type (ex: "Mini-cours vidéo", "Ebook PDF", "Template Notion", "Communauté Telegram")
   - quickWin : résultat rapide promis (max 80 caractères)
4. Variété de prix : de 7€ à 2000€
5. Focus : résultats mesurables`;

    console.log("OPENAI_CALL start", { fn: "generateDeliveryFromOffer", sessionId, model: "gpt-4o-mini", type: "ideas" });

    const ideasCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: ideasPrompt }
      ],
      temperature: 0.6,
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

    console.log("OPENAI_CALL end", { fn: "generateDeliveryFromOffer", sessionId, usage: ideasCompletion.usage, type: "ideas" });

    const ideas = JSON.parse(ideasCompletion.choices[0].message.content);

    // --- 5. FIRST SALE STRATEGY ---
    const firstSalePrompt = `Génère une stratégie "première vente en 24h" pour "${finalizedOffer.mainProduct?.title || 'le produit'}".

Contexte :
- Compétence : ${skill}
- Audience (élève cible) : ${summary.who_to_teach || 'non spécifié'}
- Profil apprenant : ${summary.learner_profile || 'non spécifié'}
- Problème principal : ${summary.main_learning_problem || 'non spécifié'}
- Quick win : ${summary.quick_win || 'non spécifié'}
- Prix : ${finalizedOffer.mainProduct?.price || 'N/A'}

RÈGLES STRICTES :
1. Stratégie ULTRA concrète, applicable en 24h
2. 6 sections obligatoires :
   - clientAcquisition : 3 canaux précis pour toucher la cible (ex: "Groupes Facebook X", "Reddit r/...", "LinkedIn hashtag Y")
   - dmMessages : 2 messages DM courts (max 100 mots chacun) avec CTA "Envoie INFO"
   - stories : 3 idées de stories Instagram/TikTok (titre + hook + CTA)
   - reelScript : script détaillé d'un reel (30-45 sec) avec hook + body + CTA
   - carouselStructure : structure d'un carrousel LinkedIn (10 slides, titres + 1 phrase par slide)
   - smallProduct : idée de mini-produit 7-14€ pour valider le marché (titre + livrable + promesse)
3. Ton : ultra-actionnable, zéro blabla
4. Tous les CTA : "Envoie INFO pour recevoir le lien"`;

    console.log("OPENAI_CALL start", { fn: "generateDeliveryFromOffer", sessionId, model: "gpt-4o-mini", type: "firstSale" });

    const firstSaleCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: firstSalePrompt }
      ],
      temperature: 0.6,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "first_sale_strategy",
          strict: true,
          schema: {
            type: "object",
            properties: {
              clientAcquisition: {
                type: "array",
                items: { type: "string" },
                minItems: 3,
                maxItems: 3
              },
              dmMessages: {
                type: "array",
                items: { type: "string" },
                minItems: 2,
                maxItems: 2
              },
              stories: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    hook: { type: "string" },
                    cta: { type: "string" }
                  },
                  required: ["title", "hook", "cta"],
                  additionalProperties: false
                },
                minItems: 3,
                maxItems: 3
              },
              reelScript: {
                type: "object",
                properties: {
                  hook: { type: "string" },
                  body: { type: "string" },
                  cta: { type: "string" }
                },
                required: ["hook", "body", "cta"],
                additionalProperties: false
              },
              carouselStructure: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    slide: { type: "number" },
                    title: { type: "string" },
                    text: { type: "string" }
                  },
                  required: ["slide", "title", "text"],
                  additionalProperties: false
                },
                minItems: 10,
                maxItems: 10
              },
              smallProduct: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  deliverable: { type: "string" },
                  promise: { type: "string" }
                },
                required: ["title", "deliverable", "promise"],
                additionalProperties: false
              }
            },
            required: ["clientAcquisition", "dmMessages", "stories", "reelScript", "carouselStructure", "smallProduct"],
            additionalProperties: false
          }
        }
      }
    });

    console.log("OPENAI_CALL end", { fn: "generateDeliveryFromOffer", sessionId, usage: firstSaleCompletion.usage, type: "firstSale" });

    const firstSaleStrategy = JSON.parse(firstSaleCompletion.choices[0].message.content);

    // --- SAVE TO SESSION (objets, pas de stringify) ---
    const generatedContent = {
      emails,
      salesPage,
      actionPlan,
      ideas,
      firstSaleStrategy,
      generatedAt: new Date().toISOString()
    };

    const base44 = createClientFromRequest(req);
    await base44.asServiceRole.entities.Session.update(sessionId, {
      generatedContent
    });

    const summaryKeysFilled = Object.keys(summary).filter(k => summary[k] && summary[k] !== '');

    return Response.json({
      success: true,
      generatedContent,
      debug: {
        skill,
        summaryKeysFilled,
        productsUsed: {
          mainProduct: finalizedOffer.mainProduct?.title,
          orderBump1: finalizedOffer.orderBump1?.title,
          upsell1: finalizedOffer.upsell1?.title,
          upsell3: finalizedOffer.upsell3?.title
        },
        model: "gpt-4o-mini",
        requestIds: {
          emails: emailsCompletion.id || null,
          salesPage: salesPageCompletion.id || null,
          actionPlan: actionPlanCompletion.id || null,
          ideas: ideasCompletion.id || null,
          firstSale: firstSaleCompletion.id || null
        },
        usages: {
          emails: emailsCompletion.usage || null,
          salesPage: salesPageCompletion.usage || null,
          actionPlan: actionPlanCompletion.usage || null,
          ideas: ideasCompletion.usage || null,
          firstSale: firstSaleCompletion.usage || null
        }
      }
    });

  } catch (error) {
    return Response.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});