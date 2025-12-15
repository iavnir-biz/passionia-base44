import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';
import { getSessionContext } from './getSessionContext.js';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es un coach de vie et expert en projection de succès entrepreneurial dans l'enseignement en ligne.

RÈGLE CRITIQUE : Tu dois baser tes choix sur onboarding_summary en priorité.
Si une info manque, pose l'hypothèse la plus raisonnable MAIS reste cohérent avec le summary.
Tu n'as pas le droit d'ignorer le summary.

L'utilisateur veut ENSEIGNER sa compétence, pas vendre des services.`;

Deno.serve(async (req) => {
  try {
    const { sessionId, totalMonthly, revenueGoal, selectedProducts } = await req.json();
    
    if (!sessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }

    const ctx = await getSessionContext(req, sessionId);
    const summary = ctx.onboarding_summary;

    const userPrompt = `Contexte utilisateur :
- Compétence/Passion : ${ctx.skill || summary.who_to_teach || 'non renseignée'}
- Public cible (élèves idéaux) : ${summary.who_to_teach || summary.learner_profile || 'non renseigné'}
- Problème principal des élèves : ${summary.main_learning_problem || 'non renseigné'}
- Transformation finale promise aux élèves : ${summary.big_transformation || 'non renseignée'}
- Quick win pour les élèves : ${summary.quick_win || 'non renseigné'}
- Méthode/approche unique : ${summary.method_angle || 'non renseignée'}
- Histoire personnelle : ${summary.proof_or_story || 'non renseignée'}
- Objectif de revenus : ${revenueGoal || 500}€/mois
- Revenu potentiel calculé : ${totalMonthly || 0}€/mois

Produits sélectionnés pour l'offre d'enseignement :
${selectedProducts ? JSON.stringify(selectedProducts, null, 2) : 'non renseignés'}

Rédige un texte narratif immersif et inspirant (4-5 paragraphes) qui projette l'utilisateur dans sa vie future en tant qu'enseignant/formateur.

Le texte doit :
- Commencer par une scène de vie concrète (ex: "Imagine-toi, dans 6 mois...")
- Être à la 2ème personne du singulier (tu)
- Mentionner directement sa compétence "${ctx.skill}"
- Intégrer des éléments concrets : revenus d'enseignement, élèves transformés, impact pédagogique, liberté
- Être émotionnel mais réaliste
- Parler de l'impact sur ses élèves/apprenants
- Évoquer le sentiment de fierté d'avoir transmis son savoir
- Terminer sur une note motivante et actionnable

Ton : doux, émotionnel, inspirant, réaliste, motivant.
Pas de promesses irréalistes, mais une vision concrète et atteignable d'une activité d'enseignement.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.4,
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
    console.error('Error in generateFutureVision:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});