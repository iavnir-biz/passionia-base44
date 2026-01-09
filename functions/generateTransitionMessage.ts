import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import OpenAI from 'npm:openai@4.73.1';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `TU ES NOAH
Coach business bienveillant et pédagogue de Passion IA.

📍 CONTEXTE D'UTILISATION
Tu génères UNIQUEMENT la première phrase de la page Onboarding Transition.

⚠️ RÈGLE ABSOLUE
TU NE MODIFIES RIEN D'AUTRE QUE LA PREMIÈRE PHRASE

🎯 OBJECTIF DE LA PHRASE
- Valoriser ce que l'utilisateur vient de construire
- Ancrer une sensation de clarté et de progression
- Créer de l'anticipation positive
- Parler de TRANSFORMATION, jamais d'outil ou de compétence brute
- Donner envie de continuer sans expliquer la suite

🧩 CONTRAINTES STRICTES
- 1 phrase UNIQUE
- 20 à 25 mots maximum
- Ton humain, chaleureux, confiant
- Tutoiement
- Langage simple, naturel
- Aucune promesse marketing excessive
- Aucune analyse
- Aucun chiffre
- Aucun jargon business
- Aucune mention d'outil (Notion, IA, etc.)

🚫 INTERDIT ABSOLU
- "Analyse", "algorithme", "stratégie"
- "Ta passion vaut de l'or"
- Répéter mot pour mot une réponse utilisateur
- Parler d'argent, de vente ou d'offres
- Utiliser plusieurs phrases ou emojis

✅ STYLE ATTENDU
Une phrase qui fait ressentir :
- "Tu es en train de construire quelque chose de clair"
- "Tu avances dans la bonne direction"
- "La suite va donner de la structure"

📤 FORMAT DE SORTIE
Texte brut uniquement (string)
AUCUN JSON
AUCUNE balise
AUCUN commentaire`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { sessionId, firstName } = await req.json();

    if (!sessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }

    // Récupérer la session
    const sessions = await base44.asServiceRole.entities.Session.filter({ id: sessionId });
    if (!sessions || sessions.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = sessions[0];
    const summary = session.onboarding_summary || {};

    const userPrompt = `Génère une phrase de transition pour ${firstName || 'l\'utilisateur'}.

CONTEXTE :
- Compétence : ${summary.who_to_teach || 'non défini'}
- Public cible : ${summary.learner_profile || 'non défini'}
- Problème résolu : ${summary.main_learning_problem || 'non défini'}
- Transformation : ${summary.big_transformation || 'non défini'}
- Méthode : ${summary.method_angle || 'non défini'}

MISSION :
Génère UNE SEULE PHRASE qui valorise le travail accompli par l'utilisateur.
La phrase doit parler de TRANSFORMATION et de CLARTÉ, jamais de l'outil.

⚠️ CONTRAINTES :
- 20-25 mots maximum
- Ton chaleureux et confiant
- Aucun emoji
- Aucune mention d'outil ou de compétence brute
- Parler de ce qui se construit, pas de ce qui va se passer

Retourne uniquement le texte de la phrase, rien d'autre.`;

    console.log("OPENAI_CALL start", { fn: "generateTransitionMessage", sessionId, model: "gpt-4o" });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 100
    });

    console.log("OPENAI_CALL end", { 
      fn: "generateTransitionMessage", 
      sessionId, 
      usage: completion.usage 
    });

    const message = completion.choices[0].message.content.trim();

    return Response.json({ 
      success: true,
      message 
    });

  } catch (error) {
    console.error('Error in generateTransitionMessage:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});