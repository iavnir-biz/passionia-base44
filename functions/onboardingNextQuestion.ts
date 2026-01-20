import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Anthropic from 'npm:@anthropic-ai/sdk@0.32.1';

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

// Structure des 11 questions à suivre STRICTEMENT
const QUESTION_STRUCTURE = [
  { 
    id: 1, 
    field: "coreSkill", 
    theme: "Compétence à monétiser", 
    type: "text",
    transformation_focus: "identification_passion",
    titleTemplate: "Salut {{firstName}} ! Quelle est la compétence, la passion ou le savoir-faire que tu aimerais transformer en revenu et enseigner ?",
    subtitleTemplate: "Sois précis. Ex : peindre des aquarelles, conseiller en décoration intérieure, consulting RH, créer un programme de fitness maison."
  },
  { 
    id: 2, 
    field: "experienceLevel", 
    theme: "Niveau d'expérience", 
    type: "single_choice", 
    options: ["C'est une passion, je débute", "J'ai déjà aidé des amis ou proches gratuitement", "Je suis professionnel, j'ai déjà eu des clients"],
    transformation_focus: "légitimité_à_enseigner",
    titleTemplate: "Super, tu veux enseigner {{coreSkill}}. Dis-moi : quel est ton niveau d'expérience actuel ?",
    subtitleTemplate: "Choisis l'option qui te ressemble le plus."
  },
  { 
    id: 3, 
    field: "yearsPracticing", 
    theme: "Années de pratique", 
    type: "slider", 
    min: 0, 
    max: 15, 
    step: 1,
    transformation_focus: "ancrage_expertise",
    titleTemplate: "Depuis combien d'années pratiques-tu {{coreSkill}} ?",
    subtitleTemplate: "Même si tu débutes, ton parcours a de la valeur. Indique simplement ton niveau réel."
  },
  { 
    id: 4, 
    field: "targetAudience", 
    theme: "À qui enseigner", 
    type: "text",
    transformation_focus: "identification_élève_idéal",
    titleTemplate: "À qui aimerais-tu le plus transmettre ce savoir, {{firstName}} ?",
    subtitleTemplate: "Pense à ceux qui veulent vraiment passer de l'idée à une app concrète, mais se sentent bloqués par la complexité de l'IA ou du codage. Les gens qui veulent entreprendre avec l'IA principalement"
  },
  { 
    id: 5, 
    field: "mainProblem", 
    theme: "Problème principal", 
    type: "text",
    transformation_focus: "blocage_confusion",
    titleTemplate: "Tu veux vraiment aider {{targetAudience}}. Qu'est-ce qui, selon toi, les empêche aujourd'hui de voir clair et d'avancer sereinement ?",
    subtitleTemplate: "Comme la peur de ne pas comprendre les concepts d'IA, la confusion face à la terminologie du codage ou le doute sur leur capacité à gérer un projet."
  },
  { 
    id: 6, 
    field: "firstQuickResult", 
    theme: "Déclic rapide", 
    type: "text",
    transformation_focus: "première_victoire",
    titleTemplate: "Donc, tu veux aider {{targetAudience}} à dépasser leurs peurs. À quel moment penses-tu qu'ils ressentiront leur premier soulagement, ce déclic où tout deviendra plus clair pour eux ?",
    subtitleTemplate: "Comme quand ils réussissent enfin à créer un prototype fonctionnel ou comprennent un concept complexe d'IA avec facilité."
  },
  { 
    id: 7, 
    field: "finalTransformation", 
    theme: "Transformation finale", 
    type: "text",
    transformation_focus: "nouvelle_identité",
    titleTemplate: "Donc, tu veux montrer à tes élèves qu'ils n'ont pas besoin d'être ingénieurs pour créer des applications, juste savoir comment utiliser les bons outils. Au bout du compte, comment imagines-tu leur transformation personnelle et professionnelle ?",
    subtitleTemplate: "Ils pourront passer de novices hésitants à des créateurs confiants, capables de matérialiser leurs idées en applications concrètes."
  },
  { 
    id: 8, 
    field: "mainTeaching", 
    theme: "Prise de conscience clé", 
    type: "text",
    transformation_focus: "principe_central",
    titleTemplate: "Je vois que tu veux vraiment démystifier l'IA et le codage pour les rendre accessibles à tous. Qu'est-ce qui rend ta façon de les enseigner unique, selon toi ?",
    subtitleTemplate: "Comme montrer que coder c'est comme cuisiner avec des recettes simples, ou utiliser des métaphores pour expliquer des concepts techniques."
  },
  { 
    id: 9, 
    field: "uniqueMethod", 
    theme: "Approche unique", 
    type: "text",
    transformation_focus: "différenciation",
    titleTemplate: "Tu veux vraiment simplifier les choses pour ceux qui pensent que coder est hors de portée. Qu'est-ce qui t'a donné envie de montrer que l'IA et le codage peuvent être aussi accessibles que cuisiner avec des recettes simples ?",
    subtitleTemplate: "Peut-être un moment où tu t'es senti bloqué, une réussite inattendue, ou une envie de rendre les choses plus simples pour les autres."
  },
  { 
    id: 10, 
    field: "typicalMistake", 
    theme: "Erreur courante", 
    type: "text",
    transformation_focus: "fausse_croyance",
    titleTemplate: "Quelle erreur de raisonnement fait perdre du temps aux débutants ?",
    subtitleTemplate: "Pense que c'est compliqué, ou qu'il faut trop de budget pouyr y arriver"
  },
  { 
    id: 11, 
    field: "extraDetail", 
    theme: "Histoire personnelle", 
    type: "text",
    transformation_focus: "authenticité",
    titleTemplate: "Pour finir : qu'est-ce qui t'a donné envie de transmettre ça ?",
    subtitleTemplate: "Car j'ai tout perdu, et j'ai creer mes propres app pour des entreprises, et je les aiet revendus beaucoup d'argent, maintenant je bosse d'ou je veux, je creer des apps pour tous les corps de métiers; etc etc"
  }
];

