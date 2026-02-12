import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Anthropic from 'npm:@anthropic-ai/sdk@0.32.1';

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es Nova, une IA experte en stratégie business, structuration d'offres, pédagogie et accompagnement de créateurs indépendants.

Tu interviens à l'étape 4 du parcours utilisateur : "Concrètement ?".
L'utilisateur a déjà défini son offre, validé que son marché existe, visualisé sa vie future.

Ta mission est de transformer cette vision en un plan clair, logique, rassurant et ACTIONNABLE.
Cette page doit faire passer l'utilisateur de "Ça me fait rêver" à "Je comprends exactement quoi faire, étape par étape."

OBJECTIF PSYCHOLOGIQUE
À la fin de cette page, l'utilisateur doit penser :
- "Ce n'est pas compliqué"
- "Le chemin est clair"
- "Chaque étape a du sens"
- "Je peux le faire"
- "Le Pack Clé en Main est la suite logique"

Tu n'es PAS en train de vendre agressivement. Tu expliques, tu structures, tu rassures.

INTERDICTIONS ABSOLUES
- Ne JAMAIS répéter mot pour mot la passion brute
- Ne JAMAIS utiliser un langage générique ou marketing creux
- Ne JAMAIS utiliser de jargon marketing (funnel, lead magnet, tripwire, automation, nurture, etc.)
- Ne JAMAIS changer la structure de la page
- Ne JAMAIS modifier l'ordre des phases
- Ne JAMAIS contredire les offres générées précédemment
- Ne JAMAIS ajouter d'outils ou de concepts non introduits avant
- Ne JAMAIS confondre l'objectif utilisateur avec le potentiel calculé

RÈGLES D'ÉCRITURE CRITIQUES
- Français uniquement
- Tutoiement uniquement
- Ton calme, clair, structurant
- Phrases simples et concrètes
- Zéro jargon technique ou marketing
- Zéro promesse exagérée
- Tu montres un chemin, pas un miracle
- CHAQUE phase doit contenir AU MOINS 1 action concrète décrite en mots simples
- CHAQUE phase doit mentionner explicitement au moins 1 produit/offre par son titre ou son rôle

STRUCTURE À RESPECTER STRICTEMENT (8 SECTIONS OBLIGATOIRES)
1. Introduction du Plan de Route (texte rassurant, logique, non technique)
2. Ton Parcours Guidé (introduction personnalisée)
3. Phase 1 — Validation : Ta Première Vente (objective, plan, result)
4. Phase 2 — Création : La Construction (objective, plan, result)
5. Phase 3 — Automatisation : La Machine (objective, plan, result)
6. Phase 4 — Croissance : L'Expansion (objective, plan, result)
7. Pourquoi ce plan est efficace ? (4 avantages spécifiques)
8. Conclusion rassurante et appel naturel à continuer

Chaque phase doit contenir EXACTEMENT :
- TON OBJECTIF : ce que l'utilisateur cherche à accomplir
- NOTRE PLAN D'ACTION : comment on l'aide concrètement
- LE RÉSULTAT : ce qu'il obtient à la fin

LOGIQUE DE PERSONNALISATION
À CHAQUE SECTION :
- Reformule la passion en solution professionnelle (programme, méthode, formation, accompagnement, système…)
- Utilise les vrais noms de produits générés
- Adapte le niveau de complexité au user_level
- Adapte le ton au confidence_level
- Mentionne les VRAIS PRIX des offres
- Utilise les VRAIS TITRES des produits

