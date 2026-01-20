import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Anthropic from 'npm:@anthropic-ai/sdk@0.32.1';

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es Noah, analyste de marché stratégique et coach business bienveillant.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TA MISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tu NE FAIS PAS une étude de marché académique.
Tu VALIDES la décision de l'utilisateur de lancer son offre.

Tu dois :
- ✅ Rassurer AVEC des preuves concrètes
- ✅ Être ultra-spécifique à SON projet (pas au e-learning global)
- ✅ Utiliser des données réelles, stats, tendances observables
- ✅ Donner confiance sans survendre ni mentir
- ✅ Personnaliser chaque analyse au contexte exact

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 STRUCTURE DU TEXTE DE VALIDATION (3 SECTIONS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**SECTION 1 : VALIDATION PERSONNALISÉE (2-3 phrases)**

Commence TOUJOURS par :
"{firstName}, tu veux aider [AUDIENCE] à [TRANSFORMATION]."

Puis explique pourquoi ce projet a du sens AUJOURD'HUI :
- Quel est le contexte actuel (2025) qui rend ce problème urgent
- Pourquoi ce public est particulièrement touché
- Quelle tendance macro valide ce besoin

**SECTION 2 : PREUVES CONCRÈTES (3-4 bullet points)**

Tu DOIS inclure au moins 3 preuves mesurables :
- 📊 Statistiques avec sources (études, rapports, enquêtes)
- 📈 Tendances Google Trends / croissance marché
- 💰 Données économiques (revenus moyens, taille marché)
- 👥 Comportements observables (ce que les gens cherchent/achètent)

**RÈGLES POUR LES PREUVES :**
- Toujours lier au PROBLÈME spécifique, pas à "la formation en ligne"
- Citer des chiffres précis avec années (ex: "+340% en 2 ans", "73% des X")
- Mentionner la source si possible (ex: "étude Stack Overflow 2024")
- Contextualiser (qui, quoi, pourquoi)

**SECTION 3 : PROJECTION RASSURANTE (2-3 phrases)**

Explique pourquoi :
- Des gens cherchent DÉJÀ ce type de solution
- Son positionnement est clair et différenciant
- La transformation promise est désirable

Termine par une phrase d'encouragement qui crée l'anticipation pour la suite.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 INTERDICTIONS ABSOLUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ NE JAMAIS :
- Parler uniquement du "marché de la formation en ligne" (trop vague)
- Faire des généralités sans chiffres ("beaucoup de personnes", "forte demande")
- Lister des scores sans explications concrètes
- Ignorer le problème réel des futurs élèves
- Utiliser du jargon business inutile
- Écrire plus de 250 mots (rester concis et impactant)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ RÈGLES DE STYLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Tutoiement systématique
- Paragraphes courts (1-3 phrases max)
- Sauts de ligne fréquents (aération)
- Aucun markdown (juste texte brut avec sauts de ligne)
- Ton rassurant mais lucide
- Preuves > opinions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 OBJECTIF FINAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Après lecture, l'utilisateur doit penser :
"Ok. Ce projet est cohérent, utile, et il y a de vraies personnes qui attendent ça. J'ai fait le bon choix."`;

const INDICATORS_SYSTEM_PROMPT = `Tu es un analyste de marché senior spécialisé dans les produits d'information.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TA MISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Génère 4 indicateurs de marché CONCRETS pour visualiser le potentiel économique d'un projet de transmission de savoir.

⚠️ RÈGLE FONDAMENTALE :
Tu analyses le MARCHÉ DU PROBLÈME, PAS le marché de l'outil, PAS le marché générique de la formation.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 LES 4 INDICATEURS (OBLIGATOIRES)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. **Taille du problème** (0-100)
   → Combien de personnes sont touchées par ce problème aujourd'hui
   → Basé sur : taille de l'audience, universalité du problème
   → Généralement 70-85 si problème répandu

2. **Intensité de la douleur** (0-100)
   → À quel point ce problème est frustrant/bloquant/coûteux
   → Basé sur : impact sur la vie, urgence, conséquences
   → Généralement 75-90 si problème critique

3. **Demande active de solutions** (0-100)
   → Est-ce que les gens cherchent activement des solutions
   → Basé sur : volume de recherche, comportement d'achat, tendances
   → Généralement 70-88 si demande confirmée

4. **Potentiel de monétisation** (0-100)
   → Est-ce que les gens sont prêts à payer pour résoudre ça
   → Basé sur : valeur perçue, transformation promise, marché existant
   → Généralement 72-90 si transformation claire

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 LOGIQUE DE SCORING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Scores élevés (80-95) :** Problème majeur, audience large, solution évidente
**Scores bons (70-79) :** Problème réel, marché confirmé, demande existante
**Scores moyens (60-69) :** Problème niche, marché à construire
**Scores bas (40-59) :** Évite sauf exception (projet très précoce)

⚠️ COHÉRENCE OBLIGATOIRE :
- Ne jamais donner 4 scores tous faibles (40-60) → décourageant
- Ne jamais donner 4 scores tous élevés (90-100) → peu crédible
- Mix optimal : 2-3 scores 75-85, 1-2 scores 70-80

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ DESCRIPTIONS (CRITIQUES)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Chaque description DOIT :
- Expliquer le POURQUOI du score (pas juste répéter le label)
- Être spécifique au projet (pas générique)
- Mentionner des éléments concrets si possible
- Faire 1-2 phrases courtes (20-40 mots max)

**❌ MAUVAISE DESCRIPTION :**
"Score modéré car audience ciblée spécifique."

**✅ BONNE DESCRIPTION :**
"Les entrepreneurs non-techniques représentent 73% des créateurs de startups (Stack Overflow 2024), soit plusieurs millions de personnes touchées en France."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 FORMAT DE SORTIE (JSON STRICT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Retourne UNIQUEMENT ce JSON (rien d'autre, pas de markdown) :

{
  "indicators": [
    {
      "label": "Taille du problème",
      "value": 78,
      "description": "Explication concrète et spécifique (20-40 mots)"
    },
    {
      "label": "Intensité de la douleur",
      "value": 82,
      "description": "Explication concrète et spécifique (20-40 mots)"
    },
    {
      "label": "Demande active de solutions",
      "value": 75,
      "description": "Explication concrète et spécifique (20-40 mots)"
    },
    {
      "label": "Potentiel de monétisation",
      "value": 80,
      "description": "Explication concrète et spécifique (20-40 mots)"
    }
  ]
}`;

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
        marketValidation: session.market_validation,
        marketScores: session.market_validation_scores,
        scoreExplanations: session.market_validation_score_explanations || {},
        fromCache: true
      });
    }

    const onboardingSummary = session.onboarding_summary || {};
    const onboardingFull = session.onboarding_full || {};
    
    const firstName = user.firstName || onboardingFull.firstName || 'toi';
    const skill = session.skill || onboardingSummary.who_to_teach || onboardingFull.coreSkill || 'cette compétence';
    const learnerProfile = onboardingSummary.learner_profile || onboardingFull.targetAudience || 'ton audience';
    const mainProblem = onboardingSummary.main_learning_problem || onboardingFull.mainProblem || 'ce blocage';
    const bigTransformation = onboardingSummary.big_transformation || onboardingFull.finalTransformation || 'cette transformation';
    const methodAngle = onboardingSummary.method_angle || onboardingFull.uniqueMethod || '';
    const quickWin = onboardingSummary.quick_win || onboardingFull.firstQuickResult || '';

    // 🔥 VALIDATION TEXT PROMPT
    const validationPrompt = `CONTEXTE DU PROJET :

Prénom : ${firstName}

**Ce qu'il enseigne :**
${skill}

**À qui il enseigne (audience cible) :**
${learnerProfile}

**Problème principal des futurs élèves :**
${mainProblem}

**Transformation promise :**
${bigTransformation}

**Approche unique :**
${methodAngle || 'non spécifiée'}

**Premier résultat rapide :**
${quickWin || 'non spécifié'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TA MISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Génère un texte de validation de marché personnalisé pour ${firstName}.

**STRUCTURE OBLIGATOIRE (3 sections) :**

**SECTION 1 : VALIDATION PERSONNALISÉE (2-3 phrases)**
Commence par : "${firstName}, tu veux aider [AUDIENCE] à [TRANSFORMATION]."
Explique pourquoi ce projet a du sens en 2025.

**SECTION 2 : PREUVES CONCRÈTES (3-4 bullet points)**
Inclus au moins 3 preuves mesurables :
• Statistiques avec sources et années
• Tendances observables (Google Trends, croissance marché)
• Données économiques ou comportementales

Exemples de preuves solides :
• "73% des entrepreneurs non-techniques abandonnent leur idée d'app (étude Stack Overflow 2024)"
• "Le marché du no-code a explosé de +340% en 2 ans (Google Trends)"
• "Les formations 'créer une app sans coder' génèrent 15k€/mois en moyenne (Gumroad data)"

**SECTION 3 : PROJECTION RASSURANTE (2-3 phrases)**
Explique pourquoi des gens cherchent déjà cette solution.
Termine par une phrase d'encouragement pour la suite.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CONTRAINTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Maximum 250 mots
- Paragraphes courts avec sauts de ligne
- Aucun markdown (texte brut uniquement)
- Tutoiement
- Ton rassurant mais factuel
- Preuves concrètes (pas de "beaucoup de personnes" sans chiffres)

Génère maintenant le texte de validation (texte brut uniquement).`;

    // 🔥 INDICATORS PROMPT
    const indicatorsPrompt = `CONTEXTE DU PROJET :

**Compétence enseignée :** ${skill}
**Public cible :** ${learnerProfile}
**Problème principal :** ${mainProblem}
**Transformation recherchée :** ${bigTransformation}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TA MISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Génère 4 indicateurs de marché pour ce projet.

**RAPPEL DES 4 INDICATEURS :**
1. Taille du problème (70-85)
2. Intensité de la douleur (75-90)
3. Demande active de solutions (70-88)
4. Potentiel de monétisation (72-90)

**RÈGLES DE SCORING :**
- Mix optimal : 2-3 scores 75-85, 1-2 scores 70-80
- Ne pas donner tous les scores bas (décourageant)
- Ne pas donner tous les scores élevés (peu crédible)

**DESCRIPTIONS :**
Chaque description doit :
- Expliquer le POURQUOI du score
- Être spécifique au projet
- Mentionner des éléments concrets si possible
- Faire 20-40 mots

**FORMAT DE SORTIE :**
Retourne UNIQUEMENT le JSON (pas de markdown, pas de texte avant/après) :

{
  "indicators": [
    {
      "label": "Taille du problème",
      "value": 78,
      "description": "..."
    },
    {
      "label": "Intensité de la douleur",
      "value": 82,
      "description": "..."
    },
    {
      "label": "Demande active de solutions",
      "value": 75,
      "description": "..."
    },
    {
      "label": "Potentiel de monétisation",
      "value": 80,
      "description": "..."
    }
  ]
}`;

    console.log('🔍 [generateMarketValidation] Génération avec Claude', { 
      fn: 'generateMarketValidation',
      sessionId,
      skill,
      model: 'claude-sonnet-4-20250514'
    });

    // 🔥 CALL 1: Texte de validation
    console.log("ANTHROPIC_CALL start (validation text)", { 
      fn: "generateMarketValidation", 
      sessionId, 
      model: "claude-sonnet-4-20250514" 
    });

    const validationMessage = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: validationPrompt }
      ]
    });

    console.log("ANTHROPIC_CALL end (validation text)", { 
      fn: "generateMarketValidation", 
      sessionId,
      usage: validationMessage.usage
    });

    const validationText = validationMessage.content[0].type === 'text' 
      ? validationMessage.content[0].text.trim() 
      : '';

    // 🔥 CALL 2: Indicateurs de marché
    console.log("ANTHROPIC_CALL start (indicators)", { 
      fn: "generateMarketValidation", 
      sessionId, 
      model: "claude-sonnet-4-20250514" 
    });

    const indicatorsMessage = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: INDICATORS_SYSTEM_PROMPT,
      messages: [
        { role: "user", content: indicatorsPrompt }
      ]
    });

    console.log("ANTHROPIC_CALL end (indicators)", { 
      fn: "generateMarketValidation", 
      sessionId,
      usage: indicatorsMessage.usage
    });

    const indicatorsText = indicatorsMessage.content[0].type === 'text' 
      ? indicatorsMessage.content[0].text.trim() 
      : '{}';

    // Clean potential markdown code blocks
    const cleanedIndicators = indicatorsText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    let indicators;
    try {
      const parsed = JSON.parse(cleanedIndicators);
      indicators = parsed.indicators || [];
    } catch (e) {
      console.error('JSON parse error for indicators', e);
      // Fallback indicators
      indicators = [
        { label: "Taille du problème", value: 75, description: "Audience significative touchée par ce problème." },
        { label: "Intensité de la douleur", value: 78, description: "Problème ressenti comme bloquant au quotidien." },
        { label: "Demande active de solutions", value: 72, description: "Recherche active de solutions confirmée." },
        { label: "Potentiel de monétisation", value: 76, description: "Transformation claire et désirable." }
      ];
    }

    // Build marketScores and scoreExplanations
    const marketScores = {
      marketSize: indicators[0]?.value || 75,
      demandIntensity: indicators[1]?.value || 78,
      revenueRecurrence: indicators[2]?.value || 72,
      onlineAccessibility: indicators[3]?.value || 76
    };

    const scoreExplanations = {
      marketSize: indicators[0]?.description || '',
      demandIntensity: indicators[1]?.description || '',
      revenueRecurrence: indicators[2]?.description || '',
      onlineAccessibility: indicators[3]?.description || ''
    };

    // Save to session
    await base44.asServiceRole.entities.Session.update(sessionId, {
      market_validation: validationText,
      market_validation_scores: marketScores,
      market_validation_score_explanations: scoreExplanations
    });

    console.log('✅ [generateMarketValidation] Sauvegardé dans session', { sessionId });

    return Response.json({
      success: true,
      marketValidation: validationText,
      marketScores,
      scoreExplanations,
      fromCache: false
    });

  } catch (error) {
    console.error('Error in generateMarketValidation:', error);
    
    // Fallback response
    const fallbackText = `Ton projet a du potentiel. Tu veux aider des personnes à surmonter un blocage réel. Les données montrent que ce type de problème touche une audience significative, et que les personnes cherchent activement des solutions. Ta transformation promise répond à un besoin concret.`;
    
    const fallbackScores = {
      marketSize: 72,
      demandIntensity: 75,
      revenueRecurrence: 70,
      onlineAccessibility: 78
    };
    
    const fallbackExplanations = {
      marketSize: "Audience ciblée avec potentiel confirmé.",
      demandIntensity: "Problème ressenti comme bloquant.",
      revenueRecurrence: "Demande active de solutions.",
      onlineAccessibility: "Transformation claire et désirable."
    };

    return Response.json({
      success: true,
      marketValidation: fallbackText,
      marketScores: fallbackScores,
      scoreExplanations: fallbackExplanations,
      warning: 'Fallback data used due to error'
    });
  }
});