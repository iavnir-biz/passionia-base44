import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';
import { getSessionContext } from './getSessionContext.js';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es un expert en e-learning et validation de marché.

Mission : rassurer l'utilisateur que sa compétence a un VRAI potentiel commercial.

RÈGLES :
1. Utilise TOUJOURS Session.skill + onboarding_summary pour personnaliser
2. validationText : 2-3 phrases ultra-personnalisées, ton bienveillant et direct
3. marketScores : scores réalistes (60-95) basés sur la compétence et le profil
4. Tutoie, sois cash, pas de bullshit marketing

Exemple de validationText :
"Ok, donc enseigner [skill] à [learner_profile], c'est un marché énorme. Des milliers de gens cherchent exactement ça chaque mois. Ta promesse de [quick_win] ? C'est pile ce que les gens veulent."`;

Deno.serve(async (req) => {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }

    const ctx = await getSessionContext(req, sessionId);
    const summary = ctx.onboarding_summary || {};
    const full = ctx.session.onboarding_full || {};
    const skill = ctx.skill || ctx.session.skill || summary.who_to_teach || '';

    const userPrompt = `CONTEXTE UTILISATEUR :
Compétence : ${skill}
Audience cible : ${summary.learner_profile || 'non spécifié'}
Problème principal : ${summary.main_learning_problem || 'non spécifié'}
Quick win : ${summary.quick_win || 'non spécifié'}
Grande transformation : ${summary.big_transformation || 'non spécifié'}
Revenus actuels : ${full.currentIncome || 'non spécifié'}
Revenus cibles : ${full.targetIncome || 'non spécifié'}
Délai : ${full.targetIncomeDelay || 'non spécifié'}

GÉNÈRE :
1. validationText : 2-3 phrases ultra-personnalisées qui RASSURENT sur le potentiel commercial (reprends les termes exacts de skill, learner_profile, quick_win)
2. marketScores : scores réalistes (60-95) basés sur :
   - elearningMarket : potentiel e-learning de cette compétence
   - digitalDemand : demande digitale pour cette audience
   - recurringRevenue : potentiel de revenus récurrents
   - globalAccess : accessibilité mondiale du sujet
   - techEase : facilité de livraison technique

Ton : direct, bienveillant, pas de blabla.`;

    console.log("OPENAI_CALL start", { fn: "generateMarketAnalysis", sessionId, model: "gpt-4o-mini" });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.4,
      max_tokens: 500,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "market_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              validationText: { type: "string" },
              marketScores: {
                type: "object",
                properties: {
                  elearningMarket: { type: "number", minimum: 0, maximum: 100 },
                  digitalDemand: { type: "number", minimum: 0, maximum: 100 },
                  recurringRevenue: { type: "number", minimum: 0, maximum: 100 },
                  globalAccess: { type: "number", minimum: 0, maximum: 100 },
                  techEase: { type: "number", minimum: 0, maximum: 100 }
                },
                required: ["elearningMarket", "digitalDemand", "recurringRevenue", "globalAccess", "techEase"],
                additionalProperties: false
              }
            },
            required: ["validationText", "marketScores"],
            additionalProperties: false
          }
        }
      }
    });

    console.log("OPENAI_CALL end", { 
      fn: "generateMarketAnalysis", 
      sessionId, 
      usage: completion.usage 
    });

    const result = JSON.parse(completion.choices[0].message.content);

    const usedKeys = Object.keys(full).filter(k => full[k]);

    return Response.json({
      validationText: result.validationText,
      marketScores: result.marketScores,
      debug: {
        model: "gpt-4o-mini",
        requestId: completion.id || null,
        usage: completion.usage || null,
        usedKeys,
        skill
      }
    });

  } catch (error) {
    console.error('Error in generateMarketAnalysis:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});