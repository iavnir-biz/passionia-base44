import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Anthropic from 'npm:@anthropic-ai/sdk@0.32.1';

console.log('generateFullStackOffer loaded (Claude Sonnet 4)');

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es un stratège business expert en création d'offres irrésistibles. Crée des OFFRES DÉSIRABLES qui se vendent sur l'émotion et la transformation.

🎯 RÈGLES CLÉS :
- Les gens achètent QUI ils deviennent, pas ce qu'ils apprennent
- Titres émotionnels avec transformation claire (60-120 caractères)
- INTERDIT : "Guide pratique", "Formation", "Le Déclic", "Starter Pack", "Apprendre à..."

✅ STRUCTURES DE TITRES GAGNANTES :
1. "De [Douleur] à [Désirable] : [Mécanisme] en [Timeframe]"
2. "Zéro [Douleur], Zéro [Frustration] : [Solution]"
3. "[Résultat Précis] en [Timeframe] : [Mécanisme]"
4. "[Nouvelle Identité] : [Mécanisme] pour [Transformation]"

📦 GÉNÈRE :
1. mainOfferIdeas (3 idées) : title, problem (150-250 mots), stats, solution (100-150 mots)
2. offerChoices avec 2 options par niveau :
   - mainProductChoices (17€-47€) : PDF, mini-formation 3-5 vidéos
   - orderBump1Choices (14€-37€) : checklist, scripts, audio bonus
   - upsell1Choices (67€-297€) : formation complète, masterclass, live Q&A
   - upsell3Choices (1000€-5000€) : coaching 3 mois, done-for-you, accompagnement VIP

🔥 OBLIGATOIRE :
- Descriptions avec CHIFFRES précis (ex: "5 vidéos de 12 min + 3 templates")
- Outcomes 80+ caractères avec résultat mesurable + transformation émotionnelle
- Prix strictement dans les fourchettes autorisées
- Progression cohérente Low → Order Bump → Mid → Premium

📤 FORMAT JSON STRICT :
{
  "mainOfferIdeas": [
    {"title": "...", "problem": "...", "stats": "...", "solution": "..."},
    {...}, {...}
  ],
  "offerChoices": {
    "mainProductChoices": [
      {"title": "...", "price": "27€", "productType": "...", "description": "...", "outcome": "..."},
      {...}
    ],
    "orderBump1Choices": [{...}, {...}],
    "upsell1Choices": [{...}, {...}],
    "upsell3Choices": [{...}, {...}]
  }
}