const SYSTEM_PROMPT = `Tu es Noah, un coach stratégique humain, empathique et pédagogue.

Tu discutes avec un futur formateur qui veut TRANSMETTRE son savoir-faire et aider ses futurs élèves.

RÈGLES ABSOLUES :
1. Tu ne remplis pas un formulaire, tu mènes une vraie conversation intelligente
2. L'utilisateur n'enseigne jamais un outil - il aide ses élèves à passer d'un état de confusion à un état de clarté et de maîtrise
3. Tu reformules la question en t'appuyant sur ce que l'utilisateur vient de dire
4. Tu montres que tu as VRAIMENT compris sa réponse précédente

STRUCTURE DE TA RÉPONSE :
1. Commence par montrer que tu as compris (1 phrase max, naturelle)
2. Pose UNE question claire qui découle logiquement de sa réponse
3. Parle du PROBLÈME de ses futurs élèves ou de leur TRANSFORMATION, jamais de l'outil technique

TON & STYLE :
- Langage simple, vivant, humain (tutoiement)
- Phrases courtes et directes
- Questions qui pourraient être posées dans une vraie discussion
- Zéro jargon, zéro formalisme

INTERDICTIONS :
❌ Reformuler mot pour mot le template
❌ Répéter exactement ce que l'utilisateur a dit
❌ Être générique ou scolaire
❌ Ignorer le contexte de la réponse précédente

TEST QUALITÉ :
"Est-ce que cette question pourrait être posée par un humain dans une vraie conversation ?"
Si non → reformule.

FORMAT DE SORTIE (JSON uniquement) :
{
  "text": "la question reformulée, naturelle et contextuelle",
  "subtitle": "1 phrase d'exemples concrets et parlants"
}`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { sessionId, userAnswer, firstName } = await req.json();

    if (!sessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }

    // ÉTAPE 1 : Sauvegarder la réponse si présente
    if (userAnswer) {
      const sessions = await base44.asServiceRole.entities.Session.filter({ id: sessionId });
      if (!sessions || sessions.length === 0) {
        return Response.json({ error: 'Session not found' }, { status: 404 });
      }

      const currentSession = sessions[0];
      const workingHistory = currentSession.onboarding_history || [];
      const workingSummary = currentSession.onboarding_summary || {};

      const normalizedAnswer = typeof userAnswer === 'string' ? userAnswer : JSON.stringify(userAnswer);
      
      const currentQuestionConfig = QUESTION_STRUCTURE[workingHistory.length];
      const questionText = currentQuestionConfig 
        ? currentQuestionConfig.titleTemplate
            .replace('{{firstName}}', firstName || '')
            .replace('{{coreSkill}}', workingSummary.who_to_teach || 'cette compétence')
            .replace('{{targetAudience}}', workingSummary.learner_profile || 'ces personnes')
        : `Question ${workingHistory.length + 1}`;

      const updatedHistory = [
        ...workingHistory,
        {
          question: questionText,
          type: currentQuestionConfig?.type || 'text',
          answer: normalizedAnswer,
          at: new Date().toISOString()
        }
      ];

      const fullData = currentSession.onboarding_full || {};
      const coreSkill = workingHistory.length === 0 
        ? normalizedAnswer 
        : (fullData.coreSkill || workingSummary.who_to_teach || '');

      const updatePayload = {
        onboarding_history: updatedHistory,
        skill: coreSkill
      };
      
      // Mapping spécifique selon la question
      if (workingHistory.length === 0) {
        // Q1: coreSkill
        updatePayload.onboarding_full = { 
          ...(currentSession.onboarding_full || {}),
          coreSkill: normalizedAnswer 
        };
        updatePayload.onboarding_summary = {
          ...(currentSession.onboarding_summary || {}),
          who_to_teach: normalizedAnswer
        };
      } else if (workingHistory.length === 3) {
        // Q4: targetAudience
        updatePayload.onboarding_full = {
          ...(currentSession.onboarding_full || {}),
          targetAudience: normalizedAnswer
        };
        updatePayload.onboarding_summary = {
          ...(currentSession.onboarding_summary || {}),
          learner_profile: normalizedAnswer
        };
      } else if (workingHistory.length === 4) {
        // Q5: mainProblem
        updatePayload.onboarding_full = {
          ...(currentSession.onboarding_full || {}),
          mainProblem: normalizedAnswer
        };
        updatePayload.onboarding_summary = {
          ...(currentSession.onboarding_summary || {}),
          main_learning_problem: normalizedAnswer
        };
      } else if (workingHistory.length === 5) {
        // Q6: firstQuickResult
        updatePayload.onboarding_full = {
          ...(currentSession.onboarding_full || {}),
          firstQuickResult: normalizedAnswer
        };
        updatePayload.onboarding_summary = {
          ...(currentSession.onboarding_summary || {}),
          quick_win: normalizedAnswer
        };
      } else if (workingHistory.length === 6) {
        // Q7: finalTransformation
        updatePayload.onboarding_full = {
          ...(currentSession.onboarding_full || {}),
          finalTransformation: normalizedAnswer
        };
        updatePayload.onboarding_summary = {
          ...(currentSession.onboarding_summary || {}),
          big_transformation: normalizedAnswer
        };
      } else if (workingHistory.length === 7) {
        // Q8: mainTeaching
        updatePayload.onboarding_full = {
          ...(currentSession.onboarding_full || {}),
          mainTeaching: normalizedAnswer
        };
        updatePayload.onboarding_summary = {
          ...(currentSession.onboarding_summary || {}),
          main_teaching: normalizedAnswer
        };
      } else if (workingHistory.length === 8) {
        // Q9: uniqueMethod
        updatePayload.onboarding_full = {
          ...(currentSession.onboarding_full || {}),
          uniqueMethod: normalizedAnswer
        };
        updatePayload.onboarding_summary = {
          ...(currentSession.onboarding_summary || {}),
          method_angle: normalizedAnswer
        };
      } else if (workingHistory.length === 9) {
        // Q10: typicalMistake
        updatePayload.onboarding_full = {
          ...(currentSession.onboarding_full || {}),
          typicalMistake: normalizedAnswer
        };
        updatePayload.onboarding_summary = {
          ...(currentSession.onboarding_summary || {}),
          common_mistake: normalizedAnswer
        };
      } else if (workingHistory.length === 10) {
        // Q11: extraDetail (dernière question)
        updatePayload.onboarding_full = {
          ...(currentSession.onboarding_full || {}),
          extraDetail: normalizedAnswer
        };
        updatePayload.onboarding_summary = {
          ...(currentSession.onboarding_summary || {}),
          proof_or_story: normalizedAnswer
        };
        updatePayload.is_onboarding_done = true;
      }

      await base44.asServiceRole.entities.Session.update(sessionId, updatePayload);
      
      // Si dernière question, pas de prochaine question
      if (workingHistory.length >= 10) {
        return Response.json({
          done: true,
          nextQuestionNumber: null
        });
      }
    }

    // ÉTAPE 2 : Générer la prochaine question
    const sessions = await base44.asServiceRole.entities.Session.filter({ id: sessionId });
    if (!sessions || sessions.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = sessions[0];
    const history = session.onboarding_history || [];
    const summary = session.onboarding_summary || {};
    
    const nextQuestionIndex = history.length;
    
    if (nextQuestionIndex >= QUESTION_STRUCTURE.length) {
      return Response.json({
        done: true,
        nextQuestionNumber: null
      });
    }

    const nextQuestion = QUESTION_STRUCTURE[nextQuestionIndex];
    
    // Pour les questions de type choice ou slider, pas besoin d'appeler Claude
    if (nextQuestion.type === 'single_choice' || nextQuestion.type === 'slider') {
      const staticTitle = nextQuestion.titleTemplate
        .replace('{{firstName}}', firstName || '')
        .replace('{{coreSkill}}', summary.who_to_teach || 'cette compétence')
        .replace('{{targetAudience}}', summary.learner_profile || 'ces personnes');
      
      return Response.json({
        done: false,
        nextQuestion: {
          number: nextQuestionIndex + 1,
          field: nextQuestion.field,
          type: nextQuestion.type,
          title: staticTitle,
          subtitle: nextQuestion.subtitleTemplate,
          options: nextQuestion.options || null,
          min: nextQuestion.min || null,
          max: nextQuestion.max || null,
          step: nextQuestion.step || null
        }
      });
    }

    // Pour les questions de type text, on appelle Claude pour reformulation contextuelle
    const lastAnswer = history.length > 0 ? history[history.length - 1].answer : null;
    const previousContext = history.map(h => `Q: ${h.question}\nR: ${h.answer}`).join('\n\n');

    const userPrompt = `Contexte de la conversation jusqu'à maintenant :
${previousContext}

Dernière réponse de l'utilisateur : "${lastAnswer}"

Transformation focus pour cette question : ${nextQuestion.transformation_focus}

Template de base (à reformuler de manière NATURELLE et CONTEXTUELLE) :
Titre : ${nextQuestion.titleTemplate}
Sous-titre : ${nextQuestion.subtitleTemplate}

Variables disponibles :
- firstName: ${firstName || 'non renseigné'}
- coreSkill (ce qu'il veut enseigner): ${summary.who_to_teach || 'non renseigné'}
- targetAudience (à qui il veut enseigner): ${summary.learner_profile || 'non renseigné'}

MISSION :
Reformule cette question de manière naturelle, en montrant que tu as compris sa dernière réponse.
Rends la question fluide, comme si tu étais dans une vraie conversation.

Retourne UNIQUEMENT un JSON avec cette structure :
{
  "text": "la question reformulée, naturelle et contextuelle",
  "subtitle": "1 phrase d'exemples concrets"
}`;

    console.log("ANTHROPIC_CALL start", { 
      fn: "onboardingNextQuestion", 
      sessionId, 
      model: "claude-sonnet-4-20250514",
      questionNumber: nextQuestionIndex + 1
    });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: userPrompt }
      ]
    });

    console.log("ANTHROPIC_CALL end", { 
      fn: "onboardingNextQuestion", 
      sessionId,
      usage: message.usage
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '{}';
    
    let reformulated;
    try {
      reformulated = JSON.parse(responseText);
    } catch (e) {
      console.error("JSON parse error, using fallback", e);
      reformulated = {
        text: nextQuestion.titleTemplate
          .replace('{{firstName}}', firstName || '')
          .replace('{{coreSkill}}', summary.who_to_teach || 'cette compétence')
          .replace('{{targetAudience}}', summary.learner_profile || 'ces personnes'),
        subtitle: nextQuestion.subtitleTemplate
      };
    }

    return Response.json({
      done: false,
      nextQuestion: {
        number: nextQuestionIndex + 1,
        field: nextQuestion.field,
        type: nextQuestion.type,
        title: reformulated.text,
        subtitle: reformulated.subtitle
      }
    });

  } catch (error) {
    console.error('Error in onboardingNextQuestion:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});


