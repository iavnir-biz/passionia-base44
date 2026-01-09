import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

// Structure des 11 questions à suivre STRICTEMENT
// 🧠 P1 : Chaque question a un "transformation_focus" qui guide la reformulation
const QUESTION_STRUCTURE = [
  { 
    id: 1, 
    field: "coreSkill", 
    theme: "Compétence à monétiser", 
    type: "text",
    transformation_focus: "identification_passion", // P1
    titleTemplate: "Salut {{firstName}} ! Quelle est la compétence, la passion ou le savoir-faire que tu aimerais transformer en revenu et enseigner ?",
    subtitleTemplate: "Sois précis. Ex : peindre des aquarelles, conseiller en décoration intérieure, consulting RH, créer un programme de fitness maison."
  },
  { 
    id: 2, 
    field: "experienceLevel", 
    theme: "Niveau d'expérience", 
    type: "single_choice", 
    options: ["C'est une passion, je débute", "J'ai déjà aidé des amis ou proches gratuitement", "Je suis professionnel, j'ai déjà eu des clients"],
    transformation_focus: "légitimité_à_enseigner", // P1
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
    transformation_focus: "ancrage_expertise", // P1
    titleTemplate: "D'accord. Depuis combien d'années pratiques-tu {{coreSkill}} ?",
    subtitleTemplate: "Même si c'est approximatif, donne une estimation honnête."
  },
  { 
    id: 4, 
    field: "targetAudience", 
    theme: "À qui enseigner", 
    type: "text",
    transformation_focus: "identification_élève_idéal", // P1
    titleTemplate: "À qui aimerais-tu le plus transmettre ce savoir, {{firstName}} ?",
    subtitleTemplate: "Pense à des personnes qui ont un vrai besoin, pas juste un intérêt passager."
  },
  { 
    id: 5, 
    field: "mainProblem", 
    theme: "Problème #1 de l'élève", 
    type: "text",
    transformation_focus: "désorganisation_confusion_blocage", // P1 - le VRAI problème AVANT d'avoir une méthode
    titleTemplate: "Qu'est-ce qui bloque ces personnes AVANT même qu'elles aient une méthode ?",
    subtitleTemplate: "Pas le manque de compétence, mais le vrai frein : confusion, peur, désorganisation, manque de clarté..."
  },
  { 
    id: 6, 
    field: "firstQuickResult", 
    theme: "Premier résultat rapide", 
    type: "text",
    transformation_focus: "première_victoire_soulagement", // P1 - déclic émotionnel
    titleTemplate: "Quel sera leur premier déclic ? Le moment où ils se diront « ça y est, j'ai compris » ?",
    subtitleTemplate: "Ce moment de soulagement où tout devient plus clair, plus simple."
  },
  { 
    id: 7, 
    field: "finalTransformation", 
    theme: "Transformation finale", 
    type: "text",
    transformation_focus: "changement_identité_autonomie", // P1 - nouvelle version de soi
    titleTemplate: "Et à la fin, qui seront-ils devenus grâce à toi ?",
    subtitleTemplate: "Pas juste une compétence acquise, mais une vraie transformation : confiance, autonomie, nouvelle identité."
  },
  { 
    id: 8, 
    field: "mainTeaching", 
    theme: "Le plus important à apprendre", 
    type: "text",
    transformation_focus: "principe_clé_déclic", // P1 - le concept central
    titleTemplate: "Quelle est LA prise de conscience qui change tout pour eux ?",
    subtitleTemplate: "Le principe clé, le déclic mental qui fait la différence entre stagner et progresser."
  },
  { 
    id: 9, 
    field: "uniqueMethod", 
    theme: "Méthode unique", 
    type: "text",
    transformation_focus: "approche_différenciante", // P1
    titleTemplate: "Comment tu t'y prends différemment des autres pour obtenir ces résultats ?",
    subtitleTemplate: "Ta façon à toi, ton approche, ce qui rend ton enseignement unique. Si tu ne sais pas encore, écris « je ne sais pas encore »."
  },
  { 
    id: 10, 
    field: "typicalMistake", 
    theme: "Erreur typique", 
    type: "text",
    transformation_focus: "erreur_racine_faux_raisonnement", // P1 - la VRAIE cause d'échec
    titleTemplate: "Quelle erreur de raisonnement fait perdre du temps aux débutants ?",
    subtitleTemplate: "Pas juste une erreur technique, mais une fausse croyance, un mauvais réflexe qui sabote leur progression."
  },
  { 
    id: 11, 
    field: "extraDetail", 
    theme: "Détail personnel", 
    type: "text",
    transformation_focus: "histoire_personnelle_authenticité", // P1
    titleTemplate: "Pour finir : qu'est-ce qui t'a donné envie de transmettre ça ?",
    subtitleTemplate: "Un déclic, une galère surmontée, une envie profonde... Ce qui rend ton projet personnel."
  }
];

