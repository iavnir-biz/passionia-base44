import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

// Structure des 11 questions à suivre STRICTEMENT
const QUESTION_STRUCTURE = [
  { 
    id: 1, 
    field: "coreSkill", 
    theme: "Compétence à monétiser", 
    type: "text",
    titleTemplate: "Salut {{firstName}} ! Pour commencer, quelle est la compétence, la passion, le savoir-faire (ou même le talent) que tu aimerais transformer en revenu et enseigner ?",
    subtitleTemplate: "Sois précis. Ex : peindre des aquarelles, conseiller en décoration intérieure, consulting RH, créer un programme de fitness maison."
  },
  { 
    id: 2, 
    field: "experienceLevel", 
    theme: "Niveau d'expérience", 
    type: "single_choice", 
    options: ["C'est une passion, je débute", "J'ai déjà aidé des amis / proches (gratuitement)", "Je suis un professionnel / J'ai déjà eu des clients"],
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
    titleTemplate: "D'accord. Depuis combien d'années pratiques-tu {{coreSkill}} ?",
    subtitleTemplate: "Même si c'est approximatif, donne une estimation."
  },
  { 
    id: 4, 
    field: "targetAudience", 
    theme: "À qui enseigner", 
    type: "text",
    titleTemplate: "Top. À qui aimerais-tu le plus enseigner {{coreSkill}}, {{firstName}} ?",
    subtitleTemplate: "Ex : débutants motivés, personnes qui reprennent après une pause, gens qui veulent une méthode simple et structurée."
  },
  { 
    id: 5, 
    field: "mainProblem", 
    theme: "Problème #1 de l'élève", 
    type: "text",
    titleTemplate: "Quel est le problème N°1 que cette personne rencontre en apprenant {{coreSkill}}… et que toi tu peux résoudre ?",
    subtitleTemplate: "Ex : manque de temps pour pratiquer, peur de mal faire, difficulté à rester régulier, confusion sur quoi faire en premier."
  },
  { 
    id: 6, 
    field: "firstQuickResult", 
    theme: "Premier résultat rapide", 
    type: "text",
    titleTemplate: "Quel est le tout premier résultat concret et rapide que ton élève obtiendra grâce à ton enseignement de {{coreSkill}} ?",
    subtitleTemplate: "Ex : un plan clair pour démarrer, une première victoire en 30 minutes, une routine simple, une méthode \"pas à pas\"."
  },
  { 
    id: 7, 
    field: "finalTransformation", 
    theme: "Transformation finale", 
    type: "text",
    titleTemplate: "Et à la fin, quelle grande transformation vivra ton élève grâce à toi en {{coreSkill}} ?",
    subtitleTemplate: "Ex : gagner en confiance, devenir autonome, atteindre un résultat visible, intégrer {{coreSkill}} dans son quotidien durablement."
  },
  { 
    id: 8, 
    field: "mainTeaching", 
    theme: "Le plus important à apprendre", 
    type: "text",
    titleTemplate: "Quelle est LA chose la plus importante que tu vas lui apprendre en {{coreSkill}} ?",
    subtitleTemplate: "Ex : la liberté d'expérimenter, une méthode simple, les fondamentaux, comment corriger ses erreurs rapidement."
  },
  { 
    id: 9, 
    field: "uniqueMethod", 
    theme: "Méthode unique", 
    type: "text",
    titleTemplate: "As-tu une méthode ou une façon d'enseigner {{coreSkill}} qui te rend différent(e) ?",
    subtitleTemplate: "Ex : ta méthode en 3 étapes, ton approche \"sans pression\", un système de progression, une routine hebdo."
  },
  { 
    id: 10, 
    field: "typicalMistake", 
    theme: "Erreur typique", 
    type: "text",
    titleTemplate: "Quelle est l'erreur typique que les débutants font en {{coreSkill}} et que tu aides à éviter ?",
    subtitleTemplate: "Ex : vouloir aller trop vite, se comparer aux autres, s'éparpiller, abandonner faute de plan clair."
  },
  { 
    id: 11, 
    field: "extraDetail", 
    theme: "Détail personnel", 
    type: "text",
    titleTemplate: "Pour finir : y a-t-il autre chose que tu veux partager ? Une anecdote, une histoire perso, un détail qui te rend unique.",
    subtitleTemplate: "Ex : ton déclic, ton parcours, une difficulté que tu as surmontée, pourquoi tu veux transmettre aujourd'hui."
  }
];

