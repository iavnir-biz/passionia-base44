import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es Noah, une IA analyste marché et stratège pédagogique.

🌐 RECHERCHE WEB OBLIGATOIRE
AVANT de répondre, tu DOIS effectuer une recherche web approfondie sur :
- Le marché de la niche EXACTE de l'utilisateur (pas juste "e-learning")
- Les statistiques sectorielles récentes (Statista, études de marché, rapports)
- Les tendances de recherche et comportements d'achat
- La croissance du secteur spécifique
- Les données de demande (volume de recherches, forums, communautés)

❌ INTERDIT : 
- Utiliser des chiffres génériques ou inventés
- Parler uniquement du "marché e-learning global"
- Utiliser des pourcentages ultra-précis (14,7% → arrondir à 15%)
- Donner des chiffres sans contexte temporel

✅ OBLIGATOIRE :
- AU MOINS 1 statistique SPÉCIFIQUE à la niche (pas juste e-learning)
- Arrondir les pourcentages (≈, environ, plus de, etc.)
- Mentionner l'année ou la période (2024, ces dernières années, etc.)
- S'appuyer sur des données réelles trouvées en ligne

FORMAT JSON DE SORTIE STRICT :
{
  "validationText": "Texte en 3 sections séparées par \\n\\n",
  "marketScores": {
    "marketSize": 75,
    "demandIntensity": 82,
    "revenueRecurrence": 68,
    "onlineAccessibility": 90,
    "easeOfImplementation": 70
  },
  "sources": {
    "foundNicheData": true,
    "dataQuality": "high",
    "statsCount": 3
  }
}

SCORES (0-100) :
- marketSize : Taille du marché (petit=40-60, moyen=60-80, grand=80-100)
- demandIntensity : Intensité de la demande actuelle
- revenueRecurrence : Potentiel de revenus récurrents
- onlineAccessibility : Facilité d'accès global/online
- easeOfImplementation : Facilité de mise en œuvre

SOURCES :
- foundNicheData : true si données spécifiques à la niche trouvées
- dataQuality : "high", "medium", "low"
- statsCount : nombre de statistiques chiffrées utilisées

⚠️ Les scores DOIVENT varier selon la niche réelle analysée
⚠️ Si aucune donnée fiable : fallback qualitatif + scores conservateurs (50-65)

