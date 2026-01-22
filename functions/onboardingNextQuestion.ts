import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Anthropic from 'npm:@anthropic-ai/sdk@0.32.1';

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

// Structure des questions (entre 6 et 11 questions maximum)
const QUESTION_STRUCTURE = [
  {
    id: 1,
    field: "coreSkill",
    theme: "La compétence à enseigner",
    type: "text",
    category: "introduction",
    titleTemplate: "Salut {{firstName}} ! Quelle est la compétence ou le savoir-faire que tu aimerais enseigner pour créer des revenus en ligne ?",
    subtitleTemplate: "Sois précis. Ex : photographie de portrait, yoga pour débutants, création de sites web, cuisine végétarienne."
  },
  {
    id: 2,
    field: "experienceLevel",
    theme: "Niveau d'expérience",
    type: "single_choice",
    options: ["C'est une passion, je débute", "J'ai déjà aidé des amis gratuitement", "Je suis pro, j'ai déjà eu des clients"],
    category: "introduction",
    titleTemplate: "Quel est ton niveau d'expérience dans {{coreSkill}} ?",
    subtitleTemplate: "Choisis l'option qui te correspond le mieux."
  },
  {
    id: 3,
    field: "yearsPracticing",
    theme: "Années de pratique",
    type: "slider",
    min: 0,
    max: 15,
    step: 1,
    category: "introduction",
    titleTemplate: "Depuis combien d'années pratiques-tu {{coreSkill}} ?",
    subtitleTemplate: "Même si tu débutes, ton expérience a de la valeur."
  },
  {
    id: 4,
    field: "targetAudience",
    theme: "L'élève idéal",
    type: "text",
    category: "client_ideal",
    titleTemplate: "À qui aimerais-tu le plus enseigner {{coreSkill}}, {{firstName}} ?",
    subtitleTemplate: "Pense à la personne qui a vraiment besoin de ce que tu sais."
  },
  {
    id: 5,
    field: "mainProblem",
    theme: "Problème d'apprentissage",
    type: "text",
    category: "client_ideal",
    titleTemplate: "Quel est le problème N°1 que cette personne rencontre dans son apprentissage et que tu peux l'aider à résoudre ?",
    subtitleTemplate: "Ex : ne sait pas par où commencer, a peur de se tromper, manque de confiance."
  },
  {
    id: 6,
    field: "firstQuickResult",
    theme: "Premier résultat rapide",
    type: "text",
    category: "solution_transformation",
    titleTemplate: "Quel est le tout premier résultat concret et rapide que ton élève obtiendra grâce à ton enseignement ?",
    subtitleTemplate: "Un petit succès qui va le motiver à continuer."
  },
  {
    id: 7,
    field: "finalTransformation",
    theme: "Transformation finale",
    type: "text",
    category: "solution_transformation",
    titleTemplate: "Et à la fin, quel grand changement ou transformation aura vécu ton élève ?",
    subtitleTemplate: "Pense au résultat final idéal. Comment se sentira-t-il ? Que saura-t-il faire ?"
  },
  {
    id: 8,
    field: "mainTeaching",
    theme: "Enseignement principal",
    type: "text",
    category: "solution_transformation",
    titleTemplate: "Quelle est LA chose la plus importante que tu vas lui apprendre ?",
    subtitleTemplate: "Le principe clé, la prise de conscience essentielle."
  },
  {
    id: 9,
    field: "uniqueMethod",
    theme: "Approche pédagogique",
    type: "text",
    category: "approche_pedagogique",
    titleTemplate: "As-tu une méthode ou une façon d'enseigner qui te rend différent des autres ?",
    subtitleTemplate: "Si tu n'es pas encore sûr(e), tu peux répondre 'Je ne sais pas encore'."
  },
  {
    id: 10,
    field: "typicalMistake",
    theme: "Erreur courante",
    type: "text",
    category: "approche_pedagogique",
    titleTemplate: "Quelle est l'erreur typique que les débutants font dans ton domaine et que tu aides à éviter ?",
    subtitleTemplate: "Cette fausse croyance qui les bloque."
  },
  {
    id: 11,
    field: "extraDetail",
    theme: "Histoire personnelle",
    type: "text",
    category: "authenticite",
    titleTemplate: "Pour finir, y a-t-il autre chose que tu aimerais partager ?",
    subtitleTemplate: "Une anecdote, une histoire personnelle liée à ta compétence, ou un détail qui te rend unique ? Cela m'aidera à créer une offre qui te ressemble vraiment."
  }
];

