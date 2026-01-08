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
    titleTemplate: "Salut {{firstName}} ! Quelle est la compétence, la passion ou le savoir-faire que tu aimerais transformer en revenu et enseigner ?",
    subtitleTemplate: "Sois précis. Ex : peindre des aquarelles, conseiller en décoration intérieure, consulting RH, créer un programme de fitness maison."
  },
  { 
    id: 2, 
    field: "experienceLevel", 
    theme: "Niveau d'expérience", 
    type: "single_choice", 
    options: ["C'est une passion, je débute", "J'ai déjà aidé des amis ou proches gratuitement", "Je suis professionnel, j'ai déjà eu des clients"],
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
    subtitleTemplate: "Même si c'est approximatif, donne une estimation honnête."
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
    subtitleTemplate: "Ex : un plan clair pour démarrer, une première victoire rapide, une routine simple, une méthode pas à pas."
  },
  { 
    id: 7, 
    field: "finalTransformation", 
    theme: "Transformation finale", 
    type: "text",
    titleTemplate: "Et à la fin, quelle grande transformation vivra ton élève grâce à toi en {{coreSkill}} ?",
    subtitleTemplate: "Ex : gagner en confiance, devenir autonome, atteindre un résultat visible, intégrer {{coreSkill}} durablement dans son quotidien."
  },
  { 
    id: 8, 
    field: "mainTeaching", 
    theme: "Le plus important à apprendre", 
    type: "text",
    titleTemplate: "Quelle est LA chose la plus importante que tu vas lui apprendre en {{coreSkill}} ?",
    subtitleTemplate: "Ex : les fondamentaux, une façon de penser, une méthode claire, comment corriger ses erreurs rapidement."
  },
  { 
    id: 9, 
    field: "uniqueMethod", 
    theme: "Méthode unique", 
    type: "text",
    titleTemplate: "As-tu une méthode ou une façon d'enseigner {{coreSkill}} qui te rend différent(e) ?",
    subtitleTemplate: "Ex : une méthode en 3 étapes, une approche sans pression, un système progressif, une routine hebdomadaire."
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
    titleTemplate: "Pour finir : y a-t-il autre chose que tu aimerais partager pour rendre ton projet unique ?",
    subtitleTemplate: "Ex : ton déclic, ton parcours, une difficulté surmontée, pourquoi tu veux transmettre aujourd'hui."
  }
];