TON & STYLE
- Ton rassurant, professionnel, humain
- Toujours spécifique à la niche EXACTE
- Tutoiement + prénom
- 2-3 émojis pertinents (🎯, 💡, 🚀, 📈, ✨, 💰)
- Paragraphes courts (3 sections distinctes)`;

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

NICHE À ANALYSER : "${skill}"

CONTEXTE UTILISATEUR :
- Prénom : ${name}
- Produit Principal : "${mainProductTitle}"
- Description : ${mainProductDescription}
- Offre Supérieure : "${upsell1Title}"
- Offre Premium : "${premiumTitle}"

🔍 ÉTAPE 1 (OBLIGATOIRE) : RECHERCHE WEB
Effectue une recherche approfondie sur :
- Le marché SPÉCIFIQUE de "${skill}" (pas juste "e-learning global")
- Les statistiques sectorielles RÉCENTES (avec année/période)
- La demande en ligne (volume de recherches, forums, communautés)
- Les frustrations réelles des apprenants dans ce domaine
- Les comportements d'achat dans cette niche

🎯 ÉTAPE 2 : RÉDACTION
Basé sur les données trouvées, rédige :
- Une analyse en 3 sections (séparées par \\n\\n)
- AU MOINS 1 statistique SPÉCIFIQUE à "${skill}" (pas juste e-learning)
- Chiffres arrondis avec contexte temporel (≈, environ, 2024, etc.)
- Des douleurs concrètes identifiées via ta recherche
- 2-3 émojis bien placés

📊 ÉTAPE 3 : CALCUL DES SCORES + METADATA
Évalue 5 dimensions sur 100 selon les données trouvées :
- marketSize : taille réelle du marché
- demandIntensity : intensité actuelle de la demande
- revenueRecurrence : potentiel de revenus récurrents
- onlineAccessibility : accessibilité globale/online
- easeOfImplementation : facilité de mise en œuvre

AJOUTE LES METADATA SOURCES :
- foundNicheData : true si tu as trouvé des données spécifiques à "${skill}"
- dataQuality : "high" si plusieurs sources fiables, "medium" si partiel, "low" si peu de données
- statsCount : nombre de statistiques chiffrées dans ton texte

⚠️ Si données insuffisantes : analyse qualitative + scores conservateurs (50-65) + foundNicheData=false

RETOURNE UN JSON STRICT avec validationText + marketScores + sources`;

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

      // 🌐 Utiliser InvokeLLM avec recherche web
      const llmResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `${SYSTEM_PROMPT}\n\n---\n\n${userPrompt}`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            validationText: {
              type: "string",
              description: "Texte de validation en 3 sections séparées par \\n\\n"
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
          required: ["validationText", "marketScores", "sources"]
        }
      });

      const sources = llmResponse?.sources || { foundNicheData: false, dataQuality: 'low', statsCount: 0 };
      
      console.log('✅ [generateMarketValidation] LLM response reçu', {
        attempt,
        skill,
        hasText: !!llmResponse?.validationText,
        hasScores: !!llmResponse?.marketScores,
        foundNicheData: sources.foundNicheData,
        dataQuality: sources.dataQuality,
        statsCount: sources.statsCount
      });

      const generatedText = llmResponse?.validationText?.trim() || '';
      const marketScores = llmResponse?.marketScores || null;

      // 🔥 VALIDATION GUARDRAILS RENFORCÉS
      const sections = generatedText.split('\n\n');
      const numberCount = (generatedText.match(/\d+/g) || []).length;
      const isLongEnough = generatedText.length > 350;
      const hasValidScores = marketScores && 
        Object.keys(marketScores).length === 5 &&
        Object.values(marketScores).every(v => typeof v === 'number' && v >= 0 && v <= 100);
      
      // 🔥 VALIDATION SOURCES : au moins 2 stats + qualité medium minimum
      const hasGoodData = sources.foundNicheData && sources.statsCount >= 2 && sources.dataQuality !== 'low';

      const isValid = sections.length === 3 && numberCount >= 2 && isLongEnough && hasValidScores && hasGoodData;

      if (isValid) {
        result = {
          validationText: generatedText,
          marketScores,
          sources
        };
        console.log('✅ [generateMarketValidation] Validation réussie:', {
          sections: sections.length,
          numbers: numberCount,
          length: generatedText.length,
          scores: marketScores,
          foundNicheData: sources.foundNicheData,
          dataQuality: sources.dataQuality
        });
      } else {
        console.warn('⚠️ [generateMarketValidation] Format invalide:', {
          sections: sections.length,
          numbers: numberCount,
          length: generatedText.length,
          hasValidScores,
          hasGoodData,
          foundNicheData: sources.foundNicheData,
          dataQuality: sources.dataQuality,
          statsCount: sources.statsCount,
          attempt
        });

        // Dernier essai échoué ? Fallback safe avec scores conservateurs
        if (attempt > maxRetries) {
          console.error('❌ [generateMarketValidation] Max retries atteint, fallback conservateur', {
            reason: !hasGoodData ? 'données_insuffisantes' : 'format_invalide',
            foundNicheData: sources.foundNicheData,
            dataQuality: sources.dataQuality,
            statsCount: sources.statsCount
          });
          result = {
            validationText: `${name}, ton projet dans "${skill}" répond à un vrai besoin. 🎯

Le marché de la formation en ligne connaît une croissance significative, et de nombreuses personnes cherchent des solutions pour progresser dans ce domaine. 📈

Ta proposition arrive au bon moment : les personnes que tu veux aider sont prêtes à investir dans leur apprentissage. 💡`,
            marketScores: {
              marketSize: 55,
              demandIntensity: 60,
              revenueRecurrence: 52,
              onlineAccessibility: 70,
              easeOfImplementation: 58
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

    // Save to session avec metadata sources
    await base44.asServiceRole.entities.Session.update(sessionId, {
      market_validation: result.validationText,
      market_validation_scores: result.marketScores,
      market_validation_sources: result.sources
    });

    console.log('💾 [generateMarketValidation] Sauvegardé en session:', {
      sessionId,
      skill,
      foundNicheData: result.sources.foundNicheData,
      dataQuality: result.sources.dataQuality,
      statsCount: result.sources.statsCount,
      avgScore: Math.round(Object.values(result.marketScores).reduce((a, b) => a + b, 0) / 5)
    });

    return Response.json({
      success: true,
      marketValidation: result.validationText,
      marketScores: result.marketScores,
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