const SYSTEM_PROMPT = `Tu es Noah, un coach d'affaires bienveillant et pédagogue.

Ta mission est d'aider un futur expert à transformer sa compétence en une offre commerciale pour **ENSEIGNER son savoir-faire**. Tu t'adresses à l'utilisateur avec "tu" et utilises son prénom de temps en temps.

**ATTENTION - RÈGLE FONDAMENTALE :**
L'objectif de l'utilisateur est de **TRANSMETTRE SON SAVOIR-FAIRE** pour créer des revenus en ligne (formations, coachings, ebooks, etc.). Tes questions doivent TOUJOURS être orientées pour l'aider à **ENSEIGNER** sa compétence, et NON à la vendre comme un service.

Par exemple :
- ❌ Si sa compétence est "photographe de mode", NE LUI DEMANDE PAS pour quel type de magazine il veut travailler
- ✅ Au lieu de ça, demande-lui : "À quel type d'apprenti photographe aimerais-tu enseigner tes techniques ?"

**TA MISSION :**
- Tu ne remplis pas un formulaire, tu mènes une VRAIE conversation intelligente
- **RÈGLE D'OR : SIMPLICITÉ ET CONCRET.** Chaque question doit être très facile à comprendre. Évite le jargon.
- Ton but est de collecter assez d'informations sur (1) le **futur élève** (le client cible), (2) son problème principal **d'apprentissage**, et (3) la solution/transformation **qu'il obtiendra en apprenant**.
- Tu reformules la question en t'appuyant sur ce que l'utilisateur vient de dire
- Tu montres que tu as VRAIMENT compris sa réponse précédente

**RÈGLE DE COHÉRENCE :**
Chaque fois que tu donnes un exemple entre parenthèses pour guider l'utilisateur, cet exemple DOIT être directement et logiquement lié à sa compétence et à l'idée d'enseigner. N'utilise JAMAIS d'exemples génériques ou sans rapport.

**STRUCTURE DE TA RÉPONSE :**
1. Commence par montrer que tu as compris (1 phrase max, naturelle et encourageante)
2. Pose UNE question claire qui découle logiquement de sa réponse
3. Parle du PROBLÈME de ses futurs élèves ou de leur TRANSFORMATION, jamais de l'outil technique

**TON & STYLE :**
- Simple, clair, encourageant. Utilise "tu"
- Langage simple, vivant, humain
- Phrases courtes et directes
- Sois curieux mais va droit au but
- Questions qui pourraient être posées dans une vraie discussion
- Zéro jargon, zéro formalisme

**INTERDICTIONS :**
❌ Reformuler mot pour mot le template
❌ Répéter exactement ce que l'utilisateur a dit
❌ Être générique ou scolaire
❌ Ignorer le contexte de la réponse précédente
❌ Parler de vendre un service au lieu d'enseigner

**TEST QUALITÉ :**
"Est-ce que cette question pourrait être posée par un humain bienveillant dans une vraie conversation ?"
Si non → reformule.

**FORMAT DE SORTIE (JSON uniquement) :**
{
  "text": "la question reformulée, naturelle et contextuelle",
  "subtitle": "1 phrase d'exemples concrets, spécifiques et pertinents par rapport à sa compétence"
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

    // Pour les questions de type choice, slider, OU la première question (pas de contexte), pas besoin d'appeler Claude
    if (nextQuestion.type === 'single_choice' || nextQuestion.type === 'slider' || nextQuestionIndex === 0) {
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

Catégorie de cette question : ${nextQuestion.category}
Thème : ${nextQuestion.theme}

Template de base (à reformuler de manière NATURELLE et CONTEXTUELLE) :
Titre : ${nextQuestion.titleTemplate}
Sous-titre : ${nextQuestion.subtitleTemplate}

Variables disponibles :
- firstName: ${firstName || 'non renseigné'}
- coreSkill (ce qu'il veut enseigner): ${summary.who_to_teach || 'non renseigné'}
- targetAudience (à qui il veut enseigner): ${summary.learner_profile || 'non renseigné'}

MISSION :
1. Reformule cette question de manière naturelle, en montrant que tu as compris sa dernière réponse
2. Rends la question fluide, comme si tu étais dans une vraie conversation avec un ami
3. CRUCIAL : Dans le sous-titre, donne des exemples concrets SPÉCIFIQUES à la compétence "${summary.who_to_teach || 'la compétence'}" et au contexte d'ENSEIGNER (pas de vendre un service)

Par exemple, si la compétence est "photographie de portrait" et qu'on demande l'élève idéal :
- ✅ BON exemple dans subtitle : "ex: quelqu'un qui débute en photo et veut apprendre à capturer l'émotion, ou un amateur qui veut progresser dans l'éclairage de portrait"
- ❌ MAUVAIS exemple : "ex: les magazines de mode, les agences de publicité" (ça c'est vendre un service, pas enseigner)

Retourne UNIQUEMENT un JSON avec cette structure :
{
  "text": "la question reformulée, naturelle et contextuelle",
  "subtitle": "1 phrase d'exemples concrets et spécifiques à la compétence, orientés enseignement"
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


