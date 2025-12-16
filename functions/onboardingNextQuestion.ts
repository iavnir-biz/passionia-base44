import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

// Structure des 26 questions à suivre
const QUESTION_STRUCTURE = [
  { id: 1, field: "coreSkill", theme: "Compétence principale à enseigner", type: "text" },
  { id: 2, field: "experienceLevel", theme: "Niveau d'expérience", type: "single_choice", options: ["Débutant", "Intermédiaire", "Avancé", "Expert"] },
  { id: 3, field: "years", theme: "Années de pratique", type: "slider", min: 0, max: 30, step: 1 },
  { id: 4, field: "targetAudience", theme: "Public cible idéal", type: "text" },
  { id: 5, field: "mainProblem", theme: "Problème N°1 des apprenants", type: "text" },
  { id: 6, field: "firstResult", theme: "Premier résultat rapide", type: "text" },
  { id: 7, field: "finalTransformation", theme: "Transformation finale", type: "text" },
  { id: 8, field: "mainTeaching", theme: "Enseignement clé prioritaire", type: "text" },
  { id: 9, field: "uniqueMethod", theme: "Méthode ou approche unique", type: "text" },
  { id: 10, field: "typicalMistake", theme: "Erreur typique à éviter", type: "text" },
  { id: 11, field: "extraDetail", theme: "Histoire ou preuve personnelle", type: "text" },
  { id: 12, field: "ageRange", theme: "Tranche d'âge du public", type: "single_choice", options: ["18-25 ans", "26-35 ans", "36-45 ans", "46-55 ans", "56+ ans"] },
  { id: 13, field: "gender", theme: "Genre du public", type: "single_choice", options: ["Majoritairement des hommes", "Majoritairement des femmes", "Mixte"] },
  { id: 14, field: "family", theme: "Situation familiale", type: "single_choice", options: ["Célibataire sans enfants", "En couple sans enfants", "Parent avec enfants", "Mixte"] },
  { id: 15, field: "currentIncome", theme: "Revenus mensuels actuels", type: "single_choice", options: ["Moins de 1500€", "1500€ - 2500€", "2500€ - 3500€", "3500€ - 4500€", "Plus de 4500€"] },
  { id: 16, field: "targetIncome", theme: "Objectif de revenus mensuels", type: "single_choice", options: ["2000€/mois", "3000€/mois", "5000€/mois", "10 000€/mois", "Plus de 10 000€/mois"] },
  { id: 17, field: "targetDelay", theme: "Délai pour atteindre l'objectif", type: "single_choice", options: ["3 mois", "6 mois", "1 an", "2 ans ou plus"] },
  { id: 18, field: "lifeChange", theme: "Changement de vie souhaité", type: "text" },
  { id: 19, field: "impact", theme: "Impact sur les autres", type: "text" },
  { id: 20, field: "emotions", theme: "Émotions recherchées", type: "text" },
  { id: 21, field: "relatives", theme: "Ce que les proches diront", type: "text" },
  { id: 22, field: "lifestyle", theme: "Style de vie idéal", type: "text" },
  { id: 23, field: "obstacles", theme: "Obstacles actuels", type: "text" },
  { id: 24, field: "ifNothingChanges", theme: "Si rien ne change dans 5 ans", type: "text" },
  { id: 25, field: "readiness", theme: "Niveau de préparation", type: "slider", min: 1, max: 10, step: 1 },
  { id: 26, field: "deliveryPreferences", theme: "Formats de délivrance préférés", type: "multiple_choice", options: ["Enregistrer des vidéos (partage d'écran, sans montrer ma tête)", "Enregistrer des vidéos de cours (face caméra)", "Créer des PDFs / Google Docs", "Animer des lives en groupe", "Animer des sessions 1-on-1 en visio", "Organiser des événements en présentiel (pour le high-ticket)"] }
];