const SYSTEM_PROMPT = `Tu es Nova, le coach IA de Passion IA. Tu es inspirant, motivant, mais tu vas droit au but.

Mission : aider l'utilisateur à transformer sa compétence en offre éducative.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 RÈGLES ABSOLUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Tu poses EXACTEMENT 11 questions (structure QUESTION_STRUCTURE)
2. Chaque question a un titleTemplate et subtitleTemplate FIXES fournis
3. Tu DOIS générer 2 champs séparés :
   - "title" : le titre de la question (1-2 phrases MAX)
   - "subtitle" : le sous-titre (1 phrase + exemples concrets)
4. CRITICAL: Tu personnalises OBLIGATOIREMENT avec {{firstName}} ET {{coreSkill}} dans CHAQUE question
   - Remplace {{firstName}} par le prénom réel
   - Remplace {{coreSkill}} par la compétence/passion EXACTE de l'utilisateur (ex: "le piano", "la photographie", "le yoga")
   - JAMAIS de texte générique comme "ta compétence" ou "ce que tu enseignes"
5. Tu NE reformules PAS les templates, tu les utilises en remplaçant juste les variables
6. Ton = conversationnel mais concis, pas de blabla

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 CE QUE TU FAIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Prends le titleTemplate et subtitleTemplate de la question en cours
- Remplace {{firstName}} par le prénom si dispo (sinon supprime)
- Remplace {{coreSkill}} par la compétence si dispo (sinon garde "ta compétence")
- Retourne ces textes dans "title" et "subtitle" de la question
- Garde les exemples concrets du subtitleTemplate

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 INTERDICTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ PAS de reformulation complète des templates
❌ PAS de titre trop long (max 2 phrases)
❌ PAS d'invention de questions hors structure
❌ PAS de subtitle vide (toujours inclure les exemples)

CLÉS DU SUMMARY à remplir progressivement :
1. who_to_teach : élève idéal
2. learner_profile : profil détaillé de l'apprenant
3. main_learning_problem : problème d'apprentissage principal
4. quick_win : premier résultat rapide promis
5. big_transformation : transformation finale apportée
6. method_angle : méthode ou approche unique
7. common_mistake : erreur typique à éviter
8. proof_or_story : histoire/preuve personnelle
9. format_preferences : formats préférés (array)

LOGIQUE :
- Utilise QUESTION_STRUCTURE pour savoir quelle question poser (basé sur le nombre de questions déjà posées)
- Prends les templates titleTemplate et subtitleTemplate de la question
- OBLIGATOIRE: Remplace {{firstName}} par le prénom ET {{coreSkill}} par la compétence exacte dans TOUTES les questions
- Si coreSkill pas encore défini, utilise "ta passion" ou "ton savoir-faire" temporairement
- MET À JOUR le summary complet à chaque réponse
- isDone=true UNIQUEMENT après avoir posé les 11 questions

MAPPING DES FIELDS VERS LE SUMMARY :
- coreSkill → who_to_teach
- targetAudience, experienceLevel → learner_profile  
- mainProblem → main_learning_problem
- firstQuickResult → quick_win
- finalTransformation → big_transformation
- uniqueMethod, mainTeaching → method_angle
- typicalMistake → common_mistake
- extraDetail → proof_or_story

Tu retournes TOUJOURS un JSON avec :
Si isDone=false:
{
  "isDone": false,
  "question": {
    "title": "string (titre personnalisé avec prénom/compétence)",
    "subtitle": "string (sous-titre avec exemples)",
    "text": "string (même contenu que title pour compatibilité)",
    "type": "text|single_choice|multiple_choice|slider",
    "options": ["string"] (si type=single_choice ou multiple_choice, OBLIGATOIRE),
    "min": number, "max": number, "step": number (si type=slider, OBLIGATOIRE)
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

IMPORTANT : 
- "title" et "subtitle" sont OBLIGATOIRES
- "text" = copie de "title" (pour rétrocompatibilité)
- Inclure "options" si type=single_choice/multiple_choice
- Inclure "min", "max", "step" si type=slider

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
        // Convertir answer en string pour éviter erreurs de validation
        let answerValue = userAnswer;
        if (typeof answerValue === 'number') {
          answerValue = String(answerValue);
        } else if (Array.isArray(answerValue)) {
          answerValue = answerValue.join(', ');
        }
        
        history.push({
          question: currentQuestion.text,
          type: currentQuestion.type,
          answer: answerValue,
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

    // Déterminer quelle question poser (basé sur l'index)
    const nextQuestionIndex = history.length; // 0-based
    const nextQuestionConfig = nextQuestionIndex < QUESTION_STRUCTURE.length 
      ? QUESTION_STRUCTURE[nextQuestionIndex] 
      : null;

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
- Nombre de questions posées : ${history.length}/11
- Prochaine question à poser : ${nextQuestionConfig ? `#${nextQuestionConfig.id} - ${nextQuestionConfig.theme}` : 'TERMINÉ'}
- Clés remplies dans summary : ${Object.keys(summary).filter(k => summary[k] && (typeof summary[k] === 'string' ? summary[k].trim() : true)).join(', ') || 'aucune'}