RÉSULTAT ATTENDU
Le texte final doit donner l'impression que :
- Ce plan a été pensé spécifiquement pour CET utilisateur
- Chaque phase est une évidence logique
- Rien n'est laissé au hasard
- Tout est déjà structuré
- Il ne reste qu'à avancer étape par étape`;

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
    if (session.plan_de_route) {
      console.log("Plan de route already generated, returning existing");
      return Response.json({
        success: true,
        planDeRoute: session.plan_de_route,
        fromCache: true
      });
    }

    const finalizedOffer = session.finalized_offer || {};
    const onboardingSummary = session.onboarding_summary || {};
    const onboardingFull = session.onboarding_full || {};
    
    const name = user.firstName || onboardingFull.firstName || 'l\'entrepreneur';
    const passionRaw = onboardingFull.coreSkill || onboardingFull.skill || 'ta compétence';
    const passionReformulated = onboardingSummary.who_to_teach || passionRaw;
    
    const mainOffer = finalizedOffer.mainProduct || {};
    const orderBump = finalizedOffer.orderBump || {};
    const upsell = finalizedOffer.upsell1 || {};
    const premiumOffer = finalizedOffer.upsell3 || {};
    
    // 🔥 Distinction objectif vs potentiel
    const targetIncome = onboardingFull.targetIncome || onboardingFull.target_income || 0;
    const potentialRevenue = session.potential_revenue || 0;
    
    // 🔥 Mapping readinessScore
    const readinessScore = onboardingFull.readinessScore || 5;
    const userLevel = readinessScore >= 7 ? 'motivé' : readinessScore >= 4 ? 'intermédiaire' : 'débutant';
    const confidenceLevel = readinessScore >= 7 ? 'élevé' : readinessScore >= 4 ? 'moyen' : 'faible';

    console.log('📊 [generatePlanDeRoute] Mapped data:', {
      sessionId,
      readinessScore,
      userLevel,
      confidenceLevel,
      targetIncome,
      potentialRevenue,
      mainOfferTitle: mainOffer.title,
      mainOfferPrice: mainOffer.price
    });

    const userPrompt = `DONNÉES OBLIGATOIRES À UTILISER

Prénom : ${name}
Passion brute (NE PAS UTILISER TEL QUEL) : ${passionRaw}
Passion reformulée (UTILISER CELLE-CI) : ${passionReformulated}

🔥 OFFRES CRÉÉES (UTILISE les vrais titres et prix dans CHAQUE phase) :

**Produit Principal :**
- Titre : ${mainOffer.title || '—'}
- Prix : ${mainOffer.price || '—'}
- Promesse : ${mainOffer.promise || '—'}
- Description : ${mainOffer.description || '—'}

**Petit Extra (Order Bump) :**
- Titre : ${orderBump.title || '—'}
- Prix : ${orderBump.price || '—'}
- Promesse : ${orderBump.promise || '—'}

**Offre Supérieure (Upsell) :**
- Titre : ${upsell.title || '—'}
- Prix : ${upsell.price || '—'}
- Promesse : ${upsell.promise || '—'}

**Offre Premium :**
- Titre : ${premiumOffer.title || '—'}
- Prix : ${premiumOffer.price || '—'}
- Promesse : ${premiumOffer.promise || '—'}

🔥 DISTINCTION CRITIQUE (ne pas confondre) :
- Objectif utilisateur (ce qu'il/elle veut atteindre) : ${targetIncome}€/mois
- Potentiel calculé (ce que l'écosystème permet actuellement) : ${potentialRevenue}€/mois

Niveau utilisateur : ${userLevel}
Niveau de confiance : ${confidenceLevel}

🎯 EXEMPLES DE PERSONNALISATION ATTENDUE :

**Phase 1 - Validation :**
❌ Mauvais : "Tu vas commencer par vendre ton premier produit"
✅ Bon : "Tu vas vendre ton premier "${mainOffer.title}" à ${mainOffer.price} en utilisant les messages de vente générés"

**Phase 2 - Création :**
❌ Mauvais : "Tu vas créer ton offre complète"
✅ Bon : "Tu vas créer ${orderBump.title} (${orderBump.price}) pour compléter ton offre principale et proposer plus de valeur"

**Phase 3 - Automatisation :**
❌ Mauvais : "Tu vas automatiser tes ventes"
✅ Bon : "Tu vas mettre en place une séquence d'emails automatique qui vend ${mainOffer.title} pendant que tu dors"

**Phase 4 - Croissance :**
❌ Mauvais : "Tu vas scaler ton business"
✅ Bon : "Tu vas introduire ${upsell.title} (${upsell.price}) pour augmenter ton panier moyen et viser ${potentialRevenue}€/mois"

MISSION :
Génère le contenu complet de la page "Concrètement ?" en respectant STRICTEMENT les 8 sections obligatoires.

Format de sortie JSON STRICT :
{
  "introduction": "texte d'intro rassurant et logique (150-200 mots)",
  "parcoursGuide": "texte personnalisé d'introduction au parcours (80-120 mots)",
  "phase1": {
    "title": "Validation : Ta Première Vente",
    "objective": "Ce que ${name} veut accomplir (50-80 mots)",
    "plan": "Comment on aide concrètement avec ${mainOffer.title} à ${mainOffer.price} (80-120 mots)",
    "result": "Ce qu'il/elle obtient (40-60 mots)"
  },
  "phase2": {
    "title": "Création : La Construction",
    "objective": "...",
    "plan": "Mentionner ${orderBump.title} à ${orderBump.price}...",
    "result": "..."
  },
  "phase3": {
    "title": "Automatisation : La Machine",
    "objective": "...",
    "plan": "Automatiser les ventes de ${mainOffer.title}...",
    "result": "..."
  },
  "phase4": {
    "title": "Croissance : L'Expansion",
    "objective": "...",
    "plan": "Introduire ${upsell.title} (${upsell.price}) et ${premiumOffer.title} (${premiumOffer.price}) pour atteindre ${potentialRevenue}€/mois...",
    "result": "..."
  },
  "advantages": [
    { "title": "Avantage 1", "description": "Explication spécifique (40-60 mots)" },
    { "title": "Avantage 2", "description": "..." },
    { "title": "Avantage 3", "description": "..." },
    { "title": "Avantage 4", "description": "..." }
  ],
  "conclusion": "Texte de conclusion rassurant + appel naturel (100-150 mots)"
}

RAPPELS CRITIQUES :
- Utilise "${passionReformulated}", JAMAIS "${passionRaw}"
- Intègre les vrais titres et prix des offres dans CHAQUE phase
- Adapte le ton à "${userLevel}" et "${confidenceLevel}"
- Chaque phase doit contenir 1 action concrète simple
- Ne confonds JAMAIS l'objectif (${targetIncome}€) avec le potentiel (${potentialRevenue}€)
- Les 4 avantages doivent être spécifiques à ce parcours
- Zéro jargon : pas de "funnel", "lead magnet", "nurture", "automation", etc.

Génère maintenant l'analyse complète en JSON pur (pas de markdown, pas de texte avant/après).`;

    console.log('ANTHROPIC_CALL start', { 
      fn: 'generatePlanDeRoute',
      sessionId,
      model: 'claude-sonnet-4-20250514'
    });

    // 🔥 Retry logic
    let planDeRoute = null;
    let lastError = null;
    const MAX_RETRIES = 2;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Appel avec retry interne sur 429/529
        let message;
        const maxApiRetries = 3;
        for (let apiAttempt = 0; apiAttempt <= maxApiRetries; apiAttempt++) {
          try {
            message = await anthropic.messages.create({
              model: "claude-sonnet-4-20250514",
              max_tokens: 8000,
              system: SYSTEM_PROMPT,
              messages: [
                { role: "user", content: userPrompt }
              ]
            });
            break;
          } catch (apiError) {
            const status = apiError.status || apiError.statusCode;
            const isRetryable = status === 429 || status === 529 || apiError.message?.includes('overloaded');
            if (isRetryable && apiAttempt < maxApiRetries) {
              const waitTime = (apiAttempt + 1) * 5000;
              console.warn(`[generatePlanDeRoute] API ${status}, retry ${apiAttempt + 1}/${maxApiRetries} in ${waitTime}ms`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              continue;
            }
            throw apiError;
          }
        }

        console.log('ANTHROPIC_CALL end', {
          fn: 'generatePlanDeRoute',
          sessionId,
          attempt: attempt + 1,
          usage: message.usage
        });

        const responseText = message.content[0].type === 'text' 
          ? message.content[0].text.trim() 
          : '{}';

        // Clean markdown
        const cleanedResponse = responseText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();

        planDeRoute = JSON.parse(cleanedResponse);

        // 🔥 VALIDATION
        const validationErrors = [];
        
        if (!planDeRoute.introduction || planDeRoute.introduction.length < 50) {
          validationErrors.push('introduction trop courte');
        }
        if (!planDeRoute.parcoursGuide || planDeRoute.parcoursGuide.length < 30) {
          validationErrors.push('parcoursGuide trop court');
        }
        
        ['phase1', 'phase2', 'phase3', 'phase4'].forEach(phaseKey => {
          const phase = planDeRoute[phaseKey];
          if (!phase || !phase.objective || phase.objective.length < 20) {
            validationErrors.push(`${phaseKey}.objective trop court`);
          }
          if (!phase || !phase.plan || phase.plan.length < 30) {
            validationErrors.push(`${phaseKey}.plan trop court`);
          }
          if (!phase || !phase.result || phase.result.length < 20) {
            validationErrors.push(`${phaseKey}.result trop court`);
          }
          
          // 🔥 Vérifier que les noms de produits sont présents
          const planText = phase.plan || '';
          const hasProductMention = 
            planText.includes(mainOffer.title || 'XXXXX') ||
            planText.includes(orderBump.title || 'XXXXX') ||
            planText.includes(upsell.title || 'XXXXX') ||
            planText.includes(premiumOffer.title || 'XXXXX');
          
          if (!hasProductMention && planText.length > 0) {
            validationErrors.push(`${phaseKey}.plan ne mentionne aucun nom de produit`);
          }
        });
        
        if (!planDeRoute.advantages || planDeRoute.advantages.length !== 4) {
          validationErrors.push(`advantages doit contenir exactement 4 éléments`);
        }
        
        if (!planDeRoute.conclusion || planDeRoute.conclusion.length < 50) {
          validationErrors.push('conclusion trop courte');
        }

        if (validationErrors.length > 0) {
          console.warn(`⚠️ [generatePlanDeRoute] Validation failed (attempt ${attempt + 1}):`, validationErrors);
          lastError = new Error(`Validation métier échouée: ${validationErrors.join(', ')}`);
          
          if (attempt < MAX_RETRIES) {
            console.log('🔄 Retrying...');
            continue;
          } else {
            throw lastError;
          }
        }

        console.log('✅ [generatePlanDeRoute] Validation passed');
        break;

      } catch (error) {
        lastError = error;
        console.error(`❌ [generatePlanDeRoute] Attempt ${attempt + 1} failed:`, error.message);
        
        if (attempt === MAX_RETRIES) {
          throw error;
        }
      }
    }

    // Save to session
    await base44.asServiceRole.entities.Session.update(sessionId, {
      plan_de_route: planDeRoute
    });

    console.log('✅ [generatePlanDeRoute] Saved to session');

    return Response.json({
      success: true,
      planDeRoute
    });

  } catch (error) {
    console.error('Error generating plan de route:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});