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
  const prompt = `Contexte :
- Prénom : ${ctx.name}
- Compétence enseignée : ${ctx.skill}
- Public cible : ${summary.who_to_teach || summary.learner_profile}
- Problème résolu : ${summary.main_learning_problem}
- Transformation : ${summary.big_transformation}

Offre finalisée :
${JSON.stringify(offer, null, 2)}

Génère une séquence de 5 emails pour promouvoir cette formation :

Email 1 (Jour 0) : Bienvenue + présentation du problème
Email 2 (Jour 1) : Histoire personnelle + crédibilité
Email 3 (Jour 2) : Présentation de la solution (la formation)
Email 4 (Jour 3) : Témoignages imaginés + bénéfices
Email 5 (Jour 4) : Urgence + call-to-action

Pour chaque email, fournis :
- subject (objet)
- body (corps complet, 200-300 mots, tutoiement, ton personnel)

Format JSON strict avec tableau de 5 emails.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: BASE_SYSTEM_PROMPT },
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
              minItems: 5,
              maxItems: 5
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
  const prompt = `Contexte :
- Prénom : ${ctx.name}
- Compétence enseignée : ${ctx.skill}
- Public cible : ${summary.who_to_teach || summary.learner_profile}
- Problème résolu : ${summary.main_learning_problem}
- Quick win : ${summary.quick_win}
- Transformation : ${summary.big_transformation}
- Méthode unique : ${summary.method_angle}

Offre finalisée :
${JSON.stringify(offer, null, 2)}

Rédige une page de vente complète (format Markdown) avec :

1. **Titre accrocheur** (H1)
2. **Sous-titre** qui identifie le problème
3. **Section "Tu te reconnais ?" (3-4 points douleur)
4. **Histoire personnelle** (2-3 paragraphes basés sur proof_or_story)
5. **Présentation de la formation** (titre + description)
6. **Programme détaillé** (modules, ce qui est inclus)
7. **Bénéfices / Résultats attendus** (liste à puces)
8. **Garantie** (satisfait ou remboursé 30j)
9. **Call-to-action** (bouton inscription)
10. **FAQ** (3-4 questions courantes)

Ton : personnel, tutoiement, motivant mais honnête. 1500-2000 mots.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: BASE_SYSTEM_PROMPT },
      { role: "user", content: prompt }
    ],
    temperature: 0.5,
    max_tokens: 3000
  });

  return completion.choices[0].message.content;
}

async function generateActionPlan(ctx, summary, offer, openai) {
  const prompt = `Contexte :
- Prénom : ${ctx.name}
- Compétence enseignée : ${ctx.skill}
- Offre : ${JSON.stringify(offer, null, 2)}

Génère un plan d'action sur 4 semaines pour lancer cette formation :

Semaine 1 : Création du contenu
Semaine 2 : Setup technique (plateforme, paiement)
Semaine 3 : Marketing pré-lancement
Semaine 4 : Lancement et premières ventes

Pour chaque semaine, fournis :
- weekNumber (1-4)
- title (titre de la semaine)
- objective (objectif principal)
- tasks (tableau de 5-7 tâches concrètes)
- expectedResult (résultat attendu en fin de semaine)

Format JSON strict avec tableau de 4 semaines.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: BASE_SYSTEM_PROMPT },
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
            weeks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  weekNumber: { type: "number" },
                  title: { type: "string" },
                  objective: { type: "string" },
                  tasks: {
                    type: "array",
                    items: { type: "string" }
                  },
                  expectedResult: { type: "string" }
                },
                required: ["weekNumber", "title", "objective", "tasks", "expectedResult"],
                additionalProperties: false
              },
              minItems: 4,
              maxItems: 4
            }
          },
          required: ["weeks"],
          additionalProperties: false
        }
      }
    }
  });

  return JSON.parse(completion.choices[0].message.content);
}

async function generateIdeas(ctx, summary, offer, openai) {
  const prompt = `Contexte :
- Compétence enseignée : ${ctx.skill}
- Public cible : ${summary.who_to_teach || summary.learner_profile}
- Offre : ${JSON.stringify(offer, null, 2)}

Génère 10 idées de contenus gratuits pour attirer des prospects :

- Posts réseaux sociaux (LinkedIn, Instagram, Facebook)
- Articles de blog
- Vidéos YouTube
- Lead magnets (PDF, checklist, mini-formation)
- Lives / webinaires

Pour chaque idée, fournis :
- type (ex: "Post LinkedIn", "Article de blog", etc.)
- title (titre accrocheur)
- description (2-3 phrases sur le contenu)
- goal (objectif : visibilité, lead generation, etc.)

Format JSON strict avec tableau de 10 idées.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: BASE_SYSTEM_PROMPT },
      { role: "user", content: prompt }
    ],
    temperature: 0.6,
    max_tokens: 2000,
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
                  type: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  goal: { type: "string" }
                },
                required: ["type", "title", "description", "goal"],
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
  const prompt = `Contexte :
- Prénom : ${ctx.name}
- Compétence enseignée : ${ctx.skill}
- Public cible : ${summary.who_to_teach || summary.learner_profile}
- Offre : ${JSON.stringify(offer, null, 2)}

Génère une stratégie détaillée pour faire ta PREMIÈRE VENTE dans les 7 jours (format Markdown) :

1. **Jour 1-2** : Préparation (quoi créer, où poster)
2. **Jour 3-4** : Activation réseau chaud (famille, amis, contacts)
3. **Jour 5-6** : Contenu viral + promo ciblée
4. **Jour 7** : Push final + urgence

Inclus :
- Actions concrètes quotidiennes
- Scripts de messages à envoyer
- Plateformes à utiliser
- Prix d'appel recommandé (offre early bird)
- Mindset / conseils psychologiques

Ton : motivant, direct, actionnable. 800-1000 mots.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: BASE_SYSTEM_PROMPT },
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