const SYSTEM_PROMPT = `Tu es un coach d'affaires expert qui a une VRAIE conversation naturelle avec l'utilisateur.

Mission : transformer sa compétence en offre éducative pour ENSEIGNER son savoir-faire (pas vendre des services).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 RÈGLE CRITIQUE – STYLE CONVERSATIONNEL INTELLIGENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHAQUE nouvelle question DOIT OBLIGATOIREMENT :

1. REPRENDRE EXPLICITEMENT un élément de la réponse précédente
2. MONTRER que tu as compris (reformulation courte et précise)
3. ENCHAÎNER naturellement, comme un coach humain

Exemples ATTENDUS (à reproduire) :

❌ INTERDIT : "Quel est le problème principal de tes élèves ?"
✅ BON : "Ok, donc si j'ai bien compris, tes élèves savent prendre des photos, mais bloquent quand il faut diriger un modèle. C'est quoi exactement LE moment où ça coince le plus pour eux ?"

❌ INTERDIT : "Quelle transformation veux-tu apporter ?"
✅ BON : "Super ! Donc tu veux qu'ils passent de « coincés devant le modèle » à « capables de créer des images naturelles et émotionnelles ». Et concrètement, à quoi ça ressemble quand c'est réussi ? Genre après ta formation, ils font quoi différemment ?"

❌ INTERDIT : "Quelle est ta méthode unique ?"
✅ BON : "Intéressant. Tu m'as dit qu'ils galèrent avec la direction de modèle. Est-ce que t'as développé une approche spécifique pour leur apprendre ça ? Un truc qui marche à tous les coups ?"

❌ INTERDIT : "Quels formats préfères-tu ?"
✅ BON : "Ok, donc l'erreur typique c'est de croire qu'il faut tout contrôler. Maintenant, côté pratique : pour transmettre ça, tu préfères plutôt vidéos, PDFs, lives, ou un mix ?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 INTERDICTIONS STRICTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Questions génériques type formulaire Typeform
❌ Répétition sèche des champs (ex: "Quel est ton learner_profile ?")
❌ Ton administratif ou robotique
❌ Questions qui n'utilisent PAS le contexte précédent

VALIDATION : Si ta question ne fait AUCUNE référence à la réponse précédente → elle est INVALIDE.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RÈGLES GÉNÉRALES :
- Tu dois poser EXACTEMENT 26 questions dans l'ordre prédéfini
- Chaque question correspond à un thème spécifique de QUESTION_STRUCTURE
- Tutoie TOUJOURS, utilise le prénom si dispo
- Ton : bienveillant mais direct, pas bullshit
- ADAPTE et REFORMULE chaque question pour qu'elle soit naturelle et conversationnelle
- Fais TOUJOURS référence aux réponses précédentes dans ta reformulation

8 CLÉS DU SUMMARY à remplir progressivement :
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
- Reformule la question du QUESTION_STRUCTURE en la rendant naturelle et contextualisée
- MET À JOUR le summary complet à chaque réponse (mappe les fields aux clés du summary)
- isDone=true UNIQUEMENT après avoir posé les 26 questions

MAPPING DES FIELDS VERS LE SUMMARY :
- targetAudience, ageRange, gender, family → who_to_teach + learner_profile
- mainProblem, obstacles → main_learning_problem
- firstResult → quick_win
- finalTransformation, lifeChange, impact → big_transformation
- uniqueMethod, mainTeaching → method_angle
- typicalMistake → common_mistake
- extraDetail → proof_or_story
- deliveryPreferences → format_preferences

Tu retournes TOUJOURS un JSON avec :
Si isDone=false:
{
  "isDone": false,
  "question": {
    "text": "string (avec phrase de transition conversationnelle)",
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

IMPORTANT : Tu DOIS ABSOLUMENT inclure les champs "options" si type=single_choice ou multiple_choice, et "min", "max", "step" si type=slider, SINON l'interface ne pourra pas afficher la question !

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
- Nombre de questions posées : ${history.length}/26
- Prochaine question à poser : ${nextQuestionConfig ? `#${nextQuestionConfig.id} - ${nextQuestionConfig.theme}` : 'TERMINÉ'}
- Clés remplies dans summary : ${Object.keys(summary).filter(k => summary[k] && (typeof summary[k] === 'string' ? summary[k].trim() : true)).join(', ') || 'aucune'}

${nextQuestionConfig ? `PROCHAINE QUESTION À POSER :
Structure : ${JSON.stringify(nextQuestionConfig, null, 2)}

MISSION :
1. ${lastEntry ? 'Commence par UNE PHRASE DE TRANSITION qui rebondit naturellement sur la dernière réponse' : 'Commence par une question accueillante'}
2. Reformule la question "${nextQuestionConfig.theme}" pour qu'elle soit naturelle, conversationnelle et personnalisée
3. Utilise le type "${nextQuestionConfig.type}" ${nextQuestionConfig.options ? `avec les options : ${JSON.stringify(nextQuestionConfig.options)}` : ''}${nextQuestionConfig.min !== undefined ? `avec min=${nextQuestionConfig.min}, max=${nextQuestionConfig.max}, step=${nextQuestionConfig.step}` : ''}
4. Retourne le summary COMPLET et MIS À JOUR (mappe ${nextQuestionConfig.field} vers les bonnes clés du summary)` : 
'MISSION : Toutes les 26 questions ont été posées. Retourne isDone=true avec le summary complet final.'}`;

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
                anyOf: [
                  {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      type: { 
                        type: "string",
                        enum: ["text"]
                      }
                    },
                    required: ["text", "type"]
                  },
                  {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      type: { 
                        type: "string",
                        enum: ["single_choice", "multiple_choice"]
                      },
                      options: {
                        type: "array",
                        items: { type: "string" }
                      }
                    },
                    required: ["text", "type", "options"]
                  },
                  {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      type: { 
                        type: "string",
                        enum: ["slider"]
                      },
                      min: { type: "number" },
                      max: { type: "number" },
                      step: { type: "number" }
                    },
                    required: ["text", "type", "min", "max", "step"]
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