Retourne UNIQUEMENT du JSON valide, aucun texte avant ou après.`;

const ALLOWED_PRICES = {
  mainProduct: ['17€', '27€', '37€', '47€'],
  orderBump: ['14€', '17€', '27€', '37€'],
  upsell1: ['67€', '97€', '197€', '297€'],
  upsell3: ['1000€', '2000€', '3000€', '5000€']
};

const ALLOWED_FORMATS = {
  mainProduct: ['PDF', 'ebook', 'mini-formation (3 à 5 vidéos)', 'pack de 3 vidéos courtes', 'template'],
  orderBump: ['check-list', 'modèles', 'scripts', 'études de cas', 'audio bonus'],
  upsell1: ['visio 1-on-1 (1 heure)', 'formation complète (10+ vidéos)', 'communauté', 'live mensuel (1 heure)', 'atelier (2 heures)', 'masterclass enregistrée'],
  upsell3: ['coaching personnalisé (ex: 3 mois)', 'accompagnement', 'done-for-you', 'consulting', 'retraite/séminaire']
};

function validateOffer(offer) {
  const errors = [];
  const genericTitles = ['Guide pratique', 'Plan d\'action', 'Séminaire', 'Coaching personnalisé', 'Formation complète', 'Le Déclic', 'Starter Pack', 'Kit de'];

  // Validate mainOfferIdeas
  if (!offer.mainOfferIdeas || !Array.isArray(offer.mainOfferIdeas) || offer.mainOfferIdeas.length !== 3) {
    errors.push('mainOfferIdeas doit contenir exactement 3 items');
  } else {
    offer.mainOfferIdeas.forEach((idea, idx) => {
      if (!idea.title || !idea.problem || !idea.stats || !idea.solution) {
        errors.push(`mainOfferIdeas[${idx}] manque des champs obligatoires (title, problem, stats, solution)`);
      }
      
      // Check title length
      if (idea.title && (idea.title.length < 60 || idea.title.length > 120)) {
        errors.push(`mainOfferIdeas[${idx}] titre doit faire 60-120 caractères (actuellement ${idea.title.length})`);
      }
      
      // Check for generic patterns
      const hasGeneric = genericTitles.some(generic => idea.title && idea.title.toLowerCase().includes(generic.toLowerCase()));
      if (hasGeneric) {
        errors.push(`mainOfferIdeas[${idx}] titre contient un pattern générique. Utilise une structure gagnante.`);
      }
    });
  }

  // Validate offerChoices structure
  if (!offer.offerChoices) {
    errors.push('offerChoices manquant');
    return errors;
  }

  const choices = ['mainProductChoices', 'orderBump1Choices', 'upsell1Choices', 'upsell3Choices'];
  const priceKeys = ['mainProduct', 'orderBump', 'upsell1', 'upsell3'];
  
  choices.forEach((choice, idx) => {
    const items = offer.offerChoices[choice];
    const priceKey = priceKeys[idx];
    
    if (!Array.isArray(items) || items.length !== 2) {
      errors.push(`${choice} doit contenir exactement 2 items`);
    } else {
      items.forEach((item, itemIdx) => {
        // Check required fields
        if (!item.title || !item.price || !item.productType || !item.description || !item.outcome) {
          errors.push(`${choice}[${itemIdx}] manque des champs obligatoires`);
        }
        
        // Check price
        if (!ALLOWED_PRICES[priceKey].includes(item.price)) {
          errors.push(`${choice}[${itemIdx}] prix invalide: ${item.price}. Autorisés: ${ALLOWED_PRICES[priceKey].join(', ')}`);
        }
        
        // Check description has numbers (livrables précis)
        if (item.description && !/\d/.test(item.description)) {
          errors.push(`${choice}[${itemIdx}] description manque de précision (pas de chiffres pour livrables)`);
        }

        // Check title is not generic
        const isGenericOnly = genericTitles.some(generic => 
          item.title && item.title.toLowerCase().includes(generic.toLowerCase()) && 
          item.title.split(' ').length <= 4
        );
        if (isGenericOnly) {
          errors.push(`${choice}[${itemIdx}] titre trop générique: "${item.title}". Ajoute un mécanisme différenciant.`);
        }

        // Check title length
        if (item.title && (item.title.length < 60 || item.title.length > 120)) {
          errors.push(`${choice}[${itemIdx}] titre doit faire 60-120 caractères (actuellement ${item.title.length})`);
        }

        // Check outcome length
        if (item.outcome && item.outcome.length < 80) {
          errors.push(`${choice}[${itemIdx}] outcome trop court (${item.outcome.length} chars). Minimum 80 caractères requis pour être concret et mesurable.`);
        }
      });
    }
  });

  return errors;
}

Deno.serve(async (req) => {
  try {
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    
    console.log('Starting generateFullStackOffer (Claude)', { sessionId });
    
    // Get session
    const sessions = await base44.asServiceRole.entities.Session.filter({ id: sessionId });
    if (!sessions || sessions.length === 0) {
      console.error('Session not found', { sessionId });
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = sessions[0];
    console.log('Session loaded', { sessionId, hasOfferGeneration: !!session.offer_generation });
    
    // Check if already generated
    if (session.offer_generation && session.offer_generation.offerChoices) {
      console.log("Offer already generated, returning existing", { sessionId });
      return Response.json({
        success: true,
        offer: session.offer_generation,
        fromCache: true
      });
    }

    // Prepare context from session
    const summary = session.onboarding_summary || {};
    const history = session.onboarding_history || [];
    const skill = session.skill || summary.who_to_teach || 'non spécifié';
    const formatPreferences = summary.format_preferences || [];
    const onboardingFull = session.onboarding_full || {};
    
    const historyText = history
      .map((h, idx) => `Q${idx + 1}: ${h.question}\nR${idx + 1}: ${JSON.stringify(h.answer)}`)
      .join('\n\n');

    const userPrompt = `CONTEXTE UTILISATEUR COMPLET :

