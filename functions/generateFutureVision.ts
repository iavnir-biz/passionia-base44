import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Anthropic from 'npm:@anthropic-ai/sdk@0.32.1';

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

// ============================================================================
// PROMPT HYBRIDE OPTIMISÉ
// ============================================================================
// Combine :
// - La fluidité narrative et l'arc émotionnel de l'ancien prompt (8 étapes)
// - La richesse des données du nouveau système
// - Moins de contraintes = plus de créativité
// ============================================================================

const SYSTEM_PROMPT = `Tu es un expert en storytelling de transformation et copywriting émotionnel.

🎯 TA MISSION
Créer un récit de transformation UNIQUE et profondément personnalisé.
Ce texte doit toucher émotionnellement l'utilisateur et lui faire visualiser son futur.

📝 RÈGLES DE STYLE
- Texte brut uniquement (JAMAIS de Markdown : pas de **, pas de ##, pas de listes à puces)
- Paragraphes courts et aérés pour un rythme émotionnel
- Tutoiement EXCLUSIF ("tu", "ton", "tes")
- Accords grammaticaux selon le genre de l'utilisateur
- 1-2 emojis max (✨ 🚀 ❤️) utilisés avec parcimonie
- Longueur : 500-700 mots (assez pour développer l'émotion)

🎭 STRUCTURE NARRATIVE (8 ÉTAPES)
Suis cette progression psychologique naturelle. Les étapes doivent se fondre les unes dans les autres, pas être des blocs séparés.

1. L'EFFET MIROIR (Le Présent)
   Décris sa situation actuelle avec SES propres mots.
   Ses blocages, ses doutes, ses frustrations.
   Il doit se dire "C'est exactement moi".

2. L'ÉLÉMENT DÉCLENCHEUR
   Le moment où il décide de passer à l'action.
   Pas un miracle. Une décision calme et lucide.
   Mentionne son niveau de préparation si pertinent.

3. LA PREMIÈRE VICTOIRE
   Le moment PRÉCIS de sa première vente.
   La notification, le montant exact, l'excitation.
   C'est la PREUVE que ça marche.

4. LA TRANSFORMATION IDENTITAIRE
   Il n'est plus "celui qui essaye". Il EST "celui qui fait".
   Changement de posture, de regard sur lui-même.
   Nouvelle confiance.

5. L'ASCENSION
   Les ventes s'enchaînent. Les revenus montent.
   Progression réaliste vers son objectif.
   Chiffres concrets mois après mois.

6. LA NOUVELLE RÉALITÉ
   Sa vie une fois l'objectif atteint.
   SCÈNE CONCRÈTE de son quotidien :
   - Où il se réveille
   - Comment se passe sa journée
   - Sa liberté (temps, argent, lieu)
   - Ses émotions
   - La réaction de ses proches

7. L'IMPACT
   Les personnes qu'il aide et transforme.
   Les messages de remerciement.
   La fierté de transmettre.

8. L'APPEL AU DESTIN
   Une phrase finale sobre et puissante.
   Ce futur commence maintenant.

⚠️ IMPORTANT
- Développe CHAQUE étape avec assez de détails pour créer l'émotion
- Utilise les VRAIES réponses de l'utilisateur (pas des généralités)
- Parle de la TRANSFORMATION qu'il offre, pas du nom de ses produits
- Crée des scènes visuelles et concrètes
- Varie ton style et tes métaphores (chaque récit doit être unique)

🚫 INTERDICTIONS
- Langage "coach Instagram" (boss life, manifester, etc.)
- Promesses magiques ou irréalistes
- Répéter textuellement les noms des offres
- Abstractions vagues ("tu réussis", "tu es heureux")
- Markdown ou formatage`;


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

    // Récupérer la session
    const sessions = await base44.asServiceRole.entities.Session.filter({ id: sessionId });
    if (!sessions || sessions.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = sessions[0];
    
    // Vérifier si déjà généré (cache)
    if (session.future_vision) {
      console.log("Future vision already generated, returning existing");
      return Response.json({
        success: true,
        narrativeText: session.future_vision,
        fromCache: true
      });
    }

    // ========================================================================
    // EXTRACTION DES DONNÉES UTILISATEUR
    // ========================================================================
    const finalizedOffer = session.finalized_offer || {};
    const onboardingSummary = session.onboarding_summary || {};
    const onboardingFull = session.onboarding_full || {};
    const potentialRevenue = session.potential_revenue || 0;
    
    // Infos de base
    const firstName = user.firstName || onboardingFull.firstName || '';
    const gender = user.gender || onboardingFull.gender || '';
    
    // Projet & Compétence
    const skill = onboardingSummary.who_to_teach || onboardingFull.coreSkill || 'cette compétence';
    const targetAudience = onboardingSummary.learner_profile || onboardingFull.targetAudience || '';
    const mainProblem = onboardingSummary.main_learning_problem || onboardingFull.mainProblem || '';
    const quickWin = onboardingSummary.quick_win || onboardingFull.quickWin || '';
    const bigTransformation = onboardingSummary.big_transformation || onboardingFull.bigTransformation || '';
    const uniqueMethod = onboardingSummary.method_angle || onboardingFull.uniqueMethod || '';
    const personalStory = onboardingSummary.proof_or_story || onboardingFull.personalStory || '';
    
    // Objectifs & Rêves
    const lifeChange = onboardingFull.lifeChange || '';
    const desiredImpact = onboardingFull.desiredImpact || onboardingFull.impact || '';
    const desiredEmotions = onboardingFull.desiredEmotions || onboardingFull.emotions || '';
    const relativesReaction = onboardingFull.relativesReaction || onboardingFull.relatives || '';
    const lifestyleGoals = onboardingFull.lifestyleGoals || onboardingFull.lifestyle || '';
    const targetIncome = onboardingFull.targetIncome || 5000;
    const targetDelay = onboardingFull.targetIncomeDelay || 12;
    
    // Blocages actuels
    const obstacles = onboardingFull.obstacles || '';
    const ifNothingChanges = onboardingFull.ifNothingChanges || '';
    const readinessLevel = onboardingFull.readinessLevel || onboardingFull.readiness || '';
    
    // Offre
    const mainProductPrice = finalizedOffer.mainProduct?.price || '27€';
    const mainProductType = finalizedOffer.mainProduct?.productType || 'mini-formation';

    // ========================================================================
    // CONSTRUCTION DU PROMPT UTILISATEUR
    // ========================================================================
    
    // Note sur le genre pour les accords
    let genderInstruction = '';
    if (gender === 'Femme') {
      genderInstruction = `⚡ GENRE : L'utilisateur est une FEMME. Utilise les accords féminins (prête, motivée, lancée, fière, alignée, accomplie, etc.)`;
    } else if (gender === 'Homme') {
      genderInstruction = `⚡ GENRE : L'utilisateur est un HOMME. Utilise les accords masculins (prêt, motivé, lancé, fier, aligné, accompli, etc.)`;
    } else {
      genderInstruction = `⚡ GENRE : Non spécifié. Privilégie les tournures avec "tu" pour éviter les accords.`;
    }

    const userPrompt = `${genderInstruction}

══════════════════════════════════════════════════════════════════
📊 DONNÉES DE ${firstName ? firstName.toUpperCase() : 'L\'UTILISATEUR'} - À UTILISER OBLIGATOIREMENT
══════════════════════════════════════════════════════════════════

👤 PROFIL
- Prénom : ${firstName || 'Non communiqué'}
- Âge : ${onboardingFull.ageRange || 'Non communiqué'}
- Situation : ${onboardingFull.familySituation || 'Non communiquée'}
- Revenus actuels : ${onboardingFull.currentIncome ? onboardingFull.currentIncome + '€/mois' : 'Non communiqués'}

💡 SON PROJET
- Il veut enseigner : ${skill}
- À qui : ${targetAudience || 'Non précisé'}
- Problème qu'il résout : ${mainProblem || 'Non précisé'}
- Quick win promis : ${quickWin || 'Non précisé'}
- Grande transformation : ${bigTransformation || 'Non précisé'}
- Sa méthode unique : ${uniqueMethod || 'Non précisé'}
- Son histoire/légitimité : ${personalStory || 'Non précisé'}

🎯 SES OBJECTIFS
- Objectif revenus : ${targetIncome}€/mois
- Dans combien de temps : ${targetDelay} mois
- Potentiel calculé de son système : ${potentialRevenue}€/mois

✨ CE QU'IL VEUT VRAIMENT (SES MOTS)
- Comment sa vie changerait : "${lifeChange || 'Non précisé'}"
- L'impact qu'il veut avoir : "${desiredImpact || 'Non précisé'}"
- Les émotions qu'il recherche : "${desiredEmotions || 'Non précisé'}"
- Ce que ses proches diraient : "${relativesReaction || 'Non précisé'}"
- Son style de vie idéal : "${lifestyleGoals || 'Non précisé'}"

😰 SES BLOCAGES ACTUELS (SES MOTS)
- Ce qui le bloque : "${obstacles || 'Non précisé'}"
- Si rien ne change : "${ifNothingChanges || 'Non précisé'}"
- Niveau de préparation : ${readinessLevel || 'Non précisé'}/10

💰 SON OFFRE
- Premier produit : ${mainProductPrice} (${mainProductType})

══════════════════════════════════════════════════════════════════
🎬 GÉNÈRE SON RÉCIT DE TRANSFORMATION
══════════════════════════════════════════════════════════════════

Écris maintenant le récit de transformation de ${firstName || 'cet utilisateur'} en suivant les 8 étapes du système.

RAPPELS CRITIQUES :
• Utilise SES vraies réponses (entre guillemets ci-dessus), pas des généralités
• Crée des SCÈNES VISUELLES concrètes (lieux, moments, sensations)
• Dans "La Nouvelle Réalité", intègre OBLIGATOIREMENT :
  - Sa projection de vie : "${lifeChange}"
  - Son objectif : ${targetIncome}€/mois
  - Son style de vie : "${lifestyleGoals}"
  - Ses émotions : "${desiredEmotions}"
  - Ses proches : "${relativesReaction}"
• Prix de sa première vente : ${mainProductPrice}
• Parle de la TRANSFORMATION qu'il offre, pas du nom du produit

Génère le récit maintenant (texte brut, paragraphes aérés, 500-700 mots) :`;

    // ========================================================================
    // APPEL ANTHROPIC
    // ========================================================================
    console.log("ANTHROPIC_CALL start", { 
      fn: "generateFutureVision", 
      sessionId, 
      model: "claude-sonnet-4-20250514",
      firstName,
      targetIncome
    });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      temperature: 0.8, // Un peu plus de créativité
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: userPrompt }
      ]
    });

    console.log("ANTHROPIC_CALL end", { 
      fn: "generateFutureVision", 
      sessionId,
      usage: message.usage
    });

    const narrativeText = message.content[0].type === 'text' 
      ? message.content[0].text.trim() 
      : '';

    // ========================================================================
    // SAUVEGARDE EN BASE
    // ========================================================================
    await base44.asServiceRole.entities.Session.update(sessionId, {
      future_vision: narrativeText
    });

    console.log('✅ [generateFutureVision] Sauvegardé dans session', { 
      sessionId,
      wordCount: narrativeText.split(/\s+/).length
    });

    return Response.json({
      success: true,
      narrativeText
    });

  } catch (error) {
    console.error('Error in generateFutureVision:', error);
    
    // ========================================================================
    // FALLBACK EN CAS D'ERREUR
    // ========================================================================
    const fallbackText = `Tu es là, à ce moment précis où tout peut basculer.

Peut-être que tu doutes encore. Peut-être que tu te demandes si tu es vraiment légitime pour transmettre ce que tu sais. Cette petite voix qui te dit "qui suis-je pour enseigner ça ?"... elle est normale. Tout le monde l'a eue.

Mais imagine un instant.

Imagine que tu décides aujourd'hui de passer à l'action. Pas demain. Pas "quand tu seras prêt". Aujourd'hui.

Tu structures ton savoir. Tu crées ta première offre. Et un matin, tu te réveilles avec une notification. Quelqu'un vient de payer pour apprendre ce que tu sais faire. Ce n'est peut-être que quelques dizaines d'euros. Mais c'est la preuve. La preuve que ton expertise a de la valeur. La preuve que des gens sont prêts à investir pour ce que tu peux leur apporter.

Les semaines passent. Les ventes s'accumulent. Tu n'es plus "celui qui a une idée". Tu es celui qui transforme des vies avec son savoir.

Et dans quelques mois ? Tu te réveilles avec une liberté que tu n'avais jamais connue. Tu travailles sur ce qui te passionne. Tu aides des personnes qui te remercient chaque semaine. Tu as créé quelque chose qui te ressemble.

Tes proches te regardent différemment. "Comment tu as fait ?" te demandent-ils. Et toi, tu souris. Parce que tu sais que tout a commencé par une simple décision.

Cette décision, c'est maintenant.

Cette vie t'attend. ✨`;

    return Response.json({
      success: true,
      narrativeText: fallbackText,
      warning: 'Fallback text used due to error',
      error: error.message
    });
  }
});