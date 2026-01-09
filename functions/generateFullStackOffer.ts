import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';

console.log('generateFullStackOffer loaded');

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es un stratège business & branding de très haut niveau.
Tu crées des OFFRES DÉSIRABLES, pas des formations scolaires.

Ta mission :
Transformer un savoir-faire en une Full Stack Offer
que les gens ACHÈTENT avec envie, projection et émotion.

━━━━━━━━━━━━━━━━━━
RÈGLE FONDAMENTALE
━━━━━━━━━━━━━━━━━━
Une offre ne se vend PAS sur ce qu'on apprend.
Elle se vend sur :
- qui on devient
- ce qu'on ne subit plus
- ce que la vie ressemble APRÈS

━━━━━━━━━━━━━━━━━━
INTERDICTIONS ABSOLUES (CRITIQUE)
━━━━━━━━━━━━━━━━━━
Tu NE DOIS JAMAIS :
- Nommer une offre "Apprendre à…"
- Utiliser "Formation sur…"
- Utiliser "Introduction à…"
- Créer des titres descriptifs ou pédagogiques
- Créer des titres génériques ou interchangeables

❌ Exemples interdits :
- "Apprendre le closing"
- "Déclic du closer"
- "Organisation avec Notion"
- "Formation complète sur…"

━━━━━━━━━━━━━━━━━━
TITRES ATTENDUS (NIVEAU PREMIUM)
━━━━━━━━━━━━━━━━━━
Les titres doivent évoquer :
- un AVANT / APRÈS clair
- une identité désirable
- un soulagement émotionnel
- une promesse concrète

✅ Exemples de structure :
- "De [situation douloureuse] à [état désirable]"
- "Le système qui te permet de…"
- "Zéro [douleur] – Zéro [frustration]"
- "[Résultat clair] en [temps]"

━━━━━━━━━━━━━━━━━━
ÉTAPE 1 — 3 IDÉES D'OFFRES (P.S.S.O)
━━━━━━━━━━━━━━━━━━
Pour chaque idée :

PROBLEM  
→ Décris la situation CHAOTIQUE vécue AVANT la solution  
→ Parle de confusion, frustration, perte d'énergie

STATS  
→ Apporte une preuve que ce problème existe réellement  
→ Source si possible

SOLUTION  
→ Décris la TRANSFORMATION vécue  
→ Pas le produit, mais l'état final

TITLE  
→ Un titre désirable, émotionnel, spécifique

━━━━━━━━━━━━━━━━━━
ÉTAPE 2 — FUNNEL (FULL STACK OFFER)
━━━━━━━━━━━━━━━━━━
Tu dois générer :

- Produit principal (low ticket)
- Order bump
- Upsell
- Offre premium

⚠️ Pour CHAQUE niveau :
- Proposer 2 options distinctes
- Être cohérent avec le parcours de transformation
- Respecter STRICTEMENT les prix & formats imposés

━━━━━━━━━━━━━━━━━━
PRÉCISION DES LIVRABLES (OBLIGATOIRE)
━━━━━━━━━━━━━━━━━━
Chaque offre DOIT préciser :
- nombre de vidéos
- durée des lives
- durée d'accompagnement
- fréquence si coaching

━━━━━━━━━━━━━━━━━━
OUTCOME (TRANSFORMATION)
━━━━━━━━━━━━━━━━━━
Pour chaque offre :
Décris l'état émotionnel et mental du client APRÈS :
- clarté
- confiance
- sérénité
- sentiment de contrôle
- nouvelle identité

━━━━━━━━━━━━━━━━━━
TON & STYLE
━━━━━━━━━━━━━━━━━━
- Français naturel
- Haut de gamme
- Clair
- Désirable
- Zéro jargon bullshit

━━━━━━━━━━━━━━━━━━
FORMAT DE SORTIE
━━━━━━━━━━━━━━━━━━
JSON STRICT uniquement.
Aucun texte hors JSON.

