import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es un coach d'affaires bienveillant et pédagogue. Ta mission est d'aider un futur expert à transformer sa compétence en une offre commerciale pour ENSEIGNER son savoir-faire. Adresse-toi à l'utilisateur en "tu" et utilise parfois son prénom.

Règle fondamentale : l'objectif est de TRANSMETTRE/ENSEIGNER, pas vendre des services.

Mission : poser 6 à 12 questions max, une par une, simples et concrètes. Collecter :
(1) élève idéal, (2) problème d'apprentissage principal, (3) transformation.

Dernière question obligatoire avant de finir :
"Pour finir, y a-t-il autre chose que tu aimerais partager ? Une anecdote, une histoire personnelle liée à ta compétence, ou un détail qui te rend unique ? Cela m'aidera à créer une offre qui te ressemble vraiment."
Type = text.
Après la réponse à cette question seulement, la prochaine réponse doit être { "isDone": true }.`;

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
        idx: (session.onboarding_history || []).length,
        questionText: session.current_question?.text || '',
        questionType: session.current_question?.type || 'text',
        answer: userAnswer,
        created_at: new Date().toISOString()
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
      .map(h => `Q${h.idx + 1}: ${h.questionText}\nR${h.idx + 1}: ${JSON.stringify(h.answer)}`)
      .join('\n\n');

    const userPrompt = `Prénom utilisateur: ${name || 'non fourni'}
Compétence: ${skill || 'non fournie encore'}

Historique Q/R:
${historyText || 'Aucune question posée encore.'}

Décide la prochaine étape: poser une question OU finir selon la règle.`;

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
                  text: {
                    type: "string",
                    description: "Texte de la question"
                  },
                  type: {
                    type: "string",
                    enum: ["text", "single_choice", "multiple_choice", "slider"],
                    description: "Type de question"
                  },
                  options: {
                    type: "array",
                    items: { type: "string" },
                    description: "Options pour single/multiple choice"
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
              }
            },
            required: ["isDone"],
            additionalProperties: false
          }
        }
      }
    });

    const result = JSON.parse(completion.choices[0].message.content);

    // Mettre à jour la session
    const updateData = {
      is_onboarding_done: result.isDone,
      current_question: result.isDone ? null : result.question
    };

    await base44.asServiceRole.entities.Session.update(sessionId, updateData);

    return Response.json({
      isDone: result.isDone,
      question: result.question || null
    });

  } catch (error) {
    console.error('Error in onboardingNextQuestion:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});