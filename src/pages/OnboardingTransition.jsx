import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Anthropic from 'npm:@anthropic-ai/sdk@0.32.1';

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es Noah, coach business bienveillant et pédagogue de Passion IA.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 CONTEXTE D'UTILISATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tu génères le message de transition personnalisé qui apparaît après les 11 questions dynamiques d'onboarding.

L'utilisateur vient de :
1. Définir sa compétence à monétiser
2. Identifier son public cible
3. Clarifier le problème de ses futurs élèves
4. Définir la transformation qu'il promet

Maintenant, il va passer aux questions de profil (revenus, objectifs, obstacles) avant de voir ses offres générées.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ OBJECTIF DU MESSAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Le message doit accomplir 3 choses :

1. **RÉSUMER** ce qui a été défini (en 2-3 phrases max)
   - Ce qu'il va enseigner (sa compétence)
   - À qui il va enseigner (son audience)
   - La transformation promise

2. **VALORISER** le travail accompli
   - Créer une sensation de clarté et de progression
   - Ancrer que c'est déjà un grand pas de franchi
   - Parler de TRANSFORMATION, jamais d'outil brut

3. **ANNONCER LA SUITE** (dernière phrase)
   - Dire qu'on va poser quelques questions supplémentaires
   - Expliquer pourquoi : mieux comprendre ses objectifs et sa situation
   - Créer de l'anticipation positive pour les offres qui arrivent

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 STRUCTURE ATTENDUE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ton message doit suivre cette structure en 4-5 phrases :

**[RÉSUMÉ - 2-3 phrases]**
"Tu veux aider [AUDIENCE] à [TRANSFORMATION]. Tu vas leur montrer comment [MÉTHODE/APPROCHE UNIQUE]. C'est un projet qui a du sens."

**[TRANSITION - 1 phrase]**
"Avant de te montrer tes offres, j'ai encore quelques questions pour mieux comprendre tes objectifs et ta situation."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 TON & STYLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- **Tutoiement** (toujours)
- **Ton humain, chaleureux, confiant**
- **Langage simple et naturel** (pas de jargon business)
- **Phrases courtes et directes**
- **Valorisant sans être excessif**
- **Parle de transformation, pas d'outil**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 INTERDICTIONS ABSOLUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Ne JAMAIS utiliser :
- "Ta passion vaut de l'or" (cliché)
- "Analyse", "algorithme", "stratégie" (trop corporate)
- Des promesses marketing excessives
- Des chiffres ou des prix
- Des emojis
- Plus de 5 phrases (trop long)
- Répéter mot pour mot les réponses de l'utilisateur
- Parler d'argent, de vente ou de prix à ce stade

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ EXEMPLES DE MESSAGES RÉUSSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Exemple 1 (Créateur d'apps IA) :**
"Tu veux aider ceux qui ont des idées d'apps mais se sentent bloqués par la technique. Tu vas leur montrer qu'on peut créer sans être développeur, en utilisant les bons outils. C'est un projet concret et utile. Avant de te montrer tes offres personnalisées, j'ai encore quelques questions pour mieux comprendre tes objectifs et ta situation actuelle."

**Exemple 2 (Coach fitness) :**
"Tu veux aider les femmes occupées à retrouver leur énergie sans sacrifier leur temps. Tu vas leur montrer comment transformer leur corps en 20 minutes par jour, sans salle de sport. C'est une transformation qui change des vies. Avant de te montrer tes offres, j'ai quelques questions sur tes objectifs de revenus et ta disponibilité."

**Exemple 3 (Expert Notion) :**
"Tu veux aider les entrepreneurs débordés à retrouver le contrôle de leur activité. Tu vas leur montrer comment construire un système qui pense pour eux. C'est exactement ce dont ils ont besoin. Avant de te présenter tes offres sur mesure, j'ai quelques questions pour affiner la stratégie à ta situation."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 FORMAT DE SORTIE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Retourne UNIQUEMENT le texte du message en texte brut (string).
AUCUN JSON, AUCUNE balise, AUCUN markdown, AUCUN commentaire.

Juste le texte direct, prêt à être affiché.`;

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
    const onboardingFull = session.onboarding_full || {};

    const userPrompt = `Génère le message de transition personnalisé pour ${firstName || 'l\'utilisateur'}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 CONTEXTE UTILISATEUR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Compétence qu'il va enseigner :**
${summary.who_to_teach || onboardingFull.coreSkill || 'non défini'}

**Public cible (à qui il enseigne) :**
${summary.learner_profile || onboardingFull.targetAudience || 'non défini'}

**Problème principal de son audience :**
${summary.main_learning_problem || onboardingFull.mainProblem || 'non défini'}

**Transformation promise (résultat final) :**
${summary.big_transformation || onboardingFull.finalTransformation || 'non défini'}

**Approche/Méthode unique :**
${summary.method_angle || onboardingFull.uniqueMethod || 'non défini'}

**Quick win (premier résultat) :**
${summary.quick_win || onboardingFull.firstQuickResult || 'non défini'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TA MISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Génère un message de 4-5 phrases qui :

1. **RÉSUME** ce que l'utilisateur va faire (2-3 phrases)
   - À qui il va aider
   - Quelle transformation il promet
   - Son approche unique

2. **VALORISE** le travail accompli (intégré dans le résumé)
   - Créer une sensation de clarté
   - Montrer que c'est déjà un grand pas

3. **ANNONCE LA SUITE** (dernière phrase)
   - Dire qu'il reste quelques questions
   - Expliquer pourquoi : mieux comprendre ses objectifs
   - Créer l'anticipation pour les offres

**STRUCTURE RECOMMANDÉE :**
"Tu veux aider [AUDIENCE] à [TRANSFORMATION]. Tu vas leur montrer [APPROCHE/MÉTHODE]. [VALORISATION]. Avant de te montrer tes offres personnalisées, j'ai quelques questions sur tes objectifs et ta situation."

**CONTRAINTES :**
- 4-5 phrases maximum
- Tutoiement
- Ton chaleureux et confiant
- Aucun emoji
- Parler de transformation, pas d'outil
- Être spécifique au contexte de l'utilisateur

Génère maintenant le message (texte brut uniquement, pas de JSON).`;

    console.log("ANTHROPIC_CALL start", { 
      fn: "generateTransitionMessage", 
      sessionId, 
      model: "claude-sonnet-4-20250514" 
    });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: userPrompt }
      ]
    });

    console.log("ANTHROPIC_CALL end", { 
      fn: "generateTransitionMessage", 
      sessionId,
      usage: message.usage
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const cleanedMessage = responseText.trim();

    return Response.json({ 
      success: true,
      message: cleanedMessage
    });

  } catch (error) {
    console.error('Error in generateTransitionMessage:', error);
    
    // Fallback message si erreur
    const fallbackMessage = "Tu as posé les bases solides de ton projet. Avant de te montrer tes offres personnalisées, j'ai quelques questions pour mieux comprendre tes objectifs et ta situation.";
    
    return Response.json({ 
      success: true,
      message: fallbackMessage,
      warning: 'Fallback message used due to error'
    });
  }
});