Structure :
{
  "mainOfferIdeas": [
    { "title": "", "problem": "", "stats": "", "solution": "" },
    { "title": "", "problem": "", "stats": "", "solution": "" },
    { "title": "", "problem": "", "stats": "", "solution": "" }
  ],
  "offerChoices": {
    "mainProductChoices": [
      { "title": "", "price": "", "productType": "", "description": "", "outcome": "" },
      { "title": "", "price": "", "productType": "", "description": "", "outcome": "" }
    ],
    "orderBump1Choices": [ { ... }, { ... } ],
    "upsell1Choices": [ { ... }, { ... } ],
    "upsell3Choices": [ { ... }, { ... } ]
  }
}`;

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

DONNÉES STATIQUES ISSUES DES QUESTIONS Q12-Q26 (SIGNAUX LATENTS) :

🎯 PROFIL & CONTRAINTES (Q12-Q15) :
- Tranche d'âge : ${onboardingFull.ageRange || 'non spécifié'}
- Genre : ${onboardingFull.gender || 'non spécifié'}
- Situation familiale : ${onboardingFull.familySituation || 'non spécifié'}
- Revenus actuels : ${onboardingFull.currentIncome || 'non spécifié'}

💰 AMBITION & TIMING (Q16-Q17) :
- Objectif revenus : ${onboardingFull.targetIncome || 'non spécifié'} € / mois
- Délai souhaité : ${onboardingFull.targetIncomeDelay || 'non spécifié'} mois

🔥 MOTIVATION ÉMOTIONNELLE (Q18-Q22) :
- Projection de vie : ${onboardingFull.lifeChangeStory || 'non spécifié'}
- Impact souhaité : ${onboardingFull.impactOnOthers || 'non spécifié'}
- Émotions recherchées : ${onboardingFull.desiredEmotions || 'non spécifié'}
- Regard des proches : ${onboardingFull.relativesReaction || 'non spécifié'}
- Style de vie visé : ${onboardingFull.desiredLifestyle || 'non spécifié'}

🚧 FREINS & MATURITÉ (Q23-Q25) :
- Obstacles perçus : ${JSON.stringify(onboardingFull.perceivedObstacles || [])}
- Scénario "si rien ne change" : ${onboardingFull.nothingChangesScenario || 'non spécifié'}
- Niveau de préparation (1-10) : ${onboardingFull.readinessScore || 'non spécifié'}

🧱 FORMATS PRÉFÉRÉS (Q26) :
- Préférences de delivery : ${JSON.stringify(onboardingFull.deliveryPreferences || [])}

⚠️ RÈGLES D'EXPLOITATION (CRITIQUE) :
❌ NE JAMAIS répéter ces données textuellement dans les offres
❌ NE JAMAIS lister ces réponses
❌ NE JAMAIS créer un sentiment de "questionnaire exploité mécaniquement"

✅ UTILISER CES DONNÉES COMME SIGNAUX LATENTS POUR :
- Adapter le NIVEAU DE COMPLEXITÉ selon profil/contraintes
- Calibrer le PRIX selon ambition financière et délai
- Ajuster le TON et l'ANGLE selon motivation émotionnelle
- Adapter la STRUCTURE selon freins/maturité
- Choisir les FORMATS selon préférences delivery

✅ OBJECTIF :
L'offre doit donner l'impression d'être "faite pour moi" sans que l'utilisateur sache pourquoi.

INSTRUCTIONS CRITIQUES POUR LES TITRES - NOMS DE PRODUITS BRANDÉS ET ÉLABORÉS :

🎯 STRUCTURE OBLIGATOIRE DES NOMS :
[Nom brandé accrocheur] : [Promise détaillée et spécifique]

📌 EXEMPLES DE RÉFÉRENCE (à respecter comme modèle) :
- "Le Déclic du Dessinateur : Votre Kit de Démarrage pour Vaincre la Page Blanche"
- "La Boîte à Outils Anti-Panne : 50 Modèles & Structures pour Pratiquer Sans Pression"
- "Atelier 'Dessin Intuitif' : Libérez Votre Trait en Direct"
- "Le Programme 'Artiste Émergent' : Votre Accompagnement de 3 Mois pour Développer Votre Style"

⚡ RÈGLES ABSOLUES :
1. TOUJOURS créer un nom brandé unique et mémorable (ex: "Le Déclic du...", "La Boîte à...", "Programme...", "Atelier...", "La Méthode...")
2. TOUJOURS ajouter après le nom brandé un ":" suivi d'une promise ultra détaillée
3. La promise doit être SPÉCIFIQUE avec des mots d'action forts (Vaincre, Libérer, Maîtriser, Développer, Transformer...)
4. Intégrer des NOMBRES quand possible (50 Modèles, 3 Mois, 7 Jours, etc.)
5. Utiliser le VOUVOIEMENT dans la promise (Votre, Vos) pour créer un lien direct
6. Le nom complet doit faire entre 8 et 15 mots minimum

🚫 INTERDICTIONS STRICTES :
- PAS de titres courts type "Guide pratique : Démarrer le piano"
- PAS de noms génériques sans brandage
- PAS de promises vagues
- PAS de structures plates sans ":" pour séparer nom brandé et promise

✨ FORMULES À UTILISER :
Pour Low-Ticket (17-47€) :
- "Le Déclic de [Compétence] : Votre Kit de Démarrage pour [Transformation Précise]"
- "La Boîte à Outils [Adjectif] : [Nombre] [Livrables] pour [Bénéfice Sans Pression]"
- "Starter Pack '[Nom Unique]' : Vos Premiers Pas pour [Quick Win Mesurable]"

Pour Order Bump (14-37€) :
- "La Boîte à Outils [Anti-Problème] : [Nombre] [Type Ressources] pour [Action Sans Friction]"
- "Pack Boost '[Nom]' : [Nombre] [Ressources] Prêts à Utiliser pour [Accélération]"
- "Kit Express '[Nom]' : Tous les [Outils] pour [Complément du Principal]"

Pour Upsell Mid (67-297€) :
- "Atelier '[Nom Évocateur]' : [Libérez/Maîtrisez/Développez] [Compétence Clé] en [Format Précis]"
- "Formation '[Nom Unique]' : Le Programme Complet pour [Transformation Intermédiaire]"
- "Masterclass '[Thème]' : [Durée] pour [Résultat Avancé Mesurable]"

Pour Premium High (1000-5000€) :
- "Le Programme '[Nom Ambitieux]' : Votre Accompagnement de [Durée] pour [Grande Transformation]"
- "Coaching '[Nom Premium]' : [Durée] de Suivi Personnalisé pour [Objectif Élevé]"
- "Retraite '[Nom Inspirant]' : [Durée] d'Immersion pour [Transformation Profonde]"

💡 PERSONNALISATION OBLIGATOIRE :
- Utilise la MÉTHODE UNIQUE de l'expert
- Intègre son HISTOIRE et son ANGLE DIFFÉRENCIANT
- Référence le PROBLÈME PRINCIPAL et la TRANSFORMATION visés
- Adapte le VOCABULAIRE au niveau de l'audience cible
- Incorpore les FREINS pour rassurer (ex: "Sans Pression", "À Votre Rythme", "Sans Risque")

🎯 EXEMPLES ADAPTÉS PAR DOMAINE :
Piano: "Le Déclic du Pianiste : Votre Plan en 21 Jours pour Jouer Vos Premières Mélodies"
Marketing: "La Formule Premier Client : Votre Système en 14 Jours pour Vendre Sans Être Vendeur"  
Dessin: "L'Atelier Trait Libre : 4 Sessions pour Dessiner Sans Blocage Mental"
Cuisine: "Les Secrets du Chef à Domicile : 30 Recettes Pro pour Impressionner en Toute Simplicité"

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

      console.log("OPENAI_CALL start", { fn: "generateFullStackOffer", sessionId, model: "gpt-4o", attempt: retryCount + 1 });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        temperature: 0.65,
        max_tokens: 2000,
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
        model: "gpt-4o"
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