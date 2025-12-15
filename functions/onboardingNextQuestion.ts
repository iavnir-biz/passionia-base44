import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es un coach d'affaires bienveillant et pédagogue. Ta mission est d'aider un futur expert à transformer sa compétence en une offre commerciale pour ENSEIGNER son savoir-faire. Adresse-toi à l'utilisateur en "tu" et utilise parfois son prénom.

Règle fondamentale : l'objectif est de TRANSMETTRE/ENSEIGNER, pas vendre des services.

Mission : poser 6 à 12 questions max, une par une, simples et concrètes. Collecter :
(1) élève idéal, (2) problème d'apprentissage principal, (3) transformation, (4) méthode unique, (5) quick win, (6) erreur typique, (7) histoire/preuve personnelle, (8) formats préférés.

Dernière question obligatoire avant de finir :
"Pour finir, y a-t-il autre chose que tu aimerais partager ? Une anecdote, une histoire personnelle liée à ta compétence, ou un détail qui te rend unique ? Cela m'aidera à créer une offre qui te ressemble vraiment."
Type = text.
nextSummaryKey = proof_or_story.
Après la réponse à cette question seulement, isDone doit être true.

Importante : TOUJOURS personnaliser les exemples et questions avec la compétence de l'utilisateur quand elle est connue.

RÈGLES STRICTES :
- Ne répète jamais une question déjà posée. Utilise d'abord le summary pour décider.
- Si le summary est incomplet, pose une question qui comble le champ manquant.
- Vérifie l'historique des questions avant de poser une nouvelle question.
- isDone peut être true UNIQUEMENT si la question finale "Pour finir" a été posée ET répondue.

Tu dois retourner un JSON avec :
Si isDone=false:
{
  "isDone": false,
  "question": {
    "text": "string",
    "type": "text|single_choice|multiple_choice|slider",
    "options": ["string"] (si type=single_choice ou multiple_choice),
    "min": number, "max": number, "step": number (si type=slider),
    "nextSummaryKey": "who_to_teach|learner_profile|main_learning_problem|quick_win|big_transformation|method_angle|common_mistake|proof_or_story|format_preferences"
  }
}

Si isDone=true:
{
  "isDone": true
}`;

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
    const history = session.onboarding_history || [];
    const summary = session.onboarding_summary || {};

    // Si userAnswer fourni, l'ajouter à l'historique et au summary
    if (userAnswer !== undefined && userAnswer !== null) {
      const currentQuestion = session.current_question;
      
      if (currentQuestion) {
        history.push({
          question: currentQuestion.text,
          type: currentQuestion.type,
          answer: userAnswer,
          at: new Date().toISOString()
        });

        // Update summary if nextSummaryKey exists
        if (currentQuestion.nextSummaryKey) {
          let valueToStore = userAnswer;
          
          // Transform to array for format_preferences
          if (currentQuestion.nextSummaryKey === 'format_preferences' && typeof userAnswer === 'string') {
            valueToStore = userAnswer
              .split(',')
              .map(s => s.trim())
              .filter(s => s.length > 0);
          }
          
          summary[currentQuestion.nextSummaryKey] = valueToStore;
        }
      }
    }

    // Check if mandatory final question must be asked
    const essentialKeys = ['who_to_teach', 'learner_profile', 'main_learning_problem', 'quick_win', 'big_transformation', 'method_angle', 'common_mistake', 'format_preferences'];
    const allEssentialKeysFilled = essentialKeys.every(k => summary[k]);
    const finalQuestionAsked = history.some(h => h.question && h.question.includes('Pour finir'));
    
    // Force final question if all essentials are filled but final question not asked yet
    if (allEssentialKeysFilled && !finalQuestionAsked) {
      const forcedQuestion = {
        text: "Pour finir, y a-t-il autre chose que tu aimerais partager ? Une anecdote, une histoire personnelle liée à ta compétence, ou un détail qui te rend unique ? Cela m'aidera à créer une offre qui te ressemble vraiment.",
        type: "text",
        nextSummaryKey: "proof_or_story"
      };
      
      await base44.asServiceRole.entities.Session.update(sessionId, {
        onboarding_history: history,
        onboarding_summary: summary,
        current_question: forcedQuestion,
        is_onboarding_done: false
      });
      
      return Response.json({
        isDone: false,
        question: forcedQuestion,
        summary
      });
    }

    // Construire le contexte pour le LLM
    const name = user.firstName || user.full_name || '';
    const skill = user.coreSkill || '';
    
    const historyText = history
      .map((h, idx) => `Q${idx + 1}: ${h.question}\nR${idx + 1}: ${JSON.stringify(h.answer)}`)
      .join('\n\n');

    // Anti-répétition : 3 dernières questions
    const recentQuestions = history
      .slice(-3)
      .map(h => h.question)
      .filter(q => q);

    const userPrompt = `Prénom utilisateur: ${name || 'non fourni'}
