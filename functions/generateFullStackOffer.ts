import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';

console.log('generateFullStackOffer loaded');

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es un expert de classe mondiale en création d'offres digitales, spécialiste de la méthode P.S.S.O.
Ta mission est de générer une "Full Stack Offer" basée sur l'analyse du marché et les réponses de l'utilisateur.

Règle fondamentale héritée de l'ancien générateur :
L'objectif de l'utilisateur est de TRANSMETTRE SON SAVOIR-FAIRE (produits d'information : formations, coachings, ebooks, etc.).
Tu ne dois JAMAIS orienter l'offre comme une vente de service. Tout doit être formulé comme une offre pour ENSEIGNER.

Style & clarté :
- Français naturel, simple, sans anglicismes inutiles.
- Titres "PRODUIT" percutants et brandés : OBLIGATOIREMENT [Nom de marque/concept unique] + [Bénéfice précis/Quick Win] (+ idéalement horizon temps).
  Exemples : "Piano Mind - 7 jours pour maîtriser 3 gammes", "Le Plan Anti-Procrastination SLR", "Yoga Flow Reset - 21 jours pour retrouver ta souplesse", "Marketing Momentum - 30 jours pour tes 5 premiers clients"
  Structure recommandée : [Nom brandé] - [Durée/Format] pour [Résultat mesurable]
  INTERDIT : titres génériques type "Mini formation", "Guide pratique", "Les premiers pas en...", "Démarrer le..."
  LE TITRE DOIT DONNER L'IMPRESSION D'UN VRAI PRODUIT PRÊT À VENDRE, PAS D'UN COURS GÉNÉRIQUE
- Outcome ultra concret : commence par "Tu sais...", "Tu obtiens...", "Tu es capable de...", minimum 40 caractères.
- Description avec livrables ULTRA PRÉCIS : DOIT contenir des chiffres (nombre de vidéos, durée, fréquence, pages, templates).
- Utilise TOUTES les données de l'onboarding dynamique : méthode unique, expertise, réseau des utilisateurs, ce que l'expert a traversé, son angle différenciant
- Ne JAMAIS recopier mot pour mot la formulation brute de la compétence : toujours reformuler naturellement en produit brandé.
- Pas de downsell.

Obligation : respecter les préférences de format de l'utilisateur.
Si plusieurs formats sont possibles, privilégie ce que l'utilisateur a coché.
Utilise les freins et objectifs pour personnaliser les titres et outcomes.

ÉTAPE 1 — 3 idées d'offres validées avec P.S.S.O. (mainOfferIdeas)
Tu dois produire 3 offres distinctes. Pour chacune :
- problem : un vrai problème douloureux lié à l'apprentissage (spécifique)
- stats : une statistique tangible ou preuve externe montrant que le problème est réel (source si possible)
- solution : transformation (pas le produit)
- title : titre percutant

ÉTAPE 2 — Funnel simplifié (offerChoices)
Tu dois proposer exactement 2 choix distincts pour chaque élément :
- mainProductChoices (low-ticket)
- orderBump1Choices
- upsell1Choices
- upsell3Choices (premium/high-ticket)

Contraintes PRIX + FORMATS (listes fermées)
1) Produit Principal (mainProductChoices)
- Prix possibles : 17€, 27€, 37€, 47€
- Formats : PDF, ebook, mini-formation (3 à 5 vidéos), pack de 3 vidéos courtes, template

2) Order Bump (orderBump1Choices)
- Prix possibles : 14€, 17€, 27€, 37€
- Formats : check-list, modèles, scripts, études de cas, audio bonus

3) Upsell (upsell1Choices)
- Prix possibles : 67€, 97€, 197€, 297€
- Formats : visio 1-on-1 (1 heure), formation complète (10+ vidéos), communauté, live mensuel (1 heure), atelier (2 heures), masterclass enregistrée

4) Premium (upsell3Choices)
- Prix possibles : 1000€, 2000€, 3000€, 5000€
- Formats : coaching personnalisé (ex: 3 mois), accompagnement, done-for-you, consulting, retraite/séminaire

