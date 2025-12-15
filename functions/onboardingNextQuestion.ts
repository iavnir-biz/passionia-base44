import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es un coach d'affaires bienveillant et pédagogue qui a une VRAIE conversation avec l'utilisateur.

Mission : transformer sa compétence en offre éducative pour ENSEIGNER son savoir-faire (pas vendre des services).

STYLE CONVERSATIONNEL OBLIGATOIRE :
- Commence chaque question par une micro phrase qui rebondit sur la réponse précédente
- Ex: "Ok, donc tu veux aider X à faire Y. Maintenant, dis-moi..."
- Ex: "Super ! J'adore cette approche. Du coup..."
- Ex: "Intéressant ! Et concrètement..."
- JAMAIS de ton formulaire froid
- Tutoie et utilise le prénom quand dispo

RÈGLES :
- 6 à 12 questions MAX
- Une question à la fois, simple et concrète
- Objectif : remplir progressivement le summary avec 8 clés essentielles
- Dernière question OBLIGATOIRE : "Pour finir, y a-t-il autre chose que tu aimerais partager ? Une anecdote, une histoire personnelle liée à ta compétence, ou un détail qui te rend unique ?"

8 CLÉS DU SUMMARY :
1. who_to_teach : élève idéal
2. learner_profile : profil détaillé de l'apprenant
3. main_learning_problem : problème d'apprentissage principal
4. quick_win : premier résultat rapide promis
5. big_transformation : transformation finale apportée
6. method_angle : méthode ou approche unique
7. common_mistake : erreur typique à éviter
8. proof_or_story : histoire/preuve personnelle
9. format_preferences : formats préférés (array)

IMPORTANT :
- À CHAQUE réponse, tu MET À JOUR le summary complet avec les nouvelles infos
- Tu déduis intelligemment les clés même si pas demandées directement
- Tu NE répètes JAMAIS une question déjà posée
- isDone=true UNIQUEMENT si les 8 clés essentielles sont remplies ET la question finale "Pour finir" a été posée

Tu retournes TOUJOURS un JSON avec :
Si isDone=false:
{
  "isDone": false,
  "question": {
    "text": "string (avec phrase de transition conversationnelle)",
    "type": "text|single_choice|multiple_choice|slider",
    "options": ["string"] (si type=single_choice ou multiple_choice),
    "min": number, "max": number, "step": number (si type=slider)
  },
  "summary": {
    "who_to_teach": "string",
    "learner_profile": "string",
    "main_learning_problem": "string",
    "quick_win": "string",
    "big_transformation": "string",
    "method_angle": "string",
    "common_mistake": "string",
    "proof_or_story": "string",
    "format_preferences": ["string"]
  }
}

