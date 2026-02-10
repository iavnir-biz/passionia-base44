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
📐 STRUCTURE DU TEXTE DE VALIDATION (3 PARAGRAPHES EN TEXTE FLUIDE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**PARAGRAPHE 1 : CONTEXTE ACTUEL (2-3 phrases)**

Commence par une accroche directe qui mentionne la compétence exacte.
Ensuite, explique le problème spécifique et la tendance observée avec des données concrètes.

Exemple :
"Après analyse de ton marché autour du piano jazz pour débutants, une chose ressort très clairement. Jamais autant de personnes n'ont cherché à apprendre à improviser sans solfège. Les recherches sur ce sujet ont augmenté de 67% en 2 ans."

**PARAGRAPHE 2 : PREUVES CONCRÈTES (3-4 phrases)**

Développe 2 preuves concrètes en texte fluide, pas en bullet points :
1. Une preuve de croissance/volume/tendance mesurable
2. Une preuve de comportement d'achat ou de demande active

Exemple :
"L'intérêt pour les méthodes d'apprentissage rapide du jazz a explosé, avec une croissance de 45% sur YouTube et Google Trends ces 18 derniers mois. Les formations musicales en ligne génèrent en moyenne entre 8k et 15k euros par mois selon les données de Gumroad et Teachable, et les cours de piano restent dans le top 3 des formations les plus achetées."

**PARAGRAPHE 3 : CONCLUSION RASSURANTE (1-2 phrases)**

Termine par une phrase de validation qui donne confiance.

Exemple :
"Autrement dit : tu n'arrives pas trop tôt. Tu arrives au bon moment, là où la demande est forte et l'audience est prête à investir."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 INTERDICTIONS ABSOLUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ NE JAMAIS :
- Parler du "marché de la formation en ligne" (trop vague)
- Dire "Création de contenu pour entrepreneurs" au lieu du skill exact
- Utiliser "ta compétence" si tu connais le skill précis
- Faire des généralités sans chiffres
- Dépasser 200 mots
- Utiliser des bullet points (•) ou du markdown
- Structurer en liste à puces

✅ TOUJOURS :
- Reprendre le skill EXACT (ex: "Piano jazz pour débutants")
- Citer des chiffres précis avec années ou fourchettes réalistes
- Lier au PROBLÈME spécifique, pas au format
- Ton direct, bienveillant, factuel
- Texte fluide en paragraphes, pas en listes`;

const INDICATORS_SYSTEM_PROMPT = `Tu es un analyste de marché senior.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TA MISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Génère 3 indicateurs CONCRETS basés sur le PROBLÈME spécifique, pas sur le format.

**LES 3 INDICATEURS :**

1. **Potentiel du marché** (70-85)
   → Taille et accessibilité de l'audience
   
2. **Évolution récente** (75-88)
   → Croissance de l'intérêt sur 12 derniers mois
   
3. **Potentiel de monétisation** (72-90)
   → Capacité à générer des revenus stables

⚠️ COHÉRENCE :
- Mix optimal : 2 scores 75-85, 1 score 70-80
- Ne jamais donner 3 scores faibles (décourageant)
- Ne jamais donner 3 scores à 95 (peu crédible)`;

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
      console.log("✅ [generateMarketValidation] Cache hit");
      return Response.json({
        success: true,
        marketValidation: session.market_validation,
        marketScores: session.market_validation_scores,
        scoreExplanations: session.market_validation_score_explanations || {},
        fromCache: true
      });
    }

    // 🔥 EXTRACTION DES DONNÉES (Priorité : onboarding_history > onboarding_full > onboarding_summary)
    const onboardingHistory = session.onboarding_history || [];
    const onboardingFull = session.onboarding_full || {};
    const onboardingSummary = session.onboarding_summary || {};

    console.log('📊 [generateMarketValidation] Data sources:', {
      historyLength: onboardingHistory.length,
      hasOnboardingFull: !!Object.keys(onboardingFull).length,
      hasOnboardingSummary: !!Object.keys(onboardingSummary).length,
      sessionSkill: session.skill
    });

    // 🔥 EXTRACTION INTELLIGENTE
    const firstName = user.firstName || onboardingFull.firstName || 'toi';

    // Skill - Priorité aux sources les plus fiables
    let skill = session.skill ||
      onboardingSummary.who_to_teach ||
      onboardingFull.coreSkill ||
      onboardingFull.skill;

    // Si pas de skill, chercher dans l'historique
    if (!skill && onboardingHistory.length > 0) {
      const firstQ = onboardingHistory[0];
      if (firstQ && firstQ.answer) {
        skill = firstQ.answer;
      }
    }

    skill = skill || 'cette compétence';

    // Audience
    const learnerProfile = onboardingSummary.learner_profile ||
      onboardingFull.targetAudience ||
      onboardingFull.learner_profile ||
      'ton audience';

    // Problème
    const mainProblem = onboardingSummary.main_learning_problem ||
      onboardingFull.mainProblem ||
      onboardingFull.main_problem ||
      'ce blocage';

    // Transformation
    const bigTransformation = onboardingSummary.big_transformation ||
      onboardingFull.finalTransformation ||
      onboardingFull.big_transformation ||
      'cette transformation';

    // Quick win
    const quickWin = onboardingSummary.quick_win ||
      onboardingFull.firstQuickResult ||
      onboardingFull.quick_win ||
      '';

    // Method
    const methodAngle = onboardingSummary.method_angle ||
      onboardingFull.uniqueMethod ||
      '';

    console.log('✅ [generateMarketValidation] Extracted data:', {
      firstName,
      skill,
      learnerProfile,
      mainProblem: mainProblem.substring(0, 50) + '...',
      bigTransformation: bigTransformation.substring(0, 50) + '...'
    });

    // 🔥 USER PROMPTS AVEC DONNÉES EXTRAITES
    const validationPrompt = `CONTEXTE DU PROJET :

Prénom : ${firstName}
Compétence enseignée : ${skill}
Public cible : ${learnerProfile}
Problème principal : ${mainProblem}
Transformation promise : ${bigTransformation}
${quickWin ? `Premier résultat : ${quickWin}` : ''}
${methodAngle ? `Approche unique : ${methodAngle}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TA MISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Génère un texte de validation de marché ULTRA-PERSONNALISÉ pour ${firstName}.

Le texte doit être structuré en 3 PARAGRAPHES FLUIDES (pas de bullet points, pas de markdown) :

**PARAGRAPHE 1 (2-3 phrases) :**
Commence par : "Après analyse de ton marché autour de ${skill}, une chose ressort très clairement."
Puis explique comment le problème "${mainProblem}" est de plus en plus recherché, avec une tendance chiffrée concrète.

**PARAGRAPHE 2 (3-4 phrases) :**
Développe 2 preuves concrètes en texte fluide :
- Preuve 1 : Croissance mesurable liée spécifiquement à "${mainProblem}" (pas au e-learning en général)
- Preuve 2 : Comportement d'achat ou monétisation observée pour ce type de solution

**PARAGRAPHE 3 (1-2 phrases) :**
Conclus par : "Autrement dit : tu n'arrives pas trop tôt. Tu arrives au bon moment."
Optionnellement, ajoute une phrase de validation supplémentaire.

⚠️ CONTRAINTES STRICTES :
- Maximum 200 mots
- Reprendre le skill EXACT "${skill}" (ne JAMAIS généraliser)
- Utiliser des fourchettes réalistes (ex: "entre 15% et 25%") ou des tendances qualitatives fortes (ex: "une demande qui explose depuis 6 mois")
- NE PAS inventer de chiffre précis s'il n'est pas vérifiable
- Ton direct, factuel, rassurant, personnalisé
- TEXTE FLUIDE EN PARAGRAPHES (séparés par un saut de ligne double)
- PAS de bullet points (•), PAS de markdown (**), PAS de listes

Génère maintenant le texte en 3 paragraphes fluides uniquement.`;

    const indicatorsPrompt = `CONTEXTE :

Compétence : ${skill}
Public : ${learnerProfile}
Problème : ${mainProblem}
Transformation : ${bigTransformation}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TA MISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Génère 3 indicateurs pour ce projet.

**RÈGLES DE SCORING :**
- Potentiel du marché : 70-85
- Évolution récente : 75-88
- Potentiel de monétisation : 72-90
- Mix optimal : 2 scores 75-85, 1 score 70-80

**FORMAT JSON STRICT :**
{
  "marketSize": 78,
  "demandIntensity": 82,
  "revenueRecurrence": 75
}

Génère maintenant (JSON pur uniquement, pas de texte).`;

    console.log('🔄 [generateMarketValidation] Calling Claude Sonnet 4...');

    // 🔥 APPEL 1 : Texte de validation
    let validationText = '';
    try {
      const validationMessage = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [
          { role: "user", content: validationPrompt }
        ]
      });

      validationText = validationMessage.content[0].type === 'text'
        ? validationMessage.content[0].text.trim()
        : '';

      console.log('✅ [generateMarketValidation] Validation text generated');
    } catch (error) {
      console.error('❌ [generateMarketValidation] Error generating validation text:', error.message);
      validationText = `Après analyse de ton marché autour de ${skill}, une chose ressort très clairement.\n\nJamais autant de personnes n'ont cherché à ${mainProblem}. Les données montrent une augmentation forte de l'intérêt sur les 12 derniers mois.\n\nAutrement dit : tu n'arrives pas trop tôt. Tu arrives au bon moment.`;
    }

    // 🔥 APPEL 2 : Indicateurs
    let marketScores = {
      marketSize: 78,
      demandIntensity: 82,
      revenueRecurrence: 75
    };

    try {
      const indicatorsMessage = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: INDICATORS_SYSTEM_PROMPT,
        messages: [
          { role: "user", content: indicatorsPrompt }
        ]
      });

      const responseText = indicatorsMessage.content[0].type === 'text'
        ? indicatorsMessage.content[0].text.trim()
        : '{}';

      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      marketScores = JSON.parse(cleanedResponse);

      console.log('✅ [generateMarketValidation] Market scores generated:', marketScores);
    } catch (error) {
      console.error('❌ [generateMarketValidation] Error generating scores:', error.message);
    }

    // 🔥 SAUVEGARDE
    await base44.asServiceRole.entities.Session.update(sessionId, {
      market_validation: validationText,
      market_validation_scores: marketScores
    });

    console.log('✅ [generateMarketValidation] Saved to session');

    return Response.json({
      success: true,
      marketValidation: validationText,
      marketScores,
      scoreExplanations: {
        marketSize: "Taille et accessibilité de l'audience pour ton offre.",
        demandIntensity: "Croissance de l'intérêt sur les 12 derniers mois.",
        revenueRecurrence: "Capacité à générer des revenus stables avec les bons formats."
      }
    });

  } catch (error) {
    console.error('❌ [generateMarketValidation] Fatal error:', error);
    return Response.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});