Format de sortie STRICT :
Tu dois répondre uniquement avec un JSON valide respectant exactement ce schéma :
{
  "mainOfferIdeas": [
    {"title":"", "problem":"", "stats":"", "solution":""},
    ...
  ],
  "offerChoices": {
    "mainProductChoices": [
      {"title":"", "price":"", "productType":"", "description":"", "outcome":""},
      {"title":"", "price":"", "productType":"", "description":"", "outcome":""}
    ],
    "orderBump1Choices": [ ...2 items... ],
    "upsell1Choices": [ ...2 items... ],
    "upsell3Choices": [ ...2 items... ]
  }
}

Règle anti-flou :
- Si tu proposes une mini-formation : préciser le nombre de vidéos (3 à 5).
- Si tu proposes un atelier : préciser la durée (2h).
- Si tu proposes un coaching : préciser la fréquence et la durée (ex: 3 mois, 1 appel / semaine).
- Chaque description doit contenir les livrables concrets (ce que l'acheteur reçoit).`;

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
  const genericTitles = ['Guide pratique', 'Plan d\'action', 'Séminaire', 'Coaching personnalisé', 'Formation complète'];

  // Validate mainOfferIdeas
  if (!offer.mainOfferIdeas || !Array.isArray(offer.mainOfferIdeas) || offer.mainOfferIdeas.length !== 3) {
    errors.push('mainOfferIdeas doit contenir exactement 3 items');
  } else {
    offer.mainOfferIdeas.forEach((idea, idx) => {
      if (!idea.title || !idea.problem || !idea.stats || !idea.solution) {
        errors.push(`mainOfferIdeas[${idx}] manque des champs obligatoires (title, problem, stats, solution)`);
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
          item.title.toLowerCase().includes(generic.toLowerCase()) && 
          item.title.split(' ').length <= 3
        );
        if (isGenericOnly) {
          errors.push(`${choice}[${itemIdx}] titre trop générique: "${item.title}". Ajoute un mécanisme différenciant.`);
        }

        // Check outcome length
        if (item.outcome && item.outcome.length < 40) {
          errors.push(`${choice}[${itemIdx}] outcome trop court (${item.outcome.length} chars). Minimum 40 caractères requis.`);
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
    
    console.log('Starting generateFullStackOffer', { sessionId });
    
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

SUMMARY ONBOARDING (données structurées issues des 11 questions IA) :
- À qui enseigner : ${summary.who_to_teach || 'non spécifié'}
- Profil de l'élève : ${summary.learner_profile || 'non spécifié'}
- Problème principal d'apprentissage : ${summary.main_learning_problem || 'non spécifié'}
- Premier résultat rapide (quick win) : ${summary.quick_win || 'non spécifié'}
- Grande transformation finale : ${summary.big_transformation || 'non spécifié'}
- Méthode/Angle unique : ${summary.method_angle || 'non spécifié'}
- Erreur typique à éviter : ${summary.common_mistake || 'non spécifié'}
- Preuve/Histoire personnelle : ${summary.proof_or_story || 'non spécifié'}
- Formats préférés : ${formatPreferences.join(', ') || 'non spécifié'}

HISTORIQUE COMPLET DES Q/R (brut) :
${historyText || 'Non disponible'}

DONNÉES STATIQUES (objectifs, revenus, freins, etc.) :
Objectif revenus : ${onboardingFull.targetIncome || 'non spécifié'}
Freins principaux : ${JSON.stringify(onboardingFull.obstacles || [])}
Motivation : ${onboardingFull.readiness || 'non spécifié'}
Autres données : ${JSON.stringify(onboardingFull, null, 2)}

INSTRUCTIONS CRITIQUES POUR LES TITRES - NOMS DE PRODUITS BRANDÉS :
- CRÉE UN VRAI NOM DE PRODUIT qui donne l'impression d'un produit prêt à vendre
- Structure : [Nom de marque unique] - [Durée/Format] pour [Résultat ultra précis]
- Exemples pour piano : "Piano Mind - 7 jours pour maîtriser 3 gammes" (PAS "Mini formation piano" ou "Les premiers pas au piano")
- Exemples pour marketing : "First Sale Sprint - 14 jours pour ton premier client" (PAS "Guide marketing débutant")
- Utilise la méthode unique de l'expert (mentionnée dans l'onboarding)
- Utilise son expertise spécifique et ce qui rend ses élèves uniques
- Utilise son histoire personnelle et ce qu'il a traversé
- Intègre les freins pour personnaliser (ex: "pas le temps" → "Express 15 min/jour", "peur du regard" → "Mode discret activé")
- Le nom doit être MÉMORABLE, BRANDÉ, et donner envie immédiatement
- Ne JAMAIS utiliser de titres génériques comme "Mini formation", "Guide pratique", "Démarrer en..."
- OBLIGATOIRE : Chaque titre doit répondre à un QUICK WIN précis basé sur les réponses de l'onboarding

MISSION :
Génère une "Full Stack Offer" complète selon la méthode P.S.S.O.

1) mainOfferIdeas : 3 idées d'offres avec Problem-Stats-Solution-Offer
   Chaque idée doit avoir : title, problem (douleur précise), stats (preuve chiffrée), solution (transformation)

2) offerChoices : 4 niveaux avec 2 choix chacun
   - mainProductChoices (17-47€) : produits d'entrée ultra accessibles
   - orderBump1Choices (14-37€) : compléments immédiats
   - upsell1Choices (67-297€) : offres intermédiaires plus complètes
   - upsell3Choices (1000-5000€) : offres premium transformantes

Pour CHAQUE item dans offerChoices :
- title : nom percutant du produit
- price : EXACTEMENT un des prix autorisés avec symbole € (ex: "27€")
- productType : type de format (respecter les listes fermées)
- description : livrables ULTRA PRÉCIS avec chiffres (ex: "4 vidéos de 20 min", "12 templates PDF", "3 mois d'accès")
- outcome : transformation mesurable et émotionnelle

Utilise les préférences de formats : ${formatPreferences.join(', ')}
Base-toi sur le summary pour créer une cohérence parfaite entre problème, quick_win, méthode et transformation.`;

    let offer = null;
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ];

      if (retryCount > 0) {
        messages.push({
          role: "assistant",
          content: "Je comprends, je vais corriger les erreurs de validation."
        });
        messages.push({
          role: "user",
          content: "Ton JSON ne respectait pas les contraintes. Regénère avec : prix EXACTEMENT dans les listes, 2 items par niveau, descriptions avec chiffres précis, titres MARQUE avec mécanisme (pas génériques), outcomes de 40+ caractères minimum."
        });
      }

      console.log("OPENAI_CALL start", { fn: "generateFullStackOffer", sessionId, model: "gpt-4o-mini", attempt: retryCount + 1 });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.4,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      });

      console.log("OPENAI_CALL end", { 
        fn: "generateFullStackOffer", 
        sessionId, 
        usage: completion.usage,
        attempt: retryCount + 1
      });

      try {
        offer = JSON.parse(completion.choices[0].message.content);
        const validationErrors = validateOffer(offer);

        if (validationErrors.length === 0) {
          break;
        } else {
          if (retryCount < maxRetries) {
            console.log(`Validation failed (attempt ${retryCount + 1}):`, validationErrors);
            retryCount++;
          } else {
            return Response.json({
              error: 'Validation failed after retries',
              validationErrors
            }, { status: 500 });
          }
        }
      } catch (parseError) {
        if (retryCount < maxRetries) {
          console.log(`JSON parse failed (attempt ${retryCount + 1}):`, parseError.message);
          retryCount++;
        } else {
          return Response.json({
            error: 'Invalid JSON after retries',
            details: parseError.message
          }, { status: 500 });
        }
      }
    }

    // Save to Session
    await base44.asServiceRole.entities.Session.update(sessionId, {
      offer_generation: offer,
      offer_generated_at: new Date().toISOString()
    });

    return Response.json({
      success: true,
      offer,
      debug: {
        skill,
        summaryKeys: Object.keys(summary),
        historyLength: history.length,
        retries: retryCount,
        model: "gpt-4o-mini"
      }
    });

  } catch (error) {
    console.error('Error in generateFullStackOffer:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});