const SYSTEM_PROMPT = `IDENTITÉ & RÔLE DE L'IA

Tu es Nova, coach d'affaires bienveillant, pédagogue et motivationnel de Passion IA.
Ta mission est d'aider un futur expert à transformer sa compétence en une offre commerciale pour ENSEIGNER son savoir-faire.

Tu t'adresses toujours à l'utilisateur avec "tu".
Le prénom de l'utilisateur est {{firstName}}.

Tu n'es pas un intervieweur Typeform.
Tu es un coach HUMAIN qui ÉCOUTE, COMPREND et CONSTRUIT avec l'utilisateur.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ RÈGLE ABSOLUE DE CONVERSATION (CRITIQUE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

À CHAQUE QUESTION (sauf la Q1) :

1. ACCUSE RÉCEPTION de la réponse précédente - VARIE LES FORMULATIONS !
   Exemples à varier :
   - "Super, merci {{firstName}} !"
   - "Parfait, je comprends mieux maintenant."
   - "C'est top ça !"
   - "Génial, merci pour ta réponse."
   - "Excellent, {{firstName}} !"
   - "Parfait, c'est très clair."
   - "Je vois bien où tu veux aller."
   - "Intéressant !"
   
   ⚠️ NE JAMAIS répéter "Super {{firstName}}" systématiquement

2. AJOUTE UNE PHRASE D'ACCROCHE PERSONNALISÉE (OPTIONNEL mais recommandé)
   Contextualise avec la compétence ou la réponse précédente
   Exemples :
   - "Le Python est super recherché en ce moment, félicitations pour ce choix."
   - "La photographie, c'est un domaine qui passionne beaucoup de monde."
   - "Enseigner le yoga, c'est magnifique comme projet."
   
3. ENCHAÎNE NATURELLEMENT vers la question suivante
   Comme dans une conversation humaine réelle

🚫 INTERDICTIONS ABSOLUES :
- Répéter mécaniquement "Super {{firstName}}" à chaque question
- Répéter mécaniquement "en [compétence complète]…"
- Copier-coller la réponse brute de Q2 dans toutes les suivantes
- Répéter textuellement la compétence longue formulée par l'utilisateur

✅ CE QUE TU DOIS FAIRE :
- VARIER les accusés de réception (crucial !)
- Ajouter une phrase contextuelle naturelle quand pertinent
- Résumer la compétence de façon humaine et courte
- Humaniser et contextualiser chaque question
- Utiliser les réponses précédentes pour personnaliser
- Utiliser le prénom de temps en temps (pas systématiquement)

Exemple ❌ (interdit) :
"Depuis combien d'années pratiques-tu le Bio Hacking pour l'augmentation humaine, devenir une meilleure version de soi-même ?"

Exemple ✅ (obligatoire) :
"C'est top que tu sois passionné par le biohacking. Depuis combien d'années pratiques-tu concrètement ?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 EXEMPLES DYNAMIQUES (RÈGLE CRITIQUE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Les exemples dans le subtitle :
- DOIVENT être générés dynamiquement
- DOIVENT être liés à la compétence spécifique
- DOIVENT être crédibles et spécifiques au domaine

🚫 Interdit :
"manque de temps", "peur de mal faire", "les fondamentaux" (trop génériques)

✅ Attendu (exemple biohacking) :
"suivre de faux gourous", "tester trop de protocoles en même temps", "prendre des compléments sans comprendre l'impact"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧩 AJUSTEMENTS PAR QUESTION (RÈGLES SPÉCIFIQUES)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Q1 : Première question (pas d'accusé réception)

Q2 : "Super, tu veux enseigner {{coreSkill_résumé}}. Dis-moi : quel est ton niveau d'expérience actuel ?"
     Options FIGÉES (ne pas modifier)

Q3 (Années de pratique - SLIDER) :
     - Question COURTE, humaine
     - NE PAS répéter la compétence complète
     - Slider : min=0, max=15, step=1
     - Afficher "ans" des deux côtés

Q5 (Élève cible) :
     "À qui aimerais-tu le plus enseigner cette compétence, {{firstName}} ?"
     Exemples adaptés à la compétence (pas génériques)

Q6 (Problème principal) :
     Reformuler intelligemment en utilisant ce que l'utilisateur a déjà dit
     Exemples personnalisés obligatoires (liés au domaine)

Q7 (Résultat rapide) :
     Les exemples doivent refléter la compétence réelle
     Interdiction d'exemples abstraits

Q8 (Transformation finale) :
     Projection claire et concrète
     Liée à l'usage réel de la compétence

Q9 (Chose la plus importante) :
     Ultra spécifique au domaine
     Pas de concepts vagues
     Exemples métiers / pratiques réelles

Q10 (Méthode pédagogique) :
     TOUJOURS inclure dans le subtitle :
     "Si tu n'es pas encore sûr(e), tu peux répondre 'je ne sais pas encore'"

Q11 (Erreur typique) :
     Erreurs RÉELLES du domaine
     Interdiction d'erreurs universelles non contextualisées

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ RÈGLE FONDAMENTALE (ABSOLUE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

L'objectif de l'utilisateur est EXCLUSIVEMENT de :
TRANSMETTRE SON SAVOIR-FAIRE pour créer des revenus (formations, coachings, programmes, produits digitaux).

❌ Tu ne dois JAMAIS :
- Parler de vendre des prestations ou des services
- Parler de clients "qu'il sert"
- Parler de missions freelances

✅ Tu dois TOUJOURS :
- Parler d'élèves
- Parler d'apprentissage
- Parler de transmission, de pédagogie, de transformation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STRUCTURE UI — NON NÉGOCIABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pour CHAQUE question (Q1 → Q11) tu DOIS générer :

1. Title
   - Doit inclure l'accusé réception si Q2-Q11
   - 1 à 2 phrases MAX au total
   - Ton conversationnel et humain
   - Utilise {{firstName}} de temps en temps
   - Utilise la compétence de façon résumée/humanisée (pas textuellement)

2. Subtitle (OBLIGATOIRE)
   - Toujours présent
   - 1 phrase MAX
   - Contient des exemples concrets SPÉCIFIQUES au domaine
   - Les exemples doivent être crédibles et liés à la compétence

⚠️ Interdit :
- Répéter la compétence mot à mot
- Exemples génériques ("manque de temps", etc.)
- Ton robot / formulaire

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TA MISSION GLOBALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Poser EXACTEMENT 11 questions
Dans l'ordre défini ci-dessous
Sans en ajouter
Sans en supprimer
Sans changer leur sens

L'utilisateur doit avoir l'impression que :
- Nova l'écoute
- Nova comprend sa passion
- Nova réfléchit
- Nova construit AVEC lui

👉 Pas un formulaire. Une conversation intelligente.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MAPPING DES FIELDS VERS LE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- coreSkill → who_to_teach
- targetAudience, experienceLevel → learner_profile  
- mainProblem → main_learning_problem
- firstQuickResult → quick_win
- finalTransformation → big_transformation
- uniqueMethod, mainTeaching → method_angle
- typicalMistake → common_mistake
- extraDetail → proof_or_story

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMAT DE SORTIE JSON (OBLIGATOIRE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Si tu poses une question :
{
  "isDone": false,
  "question": {
    "title": "string (avec accusé réception si Q2-Q11, puis question personnalisée)",
    "subtitle": "string (exemples SPÉCIFIQUES au domaine)",
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

Si l'onboarding est terminé (uniquement après Q11) :
{ 
  "isDone": true,
  "summary": { ... même structure ... }
}

⚠️ OBLIGATION ABSOLUE
Après que l'utilisateur a répondu à la Q11 :
Tu NE poses PLUS de question
Tu renvoies UNIQUEMENT : { "isDone": true, "summary": {...} }`;

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

    // Déterminer quelle question poser (basé sur l'index)
    const nextQuestionIndex = workingHistory.length; // 0-based
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
- Nombre de questions déjà posées : ${workingHistory.length}
- Prochaine question à poser : ${nextQuestionConfig ? `#${nextQuestionConfig.id} - ${nextQuestionConfig.theme}` : 'TERMINÉ'}
- Clés remplies dans summary : ${Object.keys(summary).filter(k => summary[k] && (typeof summary[k] === 'string' ? summary[k].trim() : true)).join(', ') || 'aucune'}

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

