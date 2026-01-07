import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es Noah, une IA analyste marché et stratège pédagogique.

🌐 RECHERCHE WEB OBLIGATOIRE
AVANT de répondre, tu DOIS effectuer une recherche web approfondie sur :
- Le marché de la niche exacte de l'utilisateur
- Les statistiques sectorielles récentes (Statista, études de marché, rapports)
- Les tendances de recherche et comportements d'achat
- La croissance du e-learning dans ce secteur spécifique
- Les données de demande (volume de recherches, forums, communautés)

❌ INTERDIT : utiliser des chiffres génériques ou inventés
✅ OBLIGATOIRE : s'appuyer sur des données réelles trouvées en ligne

OBJECTIF :
Rassurer l'utilisateur avec des PREUVES RÉELLES que son marché existe et est viable.

TON & STYLE
- Ton rassurant, professionnel, humain
- Jamais vendeur agressif
- Toujours spécifique à la niche EXACTE (pas générique)
- Tutoiement obligatoire
- Adresse-toi à l'utilisateur par son prénom
- Texte fluide, pas de formatage Markdown
- Paragraphes courts et aérés (3 sections distinctes)
- 2-3 émojis pertinents (🎯, 💡, 🚀, 📈, ✨, 💰)

CONTENU ATTENDU
1) Introduction personnalisée avec le prénom
2) AU MOINS 2-3 statistiques RÉELLES et SPÉCIFIQUES à la niche
3) Frustrations et douleurs RÉELLES de la cible (trouvées via recherche)
4) Preuve que des gens cherchent activement cette solution
5) Validation que ce marché peut être monétisé
6) Conclusion motivante et réaliste

FORMAT JSON DE SORTIE STRICT :
{
  "validationText": "Texte en 3 sections séparées par \\n\\n",
  "marketScores": {
    "marketSize": 75,
    "demandIntensity": 82,
    "revenueRecurrence": 68,
    "onlineAccessibility": 90,
    "easeOfImplementation": 70
  }
}

SCORES (0-100) :
- marketSize : Taille du marché (petit=40-60, moyen=60-80, grand=80-100)
- demandIntensity : Intensité de la demande actuelle
- revenueRecurrence : Potentiel de revenus récurrents
- onlineAccessibility : Facilité d'accès global/online
- easeOfImplementation : Facilité de mise en œuvre

⚠️ Les scores DOIVENT varier selon la niche réelle analysée
⚠️ Si aucune donnée fiable : fallback qualitatif + scores conservateurs (50-65)

INTERDICTIONS :
- Stats génériques identiques pour tous
- Chiffres inventés sans source
- Ton marketing agressif`;

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
- Le marché de "${skill}" (taille, croissance, tendances)
- Les statistiques sectorielles récentes
- La demande en ligne (volume de recherches, forums, communautés)
- Les frustrations réelles des apprenants dans ce domaine
- Les comportements d'achat dans cette niche

🎯 ÉTAPE 2 : RÉDACTION
Basé sur les données trouvées, rédige :
- Une analyse en 3 sections (séparées par \\n\\n)
- Minimum 2-3 statistiques RÉELLES et SPÉCIFIQUES
- Des douleurs concrètes identifiées via ta recherche
- 2-3 émojis bien placés

📊 ÉTAPE 3 : CALCUL DES SCORES
Évalue 5 dimensions sur 100 selon les données trouvées :
- marketSize : taille réelle du marché
- demandIntensity : intensité actuelle de la demande
- revenueRecurrence : potentiel de revenus récurrents
- onlineAccessibility : accessibilité globale/online
- easeOfImplementation : facilité de mise en œuvre

⚠️ Si données insuffisantes : analyse qualitative + scores conservateurs (50-65)

RETOURNE UN JSON STRICT avec validationText + marketScores`;

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
            }
          },
          required: ["validationText", "marketScores"]
        }
      });

      console.log('✅ [generateMarketValidation] LLM response reçu', {
        attempt,
        hasText: !!llmResponse?.validationText,
        hasScores: !!llmResponse?.marketScores
      });

      const generatedText = llmResponse?.validationText?.trim() || '';
      const marketScores = llmResponse?.marketScores || null;

      // 🔥 VALIDATION GUARDRAILS
      const sections = generatedText.split('\n\n');
      const numberCount = (generatedText.match(/\d+/g) || []).length;
      const isLongEnough = generatedText.length > 350;
      const hasValidScores = marketScores && 
        Object.keys(marketScores).length === 5 &&
        Object.values(marketScores).every(v => typeof v === 'number' && v >= 0 && v <= 100);

      const isValid = sections.length === 3 && numberCount >= 2 && isLongEnough && hasValidScores;

      if (isValid) {
        result = {
          validationText: generatedText,
          marketScores
        };
        console.log('✅ [generateMarketValidation] Validation réussie:', {
          sections: sections.length,
          numbers: numberCount,
          length: generatedText.length,
          scores: marketScores
        });
      } else {
        console.warn('⚠️ [generateMarketValidation] Format invalide:', {
          sections: sections.length,
          numbers: numberCount,
          length: generatedText.length,
          hasValidScores,
          attempt
        });

        // Dernier essai échoué ? Fallback safe
        if (attempt > maxRetries) {
          console.error('❌ [generateMarketValidation] Max retries atteint, fallback');
          result = {
            validationText: `${name}, ton projet dans "${skill}" répond à un vrai besoin. 🎯

Le marché de la formation en ligne connaît une croissance significative, et de nombreuses personnes cherchent des solutions pour progresser dans ce domaine. 📈

Ta proposition arrive au bon moment : les personnes que tu veux aider sont prêtes à investir dans leur apprentissage. 💡`,
            marketScores: {
              marketSize: 60,
              demandIntensity: 65,
              revenueRecurrence: 58,
              onlineAccessibility: 75,
              easeOfImplementation: 62
            }
          };
        }
      }
    }

    // Save to session
    await base44.asServiceRole.entities.Session.update(sessionId, {
      market_validation: result.validationText,
      market_validation_scores: result.marketScores
    });

    return Response.json({
      success: true,
      marketValidation: result.validationText,
      marketScores: result.marketScores
    });

  } catch (error) {
    console.error('Error generating market validation:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});