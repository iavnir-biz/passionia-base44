import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `RÔLE DE L'IA
Tu es Noah, analyste stratégique senior de Passion IA.
Tu produis des validations de marché de niveau McKinsey :
- analytiques
- structurées
- basées sur des données factuelles
- avec explications causales systématiques

OBJECTIF
Produire une validation qui fait dire à l'utilisateur :
"Ok, là c'est du sérieux. Ils ont VRAIMENT analysé MON projet."

INTERDICTIONS ABSOLUES
❌ Ne jamais :
- parler du "marché de la formation en ligne" de façon générique
- répéter la compétence brute (ex: "Aider les entrepreneurs à organiser leur business avec Notion")
- afficher un score sans explication causale précise
- utiliser des phrases applicables à n'importe quel projet
- faire du marketing bullshit

STRUCTURE OBLIGATOIRE

1️⃣ VALIDATION STRATÉGIQUE (Paragraphe 1)
Analyse en 3 points reliés par une logique causale :

POINT A — LE PROBLÈME EST RÉEL
"${name}, les [learner_profile] que tu cibles font face à [main_learning_problem spécifique].
Ce blocage n'est pas anodin : il les empêche de [conséquence concrète]."

POINT B — TON OFFRE RÉPOND PRÉCISÉMENT
"Ce que tu proposes répond directement à ce blocage : [quick_win] dès le départ,
puis [big_transformation] sur le long terme."

POINT C — LA VALEUR EST ÉVIDENTE
"Cette progression claire (problème → quick win → transformation) crée une valeur perçue forte,
ce qui justifie un positionnement premium."

2️⃣ ANALYSE COMPARATIVE (Paragraphe 2)
Structure McKinsey obligatoire :

"Comparé à d'autres niches d'enseignement en ligne :
- [Élément différenciant 1 basé sur method_angle]
- [Élément différenciant 2 basé sur learner_profile]
- [Élément différenciant 3 basé sur big_transformation]

Ces trois facteurs te donnent un avantage compétitif mesurable."

3️⃣ PROJECTION REVENUS JUSTIFIÉE (Paragraphe 3)
Explication causale des revenus :

"[targetIncome] € / mois est un objectif cohérent car :
→ Les formats que tu as choisis ([format_preferences]) permettent une scalabilité [élevée/moyenne]
→ Le niveau de transformation ([big_transformation]) justifie un pricing [low/mid/high]-ticket
→ Ton angle différenciant ([method_angle]) réduit la friction à l'achat

Le ratio effort/revenus est favorable."

FORMAT JSON DE SORTIE :
{
  "validationText": "Texte en 3 paragraphes séparés par \\n\\n (structure McKinsey stricte)",
  "marketScores": {
    "marketSize": 75,
    "demandIntensity": 82,
    "revenueRecurrence": 68,
    "onlineAccessibility": 90,
    "easeOfImplementation": 70
  },
  "scoreExplanations": {
    "marketSize": "Explication causale précise basée sur learner_profile",
    "demandIntensity": "Explication causale précise basée sur main_learning_problem",
    "revenueRecurrence": "Explication causale précise basée sur big_transformation",
    "onlineAccessibility": "Explication causale précise basée sur format_preferences",
    "easeOfImplementation": "Explication causale précise basée sur common_mistake"
  },
  "sources": {
    "foundNicheData": true,
    "dataQuality": "high",
    "statsCount": 0
  }
}

TON & STYLE
- Analytique, structuré, McKinsey
- Phrases courtes, précises
- Logique causale explicite (→, car, donc)
- Tutoiement + prénom
- Zéro fluff, zéro marketing
- Crédibilité maximale

⚠️ VALIDATION :
- 3 paragraphes distincts (séparés par \\n\\n)
- Chaque paragraphe suit SA structure obligatoire
- Scores + explications causales (scoreExplanations)
- Longueur minimale : 400 caractères
- Aucun terme générique`;

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
        marketValidation: session.market_validation,
        marketScores: session.market_validation_scores || {},
        sources: session.market_validation_sources || {},
        fromCache: true
      });
    }

    const finalizedOffer = session.finalized_offer || {};
    const onboardingSummary = session.onboarding_summary || {};
    const onboardingFull = session.onboarding_full || {};
    
    const name = user.firstName || onboardingFull.firstName || 'l\'entrepreneur';
    const gender = user.gender || onboardingFull.gender || '';
    // 🔥 P2: Fallback session.skill prioritaire
    const skill = session.skill || onboardingSummary.who_to_teach || onboardingFull.coreSkill || onboardingFull.skill || 'cette compétence';
    const mainProductTitle = finalizedOffer.mainProduct?.title || 'ton produit principal';
    // 🔥 P2: Protection anti-payload énorme
    const mainProductDescription = (finalizedOffer.mainProduct?.description || '').slice(0, 600);
    const upsell1Title = finalizedOffer.upsell1?.title || '';
    const premiumTitle = finalizedOffer.upsell3?.title || '';

    // Déterminer les accords grammaticaux selon le genre
    let genderAgreement = '';
    if (gender === 'Femme') {
      genderAgreement = 'IMPORTANT: L\'utilisateur est une femme. Utilise les accords féminins (elle, alignée, motivée, prête, etc.) dans tout le texte.';
    } else if (gender === 'Homme') {
      genderAgreement = 'IMPORTANT: L\'utilisateur est un homme. Utilise les accords masculins (il, aligné, motivé, prêt, etc.) dans tout le texte.';
    } else {
      genderAgreement = 'IMPORTANT: Genre non spécifié. Utilise "il/elle" ou reformule pour éviter les accords de genre quand possible.';
    }

    const userPrompt = `${genderAgreement}

DONNÉES D'ONBOARDING (À EXPLOITER OBLIGATOIREMENT) :

📋 ONBOARDING SUMMARY :
- who_to_teach : ${onboardingSummary.who_to_teach || 'non spécifié'}
- learner_profile : ${onboardingSummary.learner_profile || 'non spécifié'}
- main_learning_problem : ${onboardingSummary.main_learning_problem || 'non spécifié'}
- quick_win : ${onboardingSummary.quick_win || 'non spécifié'}
- big_transformation : ${onboardingSummary.big_transformation || 'non spécifié'}
- method_angle : ${onboardingSummary.method_angle || 'non spécifié'}
- common_mistake : ${onboardingSummary.common_mistake || 'non spécifié'}
- proof_or_story : ${onboardingSummary.proof_or_story || 'non spécifié'}
- format_preferences : ${JSON.stringify(onboardingSummary.format_preferences || [])}

🎯 OBJECTIFS & CONTRAINTES :
- Objectif revenu : ${onboardingFull.targetIncome || 'non spécifié'} € / mois
- Délai souhaité : ${onboardingFull.targetIncomeDelay || 'non spécifié'} mois
- Freins perçus : ${JSON.stringify(onboardingFull.perceivedObstacles || [])}
- Niveau de préparation : ${onboardingFull.readinessScore || 'non spécifié'}/10

📦 OFFRES SÉLECTIONNÉES :
- Produit Principal : "${mainProductTitle}"
- Offre Supérieure : "${upsell1Title}"
- Offre Premium : "${premiumTitle}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 MISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GÉNÈRE UN TEXTE DE VALIDATION EN 3 PARAGRAPHES :

1️⃣ PARAGRAPHE 1 — POURQUOI ÇA FONCTIONNE
Relie :
- La douleur (main_learning_problem)
- Le résultat rapide (quick_win)
- La transformation (big_transformation)

Exemple de structure :
"${name}, ce que tu proposes répond à un vrai blocage : [main_learning_problem]. 
Ce que tu leur apportes, c'est d'abord [quick_win], puis la capacité de [big_transformation]."

❌ Ne PAS répéter "enseigner ${skill}"
✅ Parler de la TRANSFORMATION vécue par l'élève

2️⃣ PARAGRAPHE 2 — POURQUOI LE MARCHÉ EST SOLIDE
Base tes explications sur :
- learner_profile (qui est prêt à payer)
- main_learning_problem (intensité de la douleur)
- method_angle (différenciation)

❌ Ne PAS parler du "marché de la formation en ligne" de façon générique
✅ Expliquer pourquoi CES personnes avec CE problème sont prêtes à investir

3️⃣ PARAGRAPHE 3 — POURQUOI LES REVENUS SONT ATTEIGNABLES
Relier :
- format_preferences (vidéos, PDFs, 1-on-1, etc.)
- targetIncome et targetDelay
- big_transformation (valeur perçue)

Expliquer :
"[targetIncome] € / mois est atteignable car [raisons basées sur formats + transformation]"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 CALCUL DES SCORES + EXPLICATIONS CAUSALES (OBLIGATOIRE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pour CHAQUE score, tu DOIS générer :
1. Un score numérique (0-100)
2. Une explication causale précise (scoreExplanations)

STRUCTURE DES EXPLICATIONS (TYPE MCKINSEY) :
"Score [élevé/modéré/faible] car [raison factuelle basée sur données onboarding]"

EXEMPLES DE BONNES EXPLICATIONS :

marketSize (basé sur learner_profile) :
✅ "Score modéré (68) car tu cibles une niche spécifique : les [learner_profile]. Population ciblée estimée à quelques milliers en France, mais demande concentrée."
❌ "Score élevé car grand marché"

demandIntensity (basé sur main_learning_problem) :
✅ "Score élevé (84) car le problème '[main_learning_problem]' crée une friction quotidienne pour ton audience. Besoin ressenti immédiat."
❌ "Score élevé car forte demande"

revenueRecurrence (basé sur big_transformation) :
✅ "Score élevé (79) car la transformation '[big_transformation]' nécessite un accompagnement dans la durée. Potentiel de renouvellement fort (coaching, communauté)."
❌ "Score élevé car récurrent"

onlineAccessibility (basé sur format_preferences) :
✅ "Score très élevé (92) car tes formats privilégiés ([format_preferences]) sont 100% digitaux et scalables sans limite géographique."
❌ "Score élevé car en ligne"

easeOfImplementation (basé sur method_angle + common_mistake) :
✅ "Score modéré (71) car ton angle '[method_angle]' nécessite un cadrage initial, mais évite l'erreur '[common_mistake]' qui ralentit habituellement la mise en œuvre."
❌ "Score moyen"

RÈGLES DES SCORES :
- marketSize : niche spécifique = 50-68, marché moyen = 69-79, large = 80-95
- demandIntensity : douleur faible = 50-65, moyenne = 66-79, forte = 80-95
- revenueRecurrence : ponctuel = 50-65, significatif = 66-79, profond = 80-95
- onlineAccessibility : présentiel = 40-55, mix = 60-75, 100% online = 80-95
- easeOfImplementation : complexe = 50-65, moyen = 66-79, simple = 80-95

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CONTRAINTES STRICTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ OBLIGATOIRE :
- 3 paragraphes distincts (séparés par \\n\\n)
- Longueur minimale : 350 caractères
- Scores justifiés par les données d'onboarding
- Aucun terme générique du type "marché de la formation en ligne"
- Tutoiement + prénom (${name})
- Ton rassurant, intelligent, crédible

❌ INTERDIT :
- Répéter la compétence brute
- Parler du "marché e-learning global"
- Scores sans justification
- Phrases applicables à n'importe quel projet

RETOURNE UN JSON avec validationText + marketScores + sources`;

    console.log('🔍 [generateMarketValidation] Démarrage recherche web', { 
      fn: 'generateMarketValidation',
      sessionId,
      skill
    });

    // 🔥 P1: Retry avec validation format + recherche web
    let result = null;
    let attempt = 0;
    const maxRetries = 2;

    while (attempt <= maxRetries && !result) {
      attempt++;
      
      console.log(`🔄 [generateMarketValidation] Tentative ${attempt}/${maxRetries + 1}`);

      // 🧠 Utiliser InvokeLLM SANS recherche web (données onboarding suffisent)
      const llmResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `${SYSTEM_PROMPT}\n\n---\n\n${userPrompt}`,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            validationText: {
              type: "string",
              description: "Texte de validation en 3 paragraphes séparés par \\n\\n (structure McKinsey)"
            },
            marketScores: {
              type: "object",
              properties: {
                marketSize: { type: "number", minimum: 0, maximum: 100 },
                demandIntensity: { type: "number", minimum: 0, maximum: 100 },
                revenueRecurrence: { type: "number", minimum: 0, maximum: 100 },
                onlineAccessibility: { type: "number", minimum: 0, maximum: 100 },
                easeOfImplementation: { type: "number", minimum: 0, maximum: 100 }
              },
              required: ["marketSize", "demandIntensity", "revenueRecurrence", "onlineAccessibility", "easeOfImplementation"]
            },
            scoreExplanations: {
              type: "object",
              properties: {
                marketSize: { type: "string" },
                demandIntensity: { type: "string" },
                revenueRecurrence: { type: "string" },
                onlineAccessibility: { type: "string" },
                easeOfImplementation: { type: "string" }
              },
              required: ["marketSize", "demandIntensity", "revenueRecurrence", "onlineAccessibility", "easeOfImplementation"]
            },
            sources: {
              type: "object",
              properties: {
                foundNicheData: { type: "boolean" },
                dataQuality: { type: "string", enum: ["high", "medium", "low"] },
                statsCount: { type: "number", minimum: 0 }
              },
              required: ["foundNicheData", "dataQuality", "statsCount"]
            }
          },
          required: ["validationText", "marketScores", "scoreExplanations", "sources"]
        }
      });

      const sources = llmResponse?.sources || { foundNicheData: false, dataQuality: 'low', statsCount: 0 };
      const scoreExplanations = llmResponse?.scoreExplanations || {};
      
      console.log('✅ [generateMarketValidation] LLM response reçu', {
        attempt,
        skill,
        hasText: !!llmResponse?.validationText,
        hasScores: !!llmResponse?.marketScores,
        hasExplanations: !!llmResponse?.scoreExplanations,
        explanationsCount: Object.keys(scoreExplanations).length,
        foundNicheData: sources.foundNicheData,
        dataQuality: sources.dataQuality,
        statsCount: sources.statsCount
      });

      const generatedText = llmResponse?.validationText?.trim() || '';
      const marketScores = llmResponse?.marketScores || null;

      // 🔥 VALIDATION GUARDRAILS RENFORCÉS
      const sections = generatedText.split('\n\n');
      const isLongEnough = generatedText.length > 400;
      const hasValidScores = marketScores && 
        Object.keys(marketScores).length === 5 &&
        Object.values(marketScores).every(v => typeof v === 'number' && v >= 0 && v <= 100);
      
      const hasValidExplanations = scoreExplanations &&
        Object.keys(scoreExplanations).length === 5 &&
        Object.values(scoreExplanations).every(v => typeof v === 'string' && v.length > 30);
      
      // 🔥 VALIDATION : structure + longueur + scores + explications
      const isValid = sections.length === 3 && isLongEnough && hasValidScores && hasValidExplanations;

      if (isValid) {
        result = {
          validationText: generatedText,
          marketScores,
          scoreExplanations,
          sources
        };
        console.log('✅ [generateMarketValidation] Validation réussie:', {
          sections: sections.length,
          length: generatedText.length,
          scores: marketScores,
          explanations: Object.keys(scoreExplanations).length,
          foundNicheData: sources.foundNicheData,
          dataQuality: sources.dataQuality
        });
      } else {
        console.warn('⚠️ [generateMarketValidation] Format invalide:', {
          sections: sections.length,
          length: generatedText.length,
          hasValidScores,
          hasValidExplanations,
          explanationsCount: Object.keys(scoreExplanations).length,
          foundNicheData: sources.foundNicheData,
          dataQuality: sources.dataQuality,
          statsCount: sources.statsCount,
          attempt
        });

        // Dernier essai échoué ? Fallback safe avec scores conservateurs
        if (attempt > maxRetries) {
          console.error('❌ [generateMarketValidation] Max retries atteint, fallback conservateur', {
            reason: !hasValidExplanations ? 'explications_manquantes' : 'format_invalide',
            foundNicheData: sources.foundNicheData,
            dataQuality: sources.dataQuality,
            statsCount: sources.statsCount
          });
          result = {
            validationText: `${name}, les personnes que tu veux aider font face à un blocage réel. Ce problème les empêche de progresser efficacement.

Ce que tu proposes répond directement à ce blocage : un résultat rapide dès le départ, puis une transformation durable. Cette progression claire crée une valeur perçue forte.

Ton objectif de revenus est cohérent avec les formats que tu as choisis et le niveau de transformation que tu apportes. Le ratio effort/revenus est favorable.`,
            marketScores: {
              marketSize: 55,
              demandIntensity: 60,
              revenueRecurrence: 52,
              onlineAccessibility: 70,
              easeOfImplementation: 58
            },
            scoreExplanations: {
              marketSize: "Score modéré car audience ciblée spécifique.",
              demandIntensity: "Score modéré car besoin identifié.",
              revenueRecurrence: "Score modéré car potentiel de récurrence.",
              onlineAccessibility: "Score élevé car formats digitaux.",
              easeOfImplementation: "Score modéré car mise en œuvre progressive."
            },
            sources: {
              foundNicheData: false,
              dataQuality: 'low',
              statsCount: 0
            }
          };
        }
      }
    }

    // Save to session avec metadata sources + explications
    await base44.asServiceRole.entities.Session.update(sessionId, {
      market_validation: result.validationText,
      market_validation_scores: result.marketScores,
      market_validation_score_explanations: result.scoreExplanations,
      market_validation_sources: result.sources
    });

    console.log('💾 [generateMarketValidation] Sauvegardé en session:', {
      sessionId,
      skill,
      foundNicheData: result.sources.foundNicheData,
      dataQuality: result.sources.dataQuality,
      statsCount: result.sources.statsCount,
      avgScore: Math.round(Object.values(result.marketScores).reduce((a, b) => a + b, 0) / 5),
      hasExplanations: !!result.scoreExplanations
    });

    return Response.json({
      success: true,
      marketValidation: result.validationText,
      marketScores: result.marketScores,
      scoreExplanations: result.scoreExplanations,
      sources: result.sources
    });

  } catch (error) {
    console.error('Error generating market validation:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});