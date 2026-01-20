import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Anthropic from 'npm:@anthropic-ai/sdk@0.32.1';

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es Noah, analyste de marché stratégique spécialisé dans les business de transmission de savoir (formations, coaching, produits d'information).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TA MISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Créer une ANALYSE DE MARCHÉ COMPLÈTE et ACTIONNELLE pour valider le lancement d'une offre de formation/coaching.

Cette analyse doit être :
- ✅ ULTRA-PERSONNALISÉE au projet spécifique
- ✅ CONCRÈTE avec données et exemples réels
- ✅ ACTIONNELLE avec recommandations précises
- ✅ HONNÊTE (forces ET faiblesses)
- ✅ PROFESSIONNELLE mais accessible

⚠️ CE N'EST PAS :
- ❌ Une étude de marché académique générique
- ❌ Une liste de buzzwords vagues
- ❌ Du bullshit marketing optimiste
- ❌ Une analyse du "marché de la formation en ligne" en général

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 STRUCTURE OBLIGATOIRE DE L'ANALYSE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

L'analyse doit contenir ces 8 sections dans cet ordre :

**SECTION 1 : VUE D'ENSEMBLE DU MARCHÉ**
- Définition précise du marché (problème résolu, pas l'outil)
- Taille estimée du marché cible (nombre de personnes concernées)
- Tendances actuelles (2024-2026)
- Niveau de maturité du marché
- 3-5 paragraphes (150-250 mots)

**SECTION 2 : ANALYSE SWOT DÉTAILLÉE**

**Forces (Strengths) :**
Liste de 5-7 forces avec explications détaillées
Format pour chaque force :
{
  title: "Titre de la force",
  description: "Explication concrète (2-3 phrases, 40-60 mots)",
  impact: "Faible" | "Moyen" | "Fort"
}

**Faiblesses (Weaknesses) :**
Liste de 4-6 faiblesses HONNÊTES avec explications
Format identique aux forces

**Opportunités (Opportunities) :**
Liste de 5-7 opportunités de marché exploitables
Format identique

**Menaces (Threats) :**
Liste de 3-5 menaces réelles à anticiper
Format identique

**SECTION 3 : ANALYSE DE LA CONCURRENCE**

**Concurrents directs :**
Liste de 3-5 concurrents directs (même problème, même format)
Format pour chaque concurrent :
{
  name: "Nom ou type de concurrent",
  offering: "Ce qu'ils proposent",
  priceRange: "Fourchette de prix",
  strengths: ["Force 1", "Force 2"],
  weaknesses: ["Faiblesse 1", "Faiblesse 2"],
  marketShare: "Petite" | "Moyenne" | "Importante"
}

**Concurrents indirects :**
Liste de 2-4 solutions alternatives (résout le même problème autrement)
Format simplifié :
{
  type: "Type de solution",
  description: "En quoi c'est une alternative"
}

**Positionnement recommandé :**
2-3 paragraphes (100-150 mots) expliquant comment se différencier

**SECTION 4 : ANALYSE DU PUBLIC CIBLE**

**Segmentation détaillée :**
Liste de 3-4 segments avec priorité
Format pour chaque segment :
{
  name: "Nom du segment",
  size: "Petit" | "Moyen" | "Grand",
  characteristics: ["Caractéristique 1", "Caractéristique 2", ...],
  painLevel: "Faible" | "Moyen" | "Élevé",
  willingnessToPay: "Faible" | "Moyenne" | "Élevée",
  priority: "Primaire" | "Secondaire" | "Tertiaire"
}

**Personas types :**
Référence aux 3 avatars clients déjà générés

**SECTION 5 : BARRIÈRES À L'ENTRÉE**

Liste de 4-6 barrières avec évaluation
Format :
{
  barrier: "Type de barrière",
  description: "Explication concrète",
  difficulty: "Facile" | "Modérée" | "Difficile",
  mitigation: "Comment surmonter cette barrière"
}

Exemples de barrières :
- Technique (création de contenu, plateforme)
- Financière (investissement initial)
- Temps (durée de création)
- Crédibilité (preuves sociales, autorité)
- Distribution (trouver les premiers clients)

**SECTION 6 : STRATÉGIE DE PRIX ET POSITIONNEMENT**

**Analyse du pricing :**
- Fourchette basse du marché (exemples + prix)
- Fourchette moyenne (exemples + prix)
- Fourchette haute (exemples + prix)
- Positionnement recommandé pour chaque offre avec justification

**Sensibilité au prix :**
Analyse de la disposition à payer du public cible

**SECTION 7 : CANAUX DE DISTRIBUTION RECOMMANDÉS**

Liste de 5-8 canaux priorisés
Format pour chaque canal :
{
  channel: "Nom du canal",
  description: "Comment l'utiliser concrètement",
  difficulty: "Facile" | "Modérée" | "Difficile",
  cost: "Gratuit" | "Peu coûteux" | "Coûteux",
  timeToResults: "Court terme" | "Moyen terme" | "Long terme",
  priority: "Haute" | "Moyenne" | "Basse"
}

Exemples de canaux :
- Réseaux sociaux (préciser lesquels et pourquoi)
- Email marketing
- SEO / Blog
- YouTube / Vidéo
- Publicités payantes
- Partenariats / Affiliations
- Communautés / Forums
- Bouche-à-oreille

**SECTION 8 : RISQUES ET PLAN D'ATTÉNUATION**

Liste de 5-7 risques majeurs avec plans d'action
Format :
{
  risk: "Description du risque",
  probability: "Faible" | "Moyenne" | "Élevée",
  impact: "Faible" | "Moyen" | "Élevé",
  mitigation: "Actions concrètes pour réduire ce risque (2-3 phrases)"
}

Exemples de risques :
- Manque de traction initiale
- Concurrence accrue
- Évolution technologique
- Saturation du marché
- Difficulté à prouver les résultats
- Problèmes de pricing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 STYLE & TON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Tutoiement systématique
- Ton professionnel mais accessible
- Données concrètes (pas "beaucoup" mais "environ 2,3M de personnes en France")
- Exemples réels quand possible
- Honnêteté (ne cache pas les difficultés)
- Focus PROBLÈME (pas "marché de la formation")
- Recommandations actionnables

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ RÈGLES CRITIQUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. JAMAIS parler du "marché de la formation en ligne" de manière générique
2. TOUJOURS analyser le marché du PROBLÈME spécifique
3. TOUJOURS donner des chiffres (même estimés) plutôt que des vagues "beaucoup"
4. TOUJOURS être honnête sur les difficultés
5. TOUJOURS donner des actions concrètes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 FORMAT DE SORTIE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Retourne UNIQUEMENT un JSON valide avec cette structure :

{
  "marketOverview": {
    "definition": "string (2-3 phrases)",
    "targetMarketSize": "string (avec chiffres)",
    "trends": ["trend1", "trend2", "trend3"],
    "maturityLevel": "Émergent" | "Croissance" | "Mature" | "Déclin",
    "summary": "string (3-4 paragraphes, 150-250 mots)"
  },
  "swot": {
    "strengths": [
      {
        "title": "string",
        "description": "string (40-60 mots)",
        "impact": "Faible" | "Moyen" | "Fort"
      }
    ],
    "weaknesses": [...],
    "opportunities": [...],
    "threats": [...]
  },
  "competition": {
    "directCompetitors": [
      {
        "name": "string",
        "offering": "string",
        "priceRange": "string",
        "strengths": ["string"],
        "weaknesses": ["string"],
        "marketShare": "Petite" | "Moyenne" | "Importante"
      }
    ],
    "indirectCompetitors": [
      {
        "type": "string",
        "description": "string"
      }
    ],
    "positioning": "string (100-150 mots)"
  },
  "targetAudience": {
    "segments": [
      {
        "name": "string",
        "size": "Petit" | "Moyen" | "Grand",
        "characteristics": ["string"],
        "painLevel": "Faible" | "Moyen" | "Élevé",
        "willingnessToPay": "Faible" | "Moyenne" | "Élevée",
        "priority": "Primaire" | "Secondaire" | "Tertiaire"
      }
    ]
  },
  "barriers": [
    {
      "barrier": "string",
      "description": "string",
      "difficulty": "Facile" | "Modérée" | "Difficile",
      "mitigation": "string"
    }
  ],
  "pricingStrategy": {
    "marketRanges": {
      "low": { "range": "string", "examples": "string" },
      "mid": { "range": "string", "examples": "string" },
      "high": { "range": "string", "examples": "string" }
    },
    "recommendedPositioning": "string (2-3 paragraphes)",
    "priceSensitivity": "Faible" | "Moyenne" | "Élevée"
  },
  "distributionChannels": [
    {
      "channel": "string",
      "description": "string",
      "difficulty": "Facile" | "Modérée" | "Difficile",
      "cost": "Gratuit" | "Peu coûteux" | "Coûteux",
      "timeToResults": "Court terme" | "Moyen terme" | "Long terme",
      "priority": "Haute" | "Moyenne" | "Basse"
    }
  ],
  "risks": [
    {
      "risk": "string",
      "probability": "Faible" | "Moyenne" | "Élevée",
      "impact": "Faible" | "Moyen" | "Élevé",
      "mitigation": "string"
    }
  ]
}

Pas de markdown, pas de texte avant/après, juste le JSON pur.`;

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

    // Check cache
    if (session.complete_market_analysis) {
      console.log('[generateCompleteMarketAnalysis] Already exists, returning from cache');
      return Response.json({
        success: true,
        analysis: session.complete_market_analysis,
        fromCache: true
      });
    }

    const onboardingSummary = session.onboarding_summary || {};
    const onboardingFull = session.onboarding_full || {};
    const finalizedOffer = session.finalized_offer || {};
    const avatars = session.generated_avatars || {};
    const marketValidation = session.market_validation || '';

    const skill = session.skill || onboardingSummary.who_to_teach || 'Non défini';
    const learnerProfile = onboardingSummary.learner_profile || 'Non défini';
    const mainProblem = onboardingSummary.main_learning_problem || 'Non défini';
    const bigTransformation = onboardingSummary.big_transformation || 'Non défini';
    const methodAngle = onboardingSummary.method_angle || 'Non défini';
    const quickWin = onboardingSummary.quick_win || 'Non défini';

    const userPrompt = `CONTEXTE DU PROJET :

**Créateur :**
Prénom : ${user.firstName || onboardingFull.firstName || 'Non défini'}
Âge : ${onboardingFull.ageRange || 'Non défini'}
Revenus actuels : ${onboardingFull.currentIncome || 'Non défini'}€/mois
Objectif : ${onboardingFull.targetIncome || 'Non défini'}€/mois

**Compétence enseignée :**
${skill}

**Public cible :**
${learnerProfile}

**Problème à résoudre :**
${mainProblem}

**Quick win promis :**
${quickWin}

**Grande transformation :**
${bigTransformation}

**Méthode unique / Angle :**
${methodAngle}

**Erreur typique à éviter :**
${onboardingSummary.common_mistake || 'Non défini'}

**Preuve / Histoire personnelle :**
${onboardingSummary.proof_or_story || 'Non défini'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OFFRES CRÉÉES :

**Produit Principal :**
${JSON.stringify(finalizedOffer.mainProduct, null, 2)}

**Order Bump :**
${JSON.stringify(finalizedOffer.orderBump, null, 2)}

**Upsell :**
${JSON.stringify(finalizedOffer.upsell1, null, 2)}

**Premium :**
${JSON.stringify(finalizedOffer.upsell3, null, 2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AVATARS CLIENTS (pour référence) :
${JSON.stringify(avatars, null, 2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VALIDATION MARCHÉ (déjà générée) :
${marketValidation}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TA MISSION :

Génère une ANALYSE DE MARCHÉ COMPLÈTE selon la structure définie dans le system prompt.

**RÈGLES CRITIQUES :**

1. **Analyse le marché du PROBLÈME** : "${mainProblem}"
   ❌ Ne parle PAS du "marché de la formation en ligne"
   ✅ Parle du marché des personnes qui ont ce problème

2. **Sois SPÉCIFIQUE à ce projet**
   - Mentionne le skill : "${skill}"
   - Mentionne le public : "${learnerProfile}"
   - Mentionne la transformation : "${bigTransformation}"

3. **Donne des CHIFFRES réels ou estimés**
   ❌ "Beaucoup de personnes"
   ✅ "Environ 2,3M de personnes en France" ou "Environ 15-20% des entrepreneurs"

4. **Sois HONNÊTE**
   - Identifie les vraies faiblesses
   - Identifie les vraies menaces
   - Ne survends pas

5. **Sois ACTIONNABLE**
   - Recommandations concrètes
   - Canaux spécifiques
   - Actions précises

**EXEMPLE de bonne analyse de concurrence :**
❌ Mauvais : "Il y a des formations sur le no-code"
✅ Bon :
{
  "name": "Académie No-Code (type de concurrent)",
  "offering": "Formation complète Bubble en 8 semaines avec projets",
  "priceRange": "497-997€",
  "strengths": ["Support actif", "Communauté établie"],
  "weaknesses": ["Trop technique pour débutants", "Pas d'angle liberté géographique"],
  "marketShare": "Moyenne"
}

Génère maintenant l'analyse complète en JSON.`;

    console.log('ANTHROPIC_CALL start', {
      fn: 'generateCompleteMarketAnalysis',
      sessionId,
      model: 'claude-sonnet-4-20250514'
    });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: userPrompt }
      ]
    });

    console.log('ANTHROPIC_CALL end', {
      fn: 'generateCompleteMarketAnalysis',
      sessionId,
      usage: message.usage
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text.trim()
      : '{}';

    // Clean potential markdown
    const cleanedResponse = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    let completeAnalysis;
    try {
      completeAnalysis = JSON.parse(cleanedResponse);
    } catch (e) {
      console.error('JSON parse error:', e);
      return Response.json({
        error: 'Failed to parse market analysis',
        details: e.message
      }, { status: 500 });
    }

    // Save to session
    await base44.asServiceRole.entities.Session.update(sessionId, {
      complete_market_analysis: completeAnalysis
    });

    console.log('✅ [generateCompleteMarketAnalysis] Saved to session', { sessionId });

    return Response.json({
      success: true,
      analysis: completeAnalysis
    });

  } catch (error) {
    console.error('Error in generateCompleteMarketAnalysis:', error);
    return Response.json({
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
});