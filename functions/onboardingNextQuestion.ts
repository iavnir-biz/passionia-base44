import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es un coach d'affaires bienveillant et pédagogue. Ta mission est d'aider un futur expert à transformer sa compétence en une offre commerciale pour ENSEIGNER son savoir-faire. Adresse-toi à l'utilisateur en "tu" et utilise parfois son prénom.

Règle fondamentale : l'objectif est de TRANSMETTRE/ENSEIGNER, pas vendre des services.

Mission : poser 6 à 12 questions max, une par une, simples et concrètes. Collecter :
(1) élève idéal, (2) problème d'apprentissage principal, (3) transformation, (4) méthode unique, (5) quick win, (6) erreur typique, (7) histoire/preuve personnelle.

Dernière question obligatoire avant de finir :
"Pour finir, y a-t-il autre chose que tu aimerais partager ? Une anecdote, une histoire personnelle liée à ta compétence, ou un détail qui te rend unique ? Cela m'aidera à créer une offre qui te ressemble vraiment."
Type = text.
Après la réponse à cette question seulement, isDone doit être true.

Importante : TOUJOURS personnaliser les exemples et questions avec la compétence de l'utilisateur quand elle est connue.

Tu dois retourner un JSON avec :
- isDone (boolean)
- question (object si isDone=false, contient text, type, options?, min?, max?, step?)
- summary (object avec who_to_teach, learner_profile, main_learning_problem, quick_win, big_transformation, method_angle, common_mistake, proof_or_story, format_preferences)`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, userAnswer } = await req.json();

    if (!sessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }

    // Récupérer la session
    const sessions = await base44.asServiceRole.entities.Session.filter({ id: sessionId });
    if (!sessions || sessions.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    let session = sessions[0];

    // Si userAnswer fourni, l'ajouter à l'historique
    if (userAnswer !== undefined && userAnswer !== null) {
      const historyEntry = {
        question: session.current_question?.text || '',
        type: session.current_question?.type || 'text',
        answer: userAnswer,
        at: new Date().toISOString()
      };

      const updatedHistory = [...(session.onboarding_history || []), historyEntry];
      
      await base44.asServiceRole.entities.Session.update(sessionId, {
        onboarding_history: updatedHistory
      });

      session.onboarding_history = updatedHistory;
    }

    // Construire le contexte pour le LLM
    const name = user.firstName || user.full_name || '';
    const skill = user.coreSkill || '';
    
    const historyText = (session.onboarding_history || [])
      .map((h, idx) => `Q${idx + 1}: ${h.question}\nR${idx + 1}: ${JSON.stringify(h.answer)}`)
      .join('\n\n');

    const currentSummary = session.onboarding_summary || {};

    // Anti-répétition : 3 dernières questions
    const recentQuestions = (session.onboarding_history || [])
      .slice(-3)
      .map(h => h.question)
      .filter(q => q);

    const userPrompt = `Prénom utilisateur: ${name || 'non fourni'}
Compétence: ${skill || 'non fournie encore'}

Mémoire actuelle (summary):
${JSON.stringify(currentSummary, null, 2)}

Historique Q/R:
${historyText || 'Aucune question posée encore.'}

${recentQuestions.length > 0 ? `ATTENTION - Ne repose pas une question équivalente aux 3 dernières :
${recentQuestions.map((q, i) => `- ${q}`).join('\n')}
` : ''}
Décide la prochaine étape: poser une question OU finir selon la règle.
IMPORTANT: Mets à jour le summary avec les nouvelles informations extraites des réponses.`;

    // Appel OpenAI avec structured output
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "onboarding_response",
          strict: true,
          schema: {
            type: "object",
            properties: {
              isDone: {
                type: "boolean",
                description: "True si l'onboarding est terminé"
              },
              question: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  type: {
                    type: "string",
                    enum: ["text", "single_choice", "multiple_choice", "slider"],
                    description: "Type de question"
                  },
                  options: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 2,
                    description: "Options pour single_choice ou multiple_choice (min 2)"
                  },
                  min: { 
                    type: "number",
                    description: "Valeur min pour slider"
                  },
                  max: { 
                    type: "number",
                    description: "Valeur max pour slider"
                  },
                  step: { 
                    type: "number",
                    description: "Pas pour slider"
                  }
                },
                required: ["text", "type"],
                additionalProperties: false
              },
              summary: {
                type: "object",
                properties: {
                  who_to_teach: { type: "string" },
                  learner_profile: { type: "string" },
                  main_learning_problem: { type: "string" },
                  quick_win: { type: "string" },
                  big_transformation: { type: "string" },
                  method_angle: { type: "string" },
                  common_mistake: { type: "string" },
                  proof_or_story: { type: "string" },
                  format_preferences: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: [],
                additionalProperties: false
              }
            },
            required: ["isDone", "summary"],
            additionalProperties: false,
            if: {
              properties: { isDone: { const: false } }
            },
            then: {
              required: ["isDone", "summary", "question"]
            }
          }
        }
      }
    });

    const result = JSON.parse(completion.choices[0].message.content);

    // Validation post-LLM
    if (!result.isDone && result.question) {
      const qType = result.question.type;
      
      // Valider options pour single/multiple choice
      if ((qType === 'single_choice' || qType === 'multiple_choice') && 
          (!result.question.options || result.question.options.length < 2)) {
        throw new Error('Options required for single/multiple choice with at least 2 items');
      }
      
      // Valider slider
      if (qType === 'slider') {
        if (result.question.min === undefined || result.question.max === undefined || result.question.step === undefined) {
          throw new Error('min, max, step required for slider');
        }
        if (result.question.min >= result.question.max) {
          throw new Error('slider: min must be < max');
        }
      }
    }

    // Mettre à jour la session
    const updateData = {
      onboarding_summary: result.summary || {},
      is_onboarding_done: result.isDone,
      current_question: result.isDone ? null : result.question
    };

    await base44.asServiceRole.entities.Session.update(sessionId, updateData);

    return Response.json({
      isDone: result.isDone,
      question: result.question || null,
      summary: result.summary || {}
    });

  } catch (error) {
    console.error('Error in onboardingNextQuestion:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});