Compétence: ${skill || 'non fournie encore'}

Mémoire actuelle (summary):
${JSON.stringify(summary, null, 2)}

Historique Q/R:
${historyText || 'Aucune question posée encore.'}

${recentQuestions.length > 0 ? `ATTENTION - Ne repose pas une question équivalente aux 3 dernières :
${recentQuestions.map((q, i) => `- ${q}`).join('\n')}
` : ''}

Contexte:
- Nombre de questions posées: ${history.length}
- Clés remplies dans summary: ${Object.keys(summary).filter(k => summary[k]).join(', ') || 'aucune'}
- Question finale "Pour finir" posée: ${finalQuestionAsked ? 'OUI' : 'NON'}

Décide la prochaine étape: poser une question OU finir selon la règle.
RAPPEL CRITIQUE: isDone=true UNIQUEMENT si toutes les clés essentielles sont remplies ET la question finale a été posée.`;

    // Appel OpenAI avec structured output
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 600,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "onboarding_decision",
          strict: true,
          schema: {
            type: "object",
            oneOf: [
              {
                properties: {
                  isDone: { type: "boolean", const: false },
                  question: {
                    type: "object",
                    oneOf: [
                      {
                        properties: {
                          text: { type: "string" },
                          type: { type: "string", const: "text" },
                          nextSummaryKey: { 
                            type: "string",
                            enum: ["who_to_teach", "learner_profile", "main_learning_problem", "quick_win", "big_transformation", "method_angle", "common_mistake", "proof_or_story", "format_preferences"]
                          }
                        },
                        required: ["text", "type", "nextSummaryKey"],
                        additionalProperties: false
                      },
                      {
                        properties: {
                          text: { type: "string" },
                          type: { type: "string", const: "single_choice" },
                          options: {
                            type: "array",
                            items: { type: "string" },
                            minItems: 2
                          },
                          nextSummaryKey: { 
                            type: "string",
                            enum: ["who_to_teach", "learner_profile", "main_learning_problem", "quick_win", "big_transformation", "method_angle", "common_mistake", "proof_or_story", "format_preferences"]
                          }
                        },
                        required: ["text", "type", "options", "nextSummaryKey"],
                        additionalProperties: false
                      },
                      {
                        properties: {
                          text: { type: "string" },
                          type: { type: "string", const: "multiple_choice" },
                          options: {
                            type: "array",
                            items: { type: "string" },
                            minItems: 2
                          },
                          nextSummaryKey: { 
                            type: "string",
                            enum: ["who_to_teach", "learner_profile", "main_learning_problem", "quick_win", "big_transformation", "method_angle", "common_mistake", "proof_or_story", "format_preferences"]
                          }
                        },
                        required: ["text", "type", "options", "nextSummaryKey"],
                        additionalProperties: false
                      },
                      {
                        properties: {
                          text: { type: "string" },
                          type: { type: "string", const: "slider" },
                          min: { type: "number" },
                          max: { type: "number" },
                          step: { type: "number" },
                          nextSummaryKey: { 
                            type: "string",
                            enum: ["who_to_teach", "learner_profile", "main_learning_problem", "quick_win", "big_transformation", "method_angle", "common_mistake", "proof_or_story", "format_preferences"]
                          }
                        },
                        required: ["text", "type", "min", "max", "step", "nextSummaryKey"],
                        additionalProperties: false
                      }
                    ]
                  }
                },
                required: ["isDone", "question"],
                additionalProperties: false
              },
              {
                properties: {
                  isDone: { type: "boolean", const: true }
                },
                required: ["isDone"],
                additionalProperties: false
              }
            ]
          }
        }
      }
    });

    const result = JSON.parse(completion.choices[0].message.content);

    // Mettre à jour la session
    const updateData = {
      onboarding_history: history,
      onboarding_summary: summary,
      is_onboarding_done: result.isDone,
      current_question: result.isDone ? null : result.question
    };

    await base44.asServiceRole.entities.Session.update(sessionId, updateData);

    return Response.json({
      isDone: result.isDone,
      question: result.isDone ? null : result.question,
      summary
    });

  } catch (error) {
    console.error('Error in onboardingNextQuestion:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});