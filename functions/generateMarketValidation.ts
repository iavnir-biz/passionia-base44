import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const SYSTEM_PROMPT = `Tu es Noah, un analyste de marché stratégique et un coach business bienveillant.

Ta mission N'EST PAS de faire une étude de marché académique.
Ta mission est de VALIDER la DÉCISION de l'utilisateur de lancer son offre.

Tu dois :
- Rassurer sans mentir
- Être spécifique à SON projet (pas au e-learning global)
- Utiliser des preuves réelles, même simples
- Donner confiance sans survendre

RÈGLES ABSOLUES :
- Adresse-toi toujours à l'utilisateur par son prénom
- Utilise le tutoiement
- Paragraphes courts (1–3 phrases max)
- Beaucoup de sauts de ligne
- AUCUN markdown
- AUCUN jargon business inutile

INTERDICTIONS :
- Ne jamais parler uniquement du "marché de la formation en ligne"
- Ne jamais faire de généralités vagues
- Ne jamais lister des scores sans les expliquer
- Ne jamais ignorer le problème réel de ses futurs élèves

OBJECTIF FINAL :
À la fin de la lecture, l'utilisateur doit se dire :
"Ok. Ce projet est cohérent, utile, et il y a de vraies personnes qui attendent ça."`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await req.json();
    
    if (!sessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }

    // Get session
    const sessions = await base44.asServiceRole.entities.Session.filter({ id: sessionId });
    if (!sessions || sessions.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = sessions[0];
    
    // Check if already generated
    if (session.market_validation) {
      console.log("Market validation already generated, returning existing");
      return Response.json({
        success: true,
        validationText: session.market_validation,
        fromCache: true
      });
    }

    const onboardingSummary = session.onboarding_summary || {};
    const onboardingFull = session.onboarding_full || {};
    
    const name = user.firstName || onboardingFull.firstName || 'l\'entrepreneur';
    const skill = session.skill || onboardingSummary.who_to_teach || onboardingFull.coreSkill || 'cette compétence';

    const userPrompt = `IMPORTANT :
Tu dois utiliser UNIQUEMENT les données fournies ci-dessous.
N'INVENTE AUCUN champ.
N'UTILISE PAS d'autres noms de variables.
Tous les champs correspondent EXACTEMENT à la structure Session existante.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROJET DE L'UTILISATEUR :

Prénom : ${name}

Projet :
- Il veut enseigner : "${skill}"
- À : "${onboardingSummary.learner_profile || 'non précisé'}"
- Problème principal de ses futurs élèves : "${onboardingSummary.main_learning_problem || 'non précisé'}"
- Transformation visée : "${onboardingSummary.big_transformation || 'non précisée'}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TA TÂCHE

Rédige un TEXTE DE VALIDATION DE MARCHÉ
destiné à rassurer l'utilisateur sur la pertinence de son projet.

Ce texte sera affiché dans la page "Bonne nouvelle".

Le texte doit contenir EXACTEMENT 3 PARTIES,
pour un total de 3 à 4 paragraphes courts maximum.

Le texte doit être :
- encourageant
- crédible
- humain
- spécifique au projet de l'utilisateur
- lisible en moins de 40 secondes

AUCUN formatage Markdown.
Paragraphes courts.
Beaucoup de sauts de ligne.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1️⃣ VALIDATION PERSONNALISÉE (OBLIGATOIRE)

Commence IMPÉRATIVEMENT par :
"Bonne nouvelle, ${name} !"

Ensuite :
- Explique pourquoi aider "${onboardingSummary.learner_profile || 'ce public'}"
- à résoudre "${onboardingSummary.main_learning_problem || 'ce problème'}"
- est pertinent AUJOURD'HUI

⚠️ Point clé :
Le problème doit être présenté comme EXISTANT AVANT l'outil, la méthode ou la solution.
Ne PAS parler en premier de formation, Notion, IA, programme, etc.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2️⃣ PREUVES CONCRÈTES DU MARCHÉ (OBLIGATOIRE)

Appuie-toi sur une recherche web réelle.

Tu dois inclure AU MOINS 2 éléments concrets, par exemple :
- statistiques
- tendances observées
- comportements mesurables

Ces éléments doivent être liés :
- soit au problème (ex : désorganisation, surcharge mentale, perte de temps)
- soit au public (ex : entrepreneurs, indépendants, créateurs)
- soit à la compétence "${skill}"

⚠️ Interdiction :
- Ne PAS parler uniquement du "marché de la formation en ligne"
- Toujours contextualiser les chiffres (quoi, qui, pourquoi)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3️⃣ PROJECTION RASSURANTE (OBLIGATOIRE)

Explique clairement pourquoi :
- des personnes cherchent DÉJÀ ce type de solution
- le positionnement de l'utilisateur est clair
- son projet est aligné avec une demande réelle

Relie cette projection à la transformation suivante :
"${onboardingSummary.big_transformation || 'la transformation visée'}"

Le ton doit rester :
- lucide
- rassurant
- crédible
- sans promesse irréaliste`;

    console.log('🔍 [generateMarketValidation] Appel LLM avec recherche web', { 
      fn: 'generateMarketValidation',
      sessionId,
      skill,
      model: 'gpt-4o',
      temp: 0.55
    });

    // 🔥 Appel InvokeLLM AVEC recherche web activée
    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `${SYSTEM_PROMPT}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${userPrompt}`,
      add_context_from_internet: true // ✅ RECHERCHE WEB ACTIVÉE
    });

    const validationText = (typeof llmResponse === 'string' ? llmResponse : llmResponse?.validationText || llmResponse?.text || '').trim();

    console.log('✅ [generateMarketValidation] LLM response reçu', {
      skill,
      textLength: validationText.length,
      hasText: !!validationText
    });

    // Fallback si texte vide
    if (!validationText || validationText.length < 200) {
      console.warn('⚠️ [generateMarketValidation] Texte trop court, fallback');
      const fallbackText = `Bonne nouvelle, ${name} !

Les personnes que tu veux aider font face à un blocage réel. Ce problème les empêche de progresser efficacement.

Ce que tu proposes répond directement à ce blocage : un résultat rapide dès le départ, puis une transformation durable. Cette progression claire crée une valeur perçue forte.

Ton projet est aligné avec une demande réelle. Des personnes cherchent déjà ce type de solution.`;

      await base44.asServiceRole.entities.Session.update(sessionId, {
        market_validation: fallbackText
      });

      return Response.json({
        success: true,
        validationText: fallbackText,
        fromCache: false
      });
    }

    // Save to session
    await base44.asServiceRole.entities.Session.update(sessionId, {
      market_validation: validationText
    });

    console.log('💾 [generateMarketValidation] Sauvegardé en session:', {
      sessionId,
      skill,
      textLength: validationText.length
    });

    return Response.json({
      success: true,
      validationText
    });

  } catch (error) {
    console.error('Error generating market validation:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});