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

const MARKET_ANALYSIS_GRAPH_SYSTEM_PROMPT = `Tu es un analyste de marché senior spécialisé dans les produits d'information, la formation en ligne et le coaching.

Ta mission est de générer des INDICATEURS DE MARCHÉ SIMPLES ET CONCRETS
pour visualiser le POTENTIEL ÉCONOMIQUE d'un projet de TRANSMISSION DE SAVOIR.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 CONTEXTE OBLIGATOIRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

L'utilisateur ne vend PAS un outil.
Il transmet une TRANSFORMATION à des élèves.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ RÈGLES ABSOLUES (CRITIQUES)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ Tu analyses le MARCHÉ DU PROBLÈME,
PAS le marché de l'outil, PAS le marché générique de la formation.

❌ Interdit :
- "marché de l'e-learning"
- "formation en ligne en général"
- "learning", "éducation" sans contexte

✅ Obligatoire :
- surcharge mentale
- désorganisation
- manque de clarté
- perte de temps
- frustration récurrente
- incapacité à passer à l'action
(ou toute douleur directement liée au problème réel)

2️⃣ Tous les indicateurs doivent être :
- compréhensibles par un non-expert
- directement reliés au PROBLÈME et au PUBLIC
- utiles pour rassurer un futur créateur d'offre

3️⃣ Les valeurs sont RELATIVES (0–100),
mais doivent être COHÉRENTES :
❌ Pas de 30–40% faibles sans raison
✅ En général : 65–90 si le marché est valide

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 INDICATEURS À PRODUIRE (OBLIGATOIRES)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tu dois produire EXACTEMENT 4 indicateurs :

1. Taille du problème
→ À quel point ce problème touche beaucoup de personnes

2. Intensité de la douleur
→ À quel point ce problème est frustrant / bloquant / coûteux

3. Demande active de solutions
→ Est-ce que les gens cherchent déjà des solutions par eux-mêmes

4. Potentiel de monétisation
→ Est-ce que les gens sont prêts à payer pour résoudre ce problème

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 LOGIQUE DE RAISONNEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tu dois raisonner ainsi :
- Le problème existe AVANT la méthode
- La transformation est désirable
- Le public est identifiable
- Les gens cherchent déjà une solution
→ donc il existe une opportunité économique réelle`;

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
    if (session.market_validation && session.market_validation_scores) {
      console.log("Market validation already generated, returning existing");
      return Response.json({
        success: true,
        validationText: session.market_validation,
        marketScores: session.market_validation_scores,
        scoreExplanations: session.market_validation_score_explanations || {},
        fromCache: true
      });
    }

    const onboardingSummary = session.onboarding_summary || {};
    const onboardingFull = session.onboarding_full || {};
    
    const name = user.firstName || onboardingFull.firstName || 'l\'entrepreneur';
    const skill = session.skill || onboardingSummary.who_to_teach || onboardingFull.coreSkill || 'cette compétence';

    // 🔥 PART 1: Texte de validation
    const textPrompt = `IMPORTANT :
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

    // 🔥 PART 2: Indicateurs de marché
    const indicatorsPrompt = `DONNÉES DE RÉFÉRENCE (ne jamais les ignorer) :
- Compétence enseignée : ${skill}
- Public cible : ${onboardingSummary.learner_profile || 'non précisé'}
- Problème principal AVANT accompagnement : "${onboardingSummary.main_learning_problem || 'non précisé'}"
- Transformation recherchée : "${onboardingSummary.big_transformation || 'non précisée'}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 FORMAT DE SORTIE STRICT (JSON)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Retourne UNIQUEMENT ce JSON valide :

{
  "indicators": [
    {
      "label": "Taille du problème",
      "value": number,
      "description": "Pourquoi ce problème concerne beaucoup de personnes aujourd'hui."
    },
    {
      "label": "Intensité de la douleur",
      "value": number,
      "description": "Pourquoi ce problème est vécu comme bloquant ou frustrant."
    },
    {
      "label": "Demande active de solutions",
      "value": number,
      "description": "Comment on observe que les gens cherchent déjà une solution."
    },
    {
      "label": "Potentiel de monétisation",
      "value": number,
      "description": "Pourquoi des personnes sont prêtes à payer pour résoudre ce problème."
    }
  ]
}

❌ Aucun texte en dehors du JSON.
❌ Aucun jargon marketing.
❌ Aucune référence générique à 'la formation en ligne'.`;

    console.log('🔍 [generateMarketValidation] Génération texte + indicateurs', { 
      fn: 'generateMarketValidation',
      sessionId,
      skill,
      model: 'gpt-4o',
      temp: 0.55
    });

    // 🔥 Appel 1: Texte de validation (avec recherche web)
    const textResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `${SYSTEM_PROMPT}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${textPrompt}`,
      add_context_from_internet: true
    });

    const validationText = (typeof textResponse === 'string' ? textResponse : textResponse?.validationText || textResponse?.text || '').trim();

    // 🔥 Appel 2: Indicateurs (avec recherche web pour données de marché)
    const indicatorsResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `${MARKET_ANALYSIS_GRAPH_SYSTEM_PROMPT}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${indicatorsPrompt}`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          indicators: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                value: { type: "number" },
                description: { type: "string" }
              },
              required: ["label", "value", "description"]
            }
          }
        },
        required: ["indicators"]
      }
    });

    const indicators = indicatorsResponse?.indicators || [];

    console.log('✅ [generateMarketValidation] Réponse reçue', {
      skill,
      textLength: validationText.length,
      indicatorsCount: indicators.length,
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
        market_validation: fallbackText,
        market_validation_scores: {},
        market_validation_score_explanations: {}
      });

      return Response.json({
        success: true,
        validationText: fallbackText,
        marketScores: {},
        scoreExplanations: {},
        fromCache: false
      });
    }

    // Transform indicators to legacy format (marketScores + scoreExplanations)
    const marketScores = {};
    const scoreExplanations = {};
    
    indicators.forEach(ind => {
      const key = ind.label.toLowerCase()
        .replace(/é/g, 'e')
        .replace(/è/g, 'e')
        .replace(/'/g, '')
        .replace(/ /g, '_')
        .replace(/[^\w_]/g, '');
      marketScores[key] = ind.value;
      scoreExplanations[key] = ind.description;
    });

    // Save to session
    await base44.asServiceRole.entities.Session.update(sessionId, {
      market_validation: validationText,
      market_validation_scores: marketScores,
      market_validation_score_explanations: scoreExplanations
    });

    console.log('💾 [generateMarketValidation] Sauvegardé en session:', {
      sessionId,
      skill,
      textLength: validationText.length,
      scoresCount: Object.keys(marketScores).length
    });

    return Response.json({
      success: true,
      validationText,
      marketScores,
      scoreExplanations
    });

  } catch (error) {
    console.error('Error generating market validation:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});