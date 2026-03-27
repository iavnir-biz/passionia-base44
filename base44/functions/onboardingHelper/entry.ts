import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';
import { getSessionContext } from './getSessionContext.js';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es un coach d'affaires qui aide l'utilisateur à répondre aux questions de l'onboarding.

Mission : générer un helper text court et 2-3 exemples concrets basés sur le contexte de l'utilisateur (historique + summary).

RÈGLES :
1. Utilise TOUJOURS onboarding_summary + onboarding_history pour personnaliser
2. Helper text : 1-2 phrases maximum, bienveillant, orienté action
3. Examples : 2-3 exemples ultra-concrets adaptés au profil de l'utilisateur
4. Tutoie, sois naturel, pas de blabla

Si pas assez de contexte, reste générique mais pertinent.`;

Deno.serve(async (req) => {
  try {
    const { sessionId, questionId, fieldName } = await req.json();

    if (!sessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }

    const ctx = await getSessionContext(req, sessionId);
    const summary = ctx.onboarding_summary || {};
    const history = ctx.onboarding_history || [];

    const skill = ctx.skill || ctx.session.skill || summary.who_to_teach || '';
    
    const historyText = history
      .slice(-5) // 5 dernières Q/R
      .map((h, idx) => `Q: ${h.question}\nR: ${JSON.stringify(h.answer)}`)
      .join('\n\n');

    // Mapping des fieldName vers des prompts spécifiques
    const questionPrompts = {
      coreSkill: "L'utilisateur doit identifier sa compétence principale à enseigner. Aide-le à être précis.",
      targetAudience: "L'utilisateur doit définir son élève idéal. Aide-le à être ultra-spécifique.",
      mainProblem: "L'utilisateur doit identifier le problème N°1 de ses élèves. Aide-le à trouver LA douleur principale.",
      firstResult: "L'utilisateur doit promettre un résultat rapide. Aide-le à être concret et mesurable.",
      finalTransformation: "L'utilisateur doit décrire la transformation finale. Aide-le à visualiser l'avant/après.",
      uniqueMethod: "L'utilisateur doit expliquer sa méthode unique. Aide-le à se différencier.",
      typicalMistake: "L'utilisateur doit identifier l'erreur typique. Aide-le à être précis.",
      extraDetail: "L'utilisateur doit partager une anecdote ou preuve. Aide-le à être authentique.",
      deliveryPreferences: "L'utilisateur doit choisir ses formats préférés. Aide-le selon son profil."
    };

    const questionContext = questionPrompts[fieldName] || "Aide l'utilisateur à répondre à cette question.";

    const userPrompt = `CONTEXTE UTILISATEUR :
Compétence : ${skill || 'non spécifié'}
Summary actuel : ${JSON.stringify(summary, null, 2)}

Historique récent :
${historyText || 'Aucun historique'}

QUESTION ACTUELLE : ${fieldName} (${questionId})
Contexte : ${questionContext}

GÉNÈRE :
1. helperText : 1-2 phrases courtes, personnalisées avec le contexte ci-dessus
2. examples : 2-3 exemples ultra-concrets adaptés à son profil (si skill="${skill}", exemples liés à cette compétence)

Format JSON strict :
{
  "helperText": "string",
  "examples": ["string", "string", "string"]
}`;

    console.log("OPENAI_CALL start", { fn: "onboardingHelper", sessionId, fieldName, model: "gpt-4o" });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.4,
      max_tokens: 300,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "helper_response",
          strict: true,
          schema: {
            type: "object",
            properties: {
              helperText: { type: "string" },
              examples: {
                type: "array",
                items: { type: "string" },
                minItems: 2,
                maxItems: 3
              }
            },
            required: ["helperText", "examples"],
            additionalProperties: false
          }
        }
      }
    });

    console.log("OPENAI_CALL end", { 
      fn: "onboardingHelper", 
      sessionId, 
      fieldName,
      usage: completion.usage 
    });

    const result = JSON.parse(completion.choices[0].message.content);

    return Response.json({
      helperText: result.helperText,
      examples: result.examples,
      debug: {
        model: "gpt-4o",
        requestId: completion.id || null,
        usage: completion.usage || null
      }
    });

  } catch (error) {
    console.error('Error in onboardingHelper:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});