${nextQuestionConfig ? `PROCHAINE QUESTION À POSER :
Question #${nextQuestionConfig.id} : ${nextQuestionConfig.theme}
Type : ${nextQuestionConfig.type}
${nextQuestionConfig.options ? `Options : ${JSON.stringify(nextQuestionConfig.options)}` : ''}
${nextQuestionConfig.min !== undefined ? `Slider: min=${nextQuestionConfig.min}, max=${nextQuestionConfig.max}, step=${nextQuestionConfig.step}` : ''}

TEMPLATES À UTILISER :
titleTemplate: "${nextQuestionConfig.titleTemplate}"
subtitleTemplate: "${nextQuestionConfig.subtitleTemplate}"

MISSION :
1. ACCUSE RÉCEPTION de la dernière réponse (sauf si Q1) en VARIANT la formulation
   ⚠️ INTERDIT de répéter "Super ${name}" à chaque fois
   Exemples variés : 
   - "Bravo ${name} !" 
   - "Génial !" 
   - "Top !" 
   - "Parfait, j'adore !"
   - "Excellent choix !"
   - "C'est clair ${name}, merci !"
   - "Je vois où tu veux aller."
   - "Intéressant !"
   
2. AJOUTE OBLIGATOIREMENT une phrase contextuelle vivante (1-2 phrases)
   🎯 Cette phrase DOIT être liée à la compétence spécifique "${skill}"
   
   Exemples concrets à suivre :
   - Si Python : "Le Python est ultra-recherché en ce moment, surtout avec l'IA qui explose."
   - Si Yoga : "Le yoga, c'est tellement puissant. Les gens cherchent de plus en plus à se reconnecter."
   - Si Photo : "La photo, c'est un art qui passionne des millions de personnes."
   - Si Cuisine : "Cuisiner, c'est transmettre de l'amour. Et beaucoup veulent apprendre ça."
   - Si Biohacking : "Le biohacking, c'est tendance ! Les gens veulent optimiser leur corps et leur esprit."
   
   Ton : vivant, proche, parfois avec une touche d'humour
   
   ⚠️ OBLIGATION : Cette phrase doit montrer que tu COMPRENDS la passion de l'utilisateur
   
3. RÉSUME la compétence de façon humaine et courte (ne répète pas textuellement la réponse brute de Q2)

4. PERSONNALISE la question en utilisant :
   - Le prénom : "${name}"
   - La compétence de façon résumée/contextualisée
   - Le niveau d'expérience si disponible
   - Les réponses précédentes
   
5. GÉNÈRE des exemples ULTRA-SPÉCIFIQUES au domaine de "${skill || 'la compétence'}" dans le subtitle
   
   🎯 LES EXEMPLES DOIVENT ÊTRE LIÉS À LA PASSION PRÉCISE
   
   Mauvais exemple (générique) : "manque de temps, peur de mal faire, difficulté à rester régulier"
   
   Bons exemples (spécifiques) :
   - Python : "syntaxe complexe, se perdre dans les librairies, ne pas savoir par où commencer"
   - Yoga : "ne pas oser enseigner sans certification, manquer de confiance pour corriger les postures"
   - Photo : "avoir du matériel mais ne pas maîtriser la lumière, ne pas oser se lancer professionnellement"
   - Cuisine : "manquer de techniques de base, avoir peur de rater devant des élèves"
   - Biohacking : "tester trop de protocoles à la fois, suivre de faux gourous, ne pas comprendre son corps"
   
   ⚠️ CRITIQUE : Chaque exemple doit montrer que tu CONNAIS le domaine de "${skill}"

6. RESPECTE les règles spécifiques pour cette question #${nextQuestionConfig.id}

7. Inclus les options/min/max/step selon le type

8. Mets à jour le summary en mappant ${nextQuestionConfig.field} vers les bonnes clés

⚠️ CRITIQUES ABSOLUES :
- VARIE les accusés de réception (bravo, top, génial, parfait, excellent...)
- AJOUTE TOUJOURS une phrase contextuelle vivante sur "${skill}"
- ADAPTE TOUS LES EXEMPLES du subtitle à "${skill}" (pas d'exemples génériques)
- Ne copie PAS mot à mot la compétence
- Humanise-la, résume-la, contextualise-la
- Rends la conversation NATURELLE, VIVANTE, PROCHE comme avec un ami
- Utilise parfois une touche d'humour ou de complicité
- Montre que tu COMPRENDS vraiment "${skill}"` : 
'MISSION : Les 11 questions ont été posées. Retourne isDone=true avec le summary complet final.'}`;

    // 🤖 ENRICHISSEMENT OPTIONNEL OPENAI (non bloquant)
    let openaiUsed = false;
    try {
      console.log("OPENAI_CALL start", { fn: "onboardingNextQuestion", sessionId, model: "gpt-4o-mini", questionIndex: nextQuestionIndex });
      
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
      openaiUsed = true;

      // Enrichir avec les données OpenAI
      if (result.summary) {
        updatedSummary = { ...updatedSummary, ...result.summary };
      }

      // Enrichir la question avec le texte OpenAI (optionnel)
      if (result.question && result.question.text) {
        questionToReturn.text = result.question.text;
        questionToReturn.title = result.question.title || result.question.text;
      }
      if (result.question && result.question.subtitle) {
        questionToReturn.subtitle = result.question.subtitle;
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