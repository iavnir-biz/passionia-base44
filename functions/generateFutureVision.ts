import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';
import { getSessionContext } from './getSessionContext.js';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es un coach d'affaires qui projette l'utilisateur dans SA vie future.

Mission : créer une narration ultra-personnalisée de sa vie dans X mois (selon targetIncomeDelay).

RÈGLES CRITIQUES :
1. REPRENDS EXACTEMENT les mots de lifeChangeStory, lifestyleGoals, emotionalBenefits, relativesThoughts
2. Utilise revenueGoal + selectedProducts pour ancrer dans le concret
3. Ton : tu, présent de narration ("Tu te réveilles...", "Ton compte...")
4. 3-5 paragraphes maximum
5. Pas de bullshit générique type "tu es libre", "tu vis de ta passion" SAUF si c'est dans lifeChangeStory

Exemple :
"Dans 6 mois, tu te réveilles et ton compte affiche 3 247€ ce mois-ci. Tes 47 élèves actifs apprennent [skill] avec ton système [method_angle]. [Reprendre lifeChangeStory]. [Reprendre emotionalBenefits]. [Reprendre relativesThoughts si dispo]."`;

Deno.serve(async (req) => {
  try {
    const { sessionId, totalMonthly, revenueGoal, selectedProducts } = await req.json();

    if (!sessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }

    const ctx = await getSessionContext(req, sessionId);
    const summary = ctx.onboarding_summary || {};
    const full = ctx.session.onboarding_full || {};
    const skill = ctx.skill || ctx.session.skill || summary.who_to_teach || '';

    const delay = full.targetIncomeDelay || '6 mois';
    const lifeChange = full.lifeChangeStory || '';
    const lifestyle = full.lifestyleGoals || '';
    const emotions = full.emotionalBenefits || '';
    const relatives = full.relativesThoughts || '';
    const targetIncome = full.targetIncome || revenueGoal || totalMonthly || '';

    const productsText = selectedProducts 
      ? JSON.stringify(selectedProducts, null, 2) 
      : 'Produit principal + upsells';

    const userPrompt = `CONTEXTE UTILISATEUR :
Compétence : ${skill}
Méthode unique : ${summary.method_angle || 'non spécifié'}
Quick win : ${summary.quick_win || 'non spécifié'}
Grande transformation : ${summary.big_transformation || 'non spécifié'}

Délai : ${delay}
Revenu cible : ${targetIncome}
Revenu mensuel projeté : ${totalMonthly || 'non spécifié'}

Produits sélectionnés :
${productsText}

DONNÉES PERSONNELLES (UTILISE-LES EXPLICITEMENT) :
- Histoire de vie souhaitée : "${lifeChange}"
- Style de vie souhaité : "${lifestyle}"
- Bénéfices émotionnels : "${emotions}"
- Ce que pensent les proches : "${relatives}"

MISSION :
Écris une narration de SA VIE FUTURE dans ${delay}.
- Commence par une scène concrète (réveil, compte bancaire, élèves actifs)
- REPRENDS TEXTUELLEMENT des morceaux de lifeChange, lifestyle, emotions, relatives
- Ancre avec les chiffres : ${totalMonthly}/mois, ${revenueGoal} objectif
- Ton : tu, présent de narration, 3-5 paragraphes max
- Pas de phrases vides, que du concret tiré de SES réponses

Format JSON strict :
{
  "narrativeText": "string (narration complète)"
}`;

    console.log("OPENAI_CALL start", { fn: "generateFutureVision", sessionId, model: "gpt-4o-mini" });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.5,
      max_tokens: 800,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "future_vision",
          strict: true,
          schema: {
            type: "object",
            properties: {
              narrativeText: { type: "string" }
            },
            required: ["narrativeText"],
            additionalProperties: false
          }
        }
      }
    });

    console.log("OPENAI_CALL end", { 
      fn: "generateFutureVision", 
      sessionId, 
      usage: completion.usage 
    });

    const result = JSON.parse(completion.choices[0].message.content);

    const usedKeys = Object.keys(full).filter(k => full[k]);

    return Response.json({
      narrativeText: result.narrativeText,
      debug: {
        model: "gpt-4o-mini",
        requestId: completion.id || null,
        usage: completion.usage || null,
        usedKeys,
        dataUsed: {
          lifeChange: !!lifeChange,
          lifestyle: !!lifestyle,
          emotions: !!emotions,
          relatives: !!relatives,
          delay,
          targetIncome
        }
      }
    });

  } catch (error) {
    console.error('Error in generateFutureVision:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});