const SYSTEM_PROMPT = `Tu es Noah, coach stratégique humain et pédagogue.

Tu discutes avec un futur formateur qui veut TRANSMETTRE son savoir-faire.
Tu ne remplis pas un formulaire.
Tu mènes une vraie conversation intelligente.

RÈGLE ABSOLUE :
L'utilisateur n'enseigne jamais un outil.
Il aide ses élèves à passer d'un état de confusion à un état de clarté, d'autonomie ou de maîtrise.

Ta mission est simple :
Reformuler la prochaine question comme le ferait un humain expert,
en t'appuyant sur ce que l'utilisateur vient de dire.

Tu dois :
- Montrer que tu as compris sa réponse (1 phrase max)
- Poser UNE question claire et naturelle
- Parler du PROBLÈME ou de la TRANSFORMATION, jamais de l'outil
- Utiliser un langage simple, vivant, humain

Interdictions :
- Reformuler mot pour mot
- Répéter la compétence
- Être générique
- Être scolaire

Test qualité :
"Est-ce que cette question pourrait être posée dans une vraie discussion ?"
Si non → reformule.

Tu retournes UNIQUEMENT :
{
  "text": "la question reformulée",
  "subtitle": "1 phrase d'exemples concrets et parlants"
}
Rien d'autre.`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { sessionId, userAnswer, firstName } = await req.json();

    if (!sessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }

    // 🔥 ÉTAPE 1 : Sauvegarder d'abord la réponse si présente
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
        ? currentQuestionConfig.titleTemplate.replace('{{firstName}}', firstName || '').replace('{{coreSkill}}', workingSummary.who_to_teach || 'cette compétence')
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

      const coreSkill = workingHistory.length === 0 ? normalizedAnswer : (workingSummary.who_to_teach || '');
      
      const updatePayload = {
        onboarding_history: updatedHistory,
        skill: coreSkill
      };
      
      if (workingHistory.length === 0) {
        updatePayload.onboarding_full = { coreSkill: normalizedAnswer };
      }

      await base44.asServiceRole.entities.Session.update(sessionId, updatePayload);

      console.log('💾 [SAVE FIRST]', {
        sessionId,
        questionIndex: workingHistory.length,
        newHistoryLength: updatedHistory.length,
        skill: coreSkill
      });
    }

    // 🔥 ÉTAPE 2 : Recharger la session APRÈS sauvegarde
    const sessions = await base44.asServiceRole.entities.Session.filter({ id: sessionId });
    if (!sessions || sessions.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    const currentSession = sessions[0];
    const workingHistory = currentSession.onboarding_history || [];
    const workingSummary = currentSession.onboarding_summary || {};
    
    const name = firstName || '';
    const skill = workingSummary.who_to_teach || '';

    const nextQuestionIndex = workingHistory.length;

    console.log('🔍 [RELOAD AFTER SAVE]', {
      sessionId,
      historyLength: workingHistory.length,
      nextQuestionIndex,
      hasUserAnswer: !!userAnswer
    });

    // 🚀 P0 FIX : Q1 instantané SANS OpenAI (déterministe)
    if (!userAnswer && nextQuestionIndex === 0) {
      const q1 = QUESTION_STRUCTURE[0];
      console.log('✅ [P0 INSTANT Q1] Retour Q1 sans OpenAI', {
        sessionId,
        questionType: q1.type,
        noOpenAI: true
      });
      
      return Response.json({
        isDone: false,
        question: {
          title: q1.titleTemplate.replace('{{firstName}}', name || ''),
          subtitle: q1.subtitleTemplate,
          text: q1.titleTemplate.replace('{{firstName}}', name || ''),
          type: q1.type,
          placeholder: q1.placeholder || '',
          options: q1.options || []
        },
        summary: workingSummary
      });
    }

    // Note: l'ajout de l'answer à l'historique est géré côté frontend
    
    const historyText = workingHistory
      .map((h, idx) => `Q${idx + 1}: ${h.question}\nR${idx + 1}: ${JSON.stringify(h.answer)}`)
      .join('\n\n');

    // Dernière question/réponse pour relance naturelle
    const lastEntry = workingHistory.length > 0 ? workingHistory[workingHistory.length - 1] : null;
    const lastQA = lastEntry 
      ? `\n\nDERNIÈRE INTERACTION (utilise-la pour faire une relance naturelle) :\nQuestion précédente : ${lastEntry.question}\nRéponse de l'utilisateur : ${JSON.stringify(lastEntry.answer)}`
      : '';

    // Anti-répétition : 3 dernières questions
    const recentQuestions = workingHistory
      .slice(-3)
      .map(h => h.question)
      .filter(q => q);

    if (nextQuestionIndex >= QUESTION_STRUCTURE.length) {
      console.log('✅ [ONBOARDING COMPLETE]', { sessionId, totalQuestions: QUESTION_STRUCTURE.length });
      return Response.json({
        isDone: true,
        summary: workingSummary
      });
    }

    const nextQuestionConfig = QUESTION_STRUCTURE[nextQuestionIndex];
    
    // 🛡️ HELPER : Construire question déterministe depuis structure
    const buildDeterministicQuestion = (config, userName, userSkill) => {
      return {
        title: config.titleTemplate.replace('{{firstName}}', userName || '').replace('{{coreSkill}}', userSkill || 'cette compétence'),
        subtitle: config.subtitleTemplate.replace('{{firstName}}', userName || '').replace('{{coreSkill}}', userSkill || 'cette compétence'),
        text: config.titleTemplate.replace('{{firstName}}', userName || '').replace('{{coreSkill}}', userSkill || 'cette compétence'),
        type: config.type,
        placeholder: config.placeholder || '',
        options: config.options || [],
        min: config.min,
        max: config.max,
        step: config.step
      };
    };

    let questionToReturn = buildDeterministicQuestion(nextQuestionConfig, name, skill);
    let updatedSummary = { ...workingSummary };

    // 🧠 P1 : Récupérer le focus de transformation pour cette question
    const transformationFocus = nextQuestionConfig?.transformation_focus || '';
    
    // 🔮 P2 : Construire le contexte pour la micro-reformulation
    const lastAnswer = lastEntry?.answer || '';
    const previousContext = workingHistory.length >= 2 
      ? workingHistory.slice(-2).map(h => `Q: ${h.question?.substring(0, 50)}... → R: ${JSON.stringify(h.answer)?.substring(0, 80)}...`).join('\n')
      : '';

    const userPrompt = `CONTEXTE UTILISATEUR :
Prénom : ${name || 'non fourni'}
Compétence principale : ${skill || 'non fournie encore'}

SUMMARY ACTUEL (à enrichir progressivement) :
${JSON.stringify(workingSummary, null, 2)}

HISTORIQUE COMPLET DES Q/R :
${historyText || 'Aucune question posée encore.'}
${lastQA}

${recentQuestions.length > 0 ? `ATTENTION - Questions récentes (ne les repose pas) :
${recentQuestions.map((q, i) => `- ${q}`).join('\n')}
` : ''}

ÉTAT :
- Nombre de questions déjà posées : ${workingHistory.length}
- Prochaine question à poser : ${nextQuestionConfig ? `#${nextQuestionConfig.id} - ${nextQuestionConfig.theme}` : 'TERMINÉ'}
- Clés remplies dans summary : ${Object.keys(workingSummary).filter(k => workingSummary[k] && (typeof workingSummary[k] === 'string' ? workingSummary[k].trim() : true)).join(', ') || 'aucune'}

⚠️ IMPORTANT : Tu peux t'arrêter AVANT la question 11 si tu as collecté TOUTES les informations nécessaires dans le summary :
- who_to_teach (compétence)
- learner_profile (public cible + niveau expérience)
- main_learning_problem (problème principal)
- quick_win (premier résultat)
- big_transformation (transformation finale)
- method_angle (méthode unique)
- common_mistake (erreur typique)
- proof_or_story (histoire personnelle)

Si TOUTES ces clés sont remplies ET pertinentes, tu peux renvoyer isDone: true même avant Q11.

${nextQuestionConfig ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 PROCHAINE QUESTION À POSER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Question #${nextQuestionConfig.id} : ${nextQuestionConfig.theme}
Type : ${nextQuestionConfig.type}
${nextQuestionConfig.options ? `Options : ${JSON.stringify(nextQuestionConfig.options)}` : ''}
${nextQuestionConfig.min !== undefined ? `Slider: min=${nextQuestionConfig.min}, max=${nextQuestionConfig.max}, step=${nextQuestionConfig.step}` : ''}

🧠 FOCUS DE TRANSFORMATION (P1) : "${transformationFocus}"
👉 Ce focus guide ta reformulation. La question doit explorer ce thème de transformation chez l'ÉLÈVE.

📝 TEMPLATE DE BASE (à personnaliser) :
titleTemplate: "${nextQuestionConfig.titleTemplate}"
subtitleTemplate: "${nextQuestionConfig.subtitleTemplate}"

${workingHistory.length >= 2 ? `📌 CONTEXTE RÉCENT POUR MICRO-REFORMULATION (P2) :
Dernière réponse : "${lastAnswer}"
${previousContext}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 MISSION POUR CETTE QUESTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${nextQuestionConfig.id >= 3 ? `1. 🪞 MICRO-REFORMULATION MIROIR (P2) — OBLIGATOIRE
   Commence par une phrase qui montre que tu as COMPRIS ce que l'utilisateur a dit.
   
   Exemples adaptés au focus "${transformationFocus}" :
   - "Ce que je comprends, c'est que tu veux aider des gens qui [situation spécifique]..."
   - "OK, donc le vrai enjeu pour tes futurs élèves, c'est [problème identifié]..."
   - "Intéressant — tu as déjà [expérience mentionnée] et tu veux aller plus loin..."
   
   ⚠️ Cette phrase doit être SPÉCIFIQUE à la dernière réponse "${lastAnswer?.substring(0, 100)}..."
   ⚠️ Pas de phrase générique type "C'est super !"

2. ` : '1. '}🔄 REFORMULATION ORIENTÉE TRANSFORMATION (P0) — CRITIQUE
   Ta question doit être centrée sur la TRANSFORMATION de l'élève, PAS sur l'outil/compétence.
   
   🧪 AUTO-TEST :
   - Est-ce que je pourrais poser cette question SANS citer "${skill}" ? → OUI = bien formulé
   - Est-ce que ça parle du PROBLÈME/RÉSULTAT/TRANSFORMATION de l'élève ? → OUI = bien formulé
   
   Focus actuel : "${transformationFocus}"
   
   ❌ INTERDIT : "Quel est le problème en ${skill} ?"
   ✅ OBLIGATOIRE : "Qu'est-ce qui bloque ces personnes AVANT même d'avoir une méthode ?"

${nextQuestionConfig.id >= 3 ? '3' : '2'}. 💡 EXEMPLES ULTRA-SPÉCIFIQUES dans le subtitle
   Les exemples doivent refléter le FOCUS de transformation "${transformationFocus}"
   ET être spécifiques au domaine "${skill || 'la compétence'}"
   
   ❌ Générique : "manque de temps, peur de mal faire"
   ✅ Spécifique : exemples concrets du domaine "${skill}" liés à "${transformationFocus}"

${nextQuestionConfig.id >= 3 ? '4' : '3'}. 🎨 TON NATUREL ET HUMAIN
   - Varie les formulations (pas toujours "Super ${name}")
   - Conversation proche, parfois avec humour
   - Montre que tu COMPRENDS vraiment la passion de "${name}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 FORMAT ATTENDU DU TITLE (Q${nextQuestionConfig.id})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${nextQuestionConfig.id >= 3 ? `"[Micro-reformulation miroir 1 phrase]. [Question orientée transformation]"

Exemple pour Q${nextQuestionConfig.id} avec focus "${transformationFocus}" :
"Ce que je comprends, c'est que [reformulation spécifique]. [Question sur ${transformationFocus}] ?"` : 
`"[Accusé de réception varié]. [Question orientée transformation]"

Exemple : "Génial ${name} ! [Question sur ${transformationFocus}] ?"`}

⚠️ CRITIQUES ABSOLUES :
- Questions CENTRÉES SUR LA TRANSFORMATION de l'élève (pas sur l'outil)
- Micro-reformulation SPÉCIFIQUE à la dernière réponse (Q3+)
- Exemples ULTRA-SPÉCIFIQUES au domaine "${skill}"
- Ton NATUREL, HUMAIN, PROCHE
- VARIE les formulations` : 
'MISSION : Les 11 questions ont été posées. Retourne isDone=true avec le summary complet final.'}`;

    // 🤖 ENRICHISSEMENT OPTIONNEL OPENAI (non bloquant)
    let openaiUsed = false;
    try {
      console.log("OPENAI_CALL start", { fn: "onboardingNextQuestion", sessionId, model: "gpt-4o-mini", questionIndex: nextQuestionIndex });
      
      // Appel OpenAI avec structured output
      const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.65,
      max_tokens: 400,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "question_reformulation",
          strict: true,
          schema: {
            type: "object",
            properties: {
              text: { type: "string" },
              subtitle: { type: "string" }
            },
            required: ["text", "subtitle"],
            additionalProperties: false
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
      openaiUsed = true;

      // Enrichir la question avec la reformulation LLM
      if (result.text) {
        questionToReturn.text = result.text;
        questionToReturn.title = result.text;
      }
      if (result.subtitle) {
        questionToReturn.subtitle = result.subtitle;
      }

      console.log('✅ [OPENAI ENRICHMENT] Success', { sessionId, questionIndex: nextQuestionIndex });

    } catch (aiError) {
      console.warn('⚠️ [OPENAI FALLBACK] Using deterministic question', {
        sessionId,
        questionIndex: nextQuestionIndex,
        error: aiError?.message,
        fallbackUsed: true
      });
      // Continue avec questionToReturn déterministe déjà construit
    }

    // 🔥 GUARDRAIL : Fallback sur QUESTION_STRUCTURE si réponse malformée
    if (openaiUsed) {
      // Ces guardrails ne s'appliquent que si OpenAI a été utilisé
      const needsGuardrail = !questionToReturn.text || 
                             (questionToReturn.type === 'slider' && (questionToReturn.min === undefined || questionToReturn.max === undefined)) ||
                             ((questionToReturn.type === 'single_choice' || questionToReturn.type === 'multiple_choice') && (!questionToReturn.options || questionToReturn.options.length === 0));
      
      if (needsGuardrail) {
        // Fallback text
        if (!questionToReturn.text || questionToReturn.text.trim() === '') {
          questionToReturn = buildDeterministicQuestion(nextQuestionConfig, name, skill);
          console.log('⚠️ [GUARDRAIL] Text fallback appliqué');
        }

        // Fallback slider
        if (questionToReturn.type === 'slider' && (questionToReturn.min === undefined || questionToReturn.max === undefined)) {
          questionToReturn.min = nextQuestionConfig.min;
          questionToReturn.max = nextQuestionConfig.max;
          questionToReturn.step = nextQuestionConfig.step || 1;
          console.log('⚠️ [GUARDRAIL] Slider fallback appliqué');
        }

        // Fallback options
        if ((questionToReturn.type === 'single_choice' || questionToReturn.type === 'multiple_choice') && 
            (!questionToReturn.options || questionToReturn.options.length === 0)) {
          questionToReturn.options = nextQuestionConfig.options || [];
          console.log('⚠️ [GUARDRAIL] Options fallback appliqué');
        }
      }
    }

    // 🔥 METTRE À JOUR LE SUMMARY
    await base44.asServiceRole.entities.Session.update(sessionId, {
      onboarding_summary: updatedSummary,
      is_onboarding_done: false
    });

    console.log('✅ [UPDATE SUMMARY]', { 
      sessionId, 
      questionIndex: nextQuestionIndex,
      summaryKeys: Object.keys(updatedSummary),
      openaiUsed
    });

    return Response.json({
      isDone: false,
      question: questionToReturn,
      summary: updatedSummary,
      _debug: {
        questionIndex: nextQuestionIndex,
        openaiUsed,
        deterministic: !openaiUsed
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