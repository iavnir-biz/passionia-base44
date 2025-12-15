import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';
import { getSessionContext } from './getSessionContext.js';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es un expert en analyse de marché e-learning et monétisation de compétences.

RÈGLE CRITIQUE : Tu dois baser tes choix sur onboarding_summary en priorité.
Si une info manque, pose l'hypothèse la plus raisonnable MAIS reste cohérent avec le summary.
Tu n'as pas le droit d'ignorer le summary.`;

Deno.serve(async (req) => {
  try {
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }

    const ctx = await getSessionContext(req, sessionId);
    const summary = ctx.onboarding_summary;

    const userPrompt = `Contexte utilisateur :
- Compétence/Passion : ${ctx.skill || summary.who_to_teach || 'non renseignée'}
- Public cible (élèves) : ${summary.who_to_teach || summary.learner_profile || 'non renseigné'}
- Problème principal des élèves : ${summary.main_learning_problem || 'non renseigné'}
- Transformation promise : ${summary.big_transformation || 'non renseignée'}
- Quick win : ${summary.quick_win || 'non renseigné'}

Génère une analyse de marché personnalisée avec :

1. validationText : Un texte de 3-4 phrases PERSONNALISÉ qui valide le marché de l'utilisateur. Le texte doit :
   - Mentionner directement sa compétence "${ctx.skill}"
   - Parler de l'enseignement de cette compétence (pas de vente de services)
   - Rassurer sur le potentiel de monétisation via l'enseignement
   - Être motivant et encourageant
   - Mentionner des tendances actuelles du e-learning
   - Rester professionnel et crédible

2. marketScores : Un objet avec 5 scores (entre 70 et 95) adaptés à la compétence :
   - elearningMarket : Taille du marché e-learning pour cette compétence
   - digitalDemand : Demande numérique croissante
   - recurringRevenue : Potentiel de revenus récurrents
   - globalAccess : Accessibilité globale
   - techEase : Facilité technique & outils modernes

Les scores doivent être réalistes et cohérents avec la compétence déclarée.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 600,
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
                  elearningMarket: { type: "number" },
                  digitalDemand: { type: "number" },
                  recurringRevenue: { type: "number" },
                  globalAccess: { type: "number" },
                  techEase: { type: "number" }
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

    const result = JSON.parse(completion.choices[0].message.content);

    // Debug info
    const summaryKeysFilled = Object.keys(summary).filter(k => summary[k] && summary[k] !== '');

    return Response.json({
      ...result,
      debug: {
        usedSummary: true,
        summaryKeysFilled: summaryKeysFilled,
        skill: ctx.skill
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