${nextQuestionConfig ? `PROCHAINE QUESTION À POSER :
Question #${nextQuestionConfig.id} : ${nextQuestionConfig.theme}
Type : ${nextQuestionConfig.type}
${nextQuestionConfig.options ? `Options : ${JSON.stringify(nextQuestionConfig.options)}` : ''}
${nextQuestionConfig.min !== undefined ? `Slider: min=${nextQuestionConfig.min}, max=${nextQuestionConfig.max}, step=${nextQuestionConfig.step}` : ''}

TEMPLATES À UTILISER :
titleTemplate: "${nextQuestionConfig.titleTemplate}"
subtitleTemplate: "${nextQuestionConfig.subtitleTemplate}"

MISSION :
1. Prends le titleTemplate et remplace {{firstName}} par "${name}" et {{coreSkill}} par "${skill || 'ta compétence'}"
2. Prends le subtitleTemplate et utilise-le tel quel (avec les exemples)
3. Retourne ces textes dans les champs "title" et "subtitle" de la question
4. Copie "title" dans "text" aussi
5. Inclus les options/min/max/step selon le type
6. Mets à jour le summary en mappant ${nextQuestionConfig.field} vers les bonnes clés` : 
'MISSION : Les 11 questions ont été posées. Retourne isDone=true avec le summary complet final.'}`;

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
          strict: false,
          schema: {
            type: "object",
            properties: {
              isDone: { type: "boolean" },
              question: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  subtitle: { type: "string" },
                  text: { type: "string" },
                  type: { 
                    type: "string",
                    enum: ["text", "single_choice", "multiple_choice", "slider"]
                  },
                  options: {
                    type: "array",
                    items: { type: "string" }
                  },
                  min: { type: "number" },
                  max: { type: "number" },
                  step: { type: "number" }
                },
                required: ["title", "subtitle", "text", "type"]
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
                required: ["who_to_teach", "learner_profile", "main_learning_problem", "quick_win", "big_transformation", "method_angle", "common_mistake", "proof_or_story", "format_preferences"]
              }
            },
            required: ["isDone", "summary"]
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

    // Extraire le skill depuis summary.who_to_teach pour le sauvegarder dans session.skill
    const updatedSkill = result.summary?.who_to_teach || session.skill || '';
    
    // Mettre à jour la session avec le summary complet
    const updateData = {
      onboarding_history: history,
      onboarding_summary: result.summary, // Summary complet du LLM
      is_onboarding_done: result.isDone,
      current_question: result.isDone ? null : result.question,
      skill: updatedSkill
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