Si isDone=true:
{
  "isDone": true,
  "summary": { ... même structure ... }
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
    const skill = session.skill || user.coreSkill || '';

    // Si userAnswer fourni, l'ajouter à l'historique
    if (userAnswer !== undefined && userAnswer !== null) {
      const currentQuestion = session.current_question;
      
      if (currentQuestion) {
        history.push({
          question: currentQuestion.text,
          type: currentQuestion.type,
          answer: userAnswer,
          at: new Date().toISOString()
        });
      }
    }

    // Construire le contexte pour le LLM
    const name = user.firstName || user.full_name || '';
    
    const historyText = history
      .map((h, idx) => `Q${idx + 1}: ${h.question}\nR${idx + 1}: ${JSON.stringify(h.answer)}`)
      .join('\n\n');

    // Dernière question/réponse pour relance naturelle
    const lastEntry = history.length > 0 ? history[history.length - 1] : null;
    const lastQA = lastEntry 
      ? `\n\nDERNIÈRE INTERACTION (utilise-la pour faire une relance naturelle) :\nQuestion précédente : ${lastEntry.question}\nRéponse de l'utilisateur : ${JSON.stringify(lastEntry.answer)}`
      : '';

    // Anti-répétition : 3 dernières questions
    const recentQuestions = history
      .slice(-3)
      .map(h => h.question)
      .filter(q => q);

    // Check si question finale posée
    const finalQuestionAsked = history.some(h => h.question && h.question.includes('Pour finir'));

    const userPrompt = `CONTEXTE UTILISATEUR :
Prénom : ${name || 'non fourni'}
Compétence principale : ${skill || 'non fournie encore'}

SUMMARY ACTUEL (à enrichir progressivement) :
${JSON.stringify(summary, null, 2)}

HISTORIQUE COMPLET DES Q/R :
${historyText || 'Aucune question posée encore.'}
${lastQA}

${recentQuestions.length > 0 ? `ATTENTION - Questions récentes (ne les repose pas) :
${recentQuestions.map((q, i) => `- ${q}`).join('\n')}
` : ''}

ÉTAT :
- Nombre de questions posées : ${history.length}
- Clés remplies dans summary : ${Object.keys(summary).filter(k => summary[k] && (typeof summary[k] === 'string' ? summary[k].trim() : true)).join(', ') || 'aucune'}
- Question finale "Pour finir" posée : ${finalQuestionAsked ? 'OUI' : 'NON'}

MISSION :
${lastEntry ? '1. Commence ta prochaine question par UNE PHRASE DE TRANSITION qui rebondit naturellement sur la dernière réponse' : '1. Commence par une question accueillante'}
2. Pose LA question suivante pour enrichir le summary
3. Retourne le summary COMPLET et MIS À JOUR (déduis intelligemment les infos des réponses)
4. isDone=true UNIQUEMENT si toutes les 8 clés essentielles sont remplies ET question finale posée`;

    console.log("OPENAI_CALL start", { fn: "onboardingNextQuestion", sessionId, model: "gpt-4o-mini" });
    
    // Appel OpenAI avec structured output
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "onboarding_response",
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
                          type: { type: "string", const: "text" }
                        },
                        required: ["text", "type"],
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
                          }
                        },
                        required: ["text", "type", "options"],
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
                          }
                        },
                        required: ["text", "type", "options"],
                        additionalProperties: false
                      },
                      {
                        properties: {
                          text: { type: "string" },
                          type: { type: "string", const: "slider" },
                          min: { type: "number" },
                          max: { type: "number" },
                          step: { type: "number" }
                        },
                        required: ["text", "type", "min", "max", "step"],
                        additionalProperties: false
                      }
                    ]
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
                    required: ["who_to_teach", "learner_profile", "main_learning_problem", "quick_win", "big_transformation", "method_angle", "common_mistake", "proof_or_story", "format_preferences"],
                    additionalProperties: false
                  }
                },
                required: ["isDone", "question", "summary"],
                additionalProperties: false
              },
              {
                properties: {
                  isDone: { type: "boolean", const: true },
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
                    required: ["who_to_teach", "learner_profile", "main_learning_problem", "quick_win", "big_transformation", "method_angle", "common_mistake", "proof_or_story", "format_preferences"],
                    additionalProperties: false
                  }
                },
                required: ["isDone", "summary"],
                additionalProperties: false
              }
            ]
          }
        }
      }
    });

    console.log("OPENAI_CALL end", { 
      fn: "onboardingNextQuestion", 
      sessionId, 
      usage: completion.usage 
    });

    const result = JSON.parse(completion.choices[0].message.content);

    // Mettre à jour la session avec le summary complet
    const updateData = {
      onboarding_history: history,
      onboarding_summary: result.summary, // Summary complet du LLM
      is_onboarding_done: result.isDone,
      current_question: result.isDone ? null : result.question
    };

    await base44.asServiceRole.entities.Session.update(sessionId, updateData);

    return Response.json({
      isDone: result.isDone,
      question: result.isDone ? null : result.question,
      summary: result.summary,
      debug: {
        model: "gpt-4o-mini",
        requestId: completion.id || null,
        usage: completion.usage || null
      }
    });

  } catch (error) {
    console.error('Error in onboardingNextQuestion:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});