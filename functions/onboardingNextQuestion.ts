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

1. ACCUSE RÉCEPTION de la réponse précédente
   Exemples : "Super, merci pour ta réponse.", "Je vois mieux.", "Parfait, c'est très clair."

2. ENCHAÎNE NATURELLEMENT vers la question suivante
   Comme dans une conversation humaine réelle

🚫 INTERDICTIONS ABSOLUES :
- Répéter mécaniquement "en [compétence complète]…"
- Copier-coller la réponse brute de Q2 dans toutes les suivantes
- Répéter textuellement la compétence longue formulée par l'utilisateur

✅ CE QUE TU DOIS FAIRE :
- Résumer la compétence de façon humaine et courte
- Humaniser et contextualiser chaque question
- Utiliser les réponses précédentes pour personnaliser
- Utiliser le prénom de temps en temps

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

Q3 : "Super, merci pour ta réponse. Quel est ton niveau d'expérience actuel ?"
     Même si déjà posée en Q2, garde cette formulation EXACTE

Q4 (Années de pratique - SLIDER) :
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

    const { sessionId, userAnswer, history, summary } = await req.json();

    if (!sessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }

    // Utiliser les données passées en paramètre (localStorage)
    const workingHistory = history || [];
    const workingSummary = summary || {};
    const firstName = localStorage?.getItem?.('onboarding_firstName') || '';
    const skill = workingSummary.who_to_teach || '';

    // Si userAnswer fourni, l'ajouter à l'historique de travail
    if (userAnswer !== undefined && userAnswer !== null && workingHistory.length > 0) {
      const lastQuestion = workingHistory[workingHistory.length - 1]?.question || '';
      
      // Convertir answer en string pour éviter erreurs de validation
      let answerValue = userAnswer;
      if (typeof answerValue === 'number') {
        answerValue = String(answerValue);
      } else if (Array.isArray(answerValue)) {
        answerValue = answerValue.join(', ');
      }
    }

    // Construire le contexte pour le LLM
    const name = firstName;
    
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
- Nombre de questions posées : ${workingHistory.length}/11
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
1. ACCUSE RÉCEPTION de la dernière réponse (sauf si Q1)
2. RÉSUME la compétence de façon humaine et courte (ne répète pas textuellement la réponse brute de Q2)
3. PERSONNALISE la question en utilisant :
   - Le prénom : "${name}"
   - La compétence de façon résumée/contextualisée
   - Le niveau d'expérience si disponible
   - Les réponses précédentes
4. GÉNÈRE des exemples SPÉCIFIQUES au domaine de "${skill || 'la compétence'}" dans le subtitle
5. RESPECTE les règles spécifiques pour cette question #${nextQuestionConfig.id}
6. Inclus les options/min/max/step selon le type
7. Mets à jour le summary en mappant ${nextQuestionConfig.field} vers les bonnes clés

⚠️ CRITIQUE : Ne copie PAS mot à mot la compétence. Humanise-la, résume-la, contextualise-la.` : 
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

    // Retourner les données sans sauvegarder en DB (c'est géré côté front en localStorage)
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