Prénom : ${session.created_by || 'non fourni'}
Compétence principale : ${skill}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 DONNÉES ONBOARDING (Questions Dynamiques IA - Q1-Q11)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Ce qu'il enseigne :** ${summary.who_to_teach || 'non spécifié'}

**À qui il enseigne (profil élève idéal) :** ${summary.learner_profile || 'non spécifié'}

**Problème principal de ses élèves :** ${summary.main_learning_problem || 'non spécifié'}

**Premier résultat rapide (quick win) :** ${summary.quick_win || 'non spécifié'}

**Transformation finale promise :** ${summary.big_transformation || 'non spécifié'}

**Enseignement principal (prise de conscience clé) :** ${summary.main_teaching || 'non spécifié'}

**Méthode/Angle unique :** ${summary.method_angle || 'non spécifié'}

**Erreur typique à éviter :** ${summary.common_mistake || 'non spécifié'}

**Preuve/Histoire personnelle :** ${summary.proof_or_story || 'non spécifié'}

**Formats préférés :** ${formatPreferences.join(', ') || 'non spécifié'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 DONNÉES STATIQUES (Questions Profil - Q12-Q26)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 **PROFIL & CONTRAINTES :**
- Tranche d'âge : ${onboardingFull.ageRange || 'non spécifié'}
- Genre : ${onboardingFull.gender || 'non spécifié'}
- Situation familiale : ${onboardingFull.familySituation || 'non spécifié'}
- Revenus actuels : ${onboardingFull.currentIncome || 'non spécifié'}

💰 **AMBITION & TIMING :**
- Objectif revenus : ${onboardingFull.targetIncome || 'non spécifié'} € / mois
- Délai souhaité : ${onboardingFull.targetIncomeDelay || 'non spécifié'} mois

🔥 **MOTIVATION ÉMOTIONNELLE :**
- Projection de vie (si objectif atteint) : ${onboardingFull.lifeChange || 'non spécifié'}
- Impact souhaité : ${onboardingFull.desiredImpact ? JSON.stringify(onboardingFull.desiredImpact) : 'non spécifié'}
- Émotions recherchées : ${onboardingFull.desiredEmotions ? JSON.stringify(onboardingFull.desiredEmotions) : 'non spécifié'}
- Réaction entourage souhaitée : ${onboardingFull.relativesReaction ? JSON.stringify(onboardingFull.relativesReaction) : 'non spécifié'}
- Style de vie visé : ${onboardingFull.lifestyleGoals ? JSON.stringify(onboardingFull.lifestyleGoals) : 'non spécifié'}

🚧 **OBSTACLES PERÇUS :**
${onboardingFull.obstacles ? JSON.stringify(onboardingFull.obstacles) : 'non spécifié'}

⚡ **ÉTAT D'ESPRIT :**
- Si rien ne change dans ${onboardingFull.targetIncomeDelay || 'X'} mois : ${onboardingFull.ifNothingChanges || 'non spécifié'}
- Niveau de préparation (1-10) : ${onboardingFull.readinessLevel || 'non spécifié'}/10

📦 **PRÉFÉRENCES DELIVERY :**
${onboardingFull.deliveryPreferences ? JSON.stringify(onboardingFull.deliveryPreferences) : 'non spécifié'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 HISTORIQUE COMPLET DES Q/R (brut pour contexte) :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${historyText || 'Non disponible'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TA MISSION MAINTENANT :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Génère une Full Stack Offer IRRÉSISTIBLE pour cet utilisateur.

**CRITÈRES DE QUALITÉ :**
1. Utilise les structures de titres gagnantes (De X à Y, Zéro X Zéro Y, etc.)
2. Intègre son histoire personnelle dans les titres et outcomes
3. Reprends ses mots exacts pour décrire les douleurs
4. Cible précisément sa transformation promise
5. Reflète son niveau d'ambition (${onboardingFull.targetIncome || 'X'}€/mois en ${onboardingFull.targetIncomeDelay || 'X'} mois)
6. Livrables ultra-précis avec chiffres exacts
7. Outcomes mesurables et émotionnels (minimum 80 caractères)

**RAPPEL DES PRIX AUTORISÉS :**
- Low Ticket : 17€, 27€, 37€, 47€
- Order Bump : 14€, 17€, 27€, 37€
- Mid Ticket : 67€, 97€, 197€, 297€
- Premium : 1000€, 2000€, 3000€, 5000€

Génère maintenant le JSON complet selon le format spécifié dans le SYSTEM_PROMPT.`;

    console.log("ANTHROPIC_CALL start", { 
      fn: "generateFullStackOffer", 
      sessionId, 
      model: "claude-sonnet-4-20250514" 
    });

    let retryCount = 0;
    const maxRetries = 1; // Réduit de 2 à 1 pour éviter les timeouts 504
    let finalOffer = null;
    let validationErrors = [];

    while (retryCount <= maxRetries) {
      try {
        const message = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000, // Réduit de 8000 à 4000 pour accélérer la génération
          system: SYSTEM_PROMPT,
          messages: [
            { 
              role: "user", 
              content: retryCount === 0 ? userPrompt : `${userPrompt}\n\n⚠️ ERREURS À CORRIGER :\n${validationErrors.join('\n')}\n\nRegenère le JSON complet en corrigeant ces erreurs.`
            }
          ]
        });

        console.log("ANTHROPIC_CALL end", { 
          fn: "generateFullStackOffer", 
          sessionId,
          usage: message.usage,
          retryCount
        });

        const responseText = message.content[0].type === 'text' ? message.content[0].text : '{}';
        
        // Clean potential markdown code blocks
        const cleanedText = responseText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        let parsedOffer;
        try {
          parsedOffer = JSON.parse(cleanedText);
        } catch (parseError) {
          console.error('JSON parse error', { parseError, responseText: cleanedText.substring(0, 500) });
          throw new Error('Invalid JSON response from Claude');
        }

        // Validate the offer
        validationErrors = validateOffer(parsedOffer);
        
        if (validationErrors.length === 0) {
          finalOffer = parsedOffer;
          console.log('Offer validated successfully', { sessionId });
          break;
        } else {
          console.warn('Validation errors found', { sessionId, retryCount, errors: validationErrors });
          retryCount++;
          
          if (retryCount > maxRetries) {
            console.error('Max retries reached, using best effort', { sessionId, errors: validationErrors });
            finalOffer = parsedOffer;
            break;
          }
        }
      } catch (error) {
        console.error('Error in generation attempt', { sessionId, retryCount, error: error.message });
        retryCount++;
        
        if (retryCount > maxRetries) {
          throw error;
        }
      }
    }

    if (!finalOffer) {
      throw new Error('Failed to generate valid offer after retries');
    }

    // Save to session
    await base44.asServiceRole.entities.Session.update(sessionId, {
      offer_generation: finalOffer
    });

    console.log('Offer saved to session', { sessionId });

    return Response.json({
      success: true,
      offer: finalOffer,
      fromCache: false,
      validationWarnings: validationErrors.length > 0 ? validationErrors : undefined
    });

  } catch (error) {
    console.error('Error in generateFullStackOffer:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});
