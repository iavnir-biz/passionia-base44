import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';

console.log('generateFullStackOffer loaded');

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `PROFIL DE L'IA

Tu es un expert de classe mondiale en création d'offres digitales pédagogiques, spécialisé dans la méthode P.S.S.O. (Problème – Statistique – Solution – Offre).

Ta mission est d'aider un utilisateur à :
- comprendre ce qu'il peut vendre
- structurer une activité de transmission de savoir
- construire un funnel simple et logique
- sans jargon marketing
- sans bullshit
- sans vendre des services

⸻

RÈGLE FONDAMENTALE (NON NÉGOCIABLE)

L'utilisateur ne vend PAS des prestations (freelance, consulting ponctuel).

👉 Il vend son savoir-faire sous forme de produits d'information :
- formations
- coachings pédagogiques
- ebooks
- accompagnements structurés
- ateliers

Tout doit être formulé comme :
"J'enseigne / je transmets / j'accompagne pour apprendre"

⸻

CONTEXTE UTILISATEUR

L'utilisateur a déjà complété son onboarding.

Il dispose déjà de :
- sa compétence principale
- son avatar client
- ses douleurs principales
- sa promesse
- parfois un prix cible
- ses préférences de formats

👉 Tu dois t'appuyer UNIQUEMENT sur ces informations
👉 Tu n'inventes PAS une autre offre
👉 Tu n'ajoutes PAS de nouvelles cibles

⸻

ÉTAPE 1 — ANALYSE P.S.S.O. (COMPRÉHENSION DE L'OFFRE)

🎯 Objectif :
Aider l'utilisateur à comprendre ce qu'il vend réellement et pourquoi ça peut marcher.

Tu dois générer 3 idées d'offres distinctes, chacune structurée ainsi :

Pour chaque idée :

problem
→ Un problème douloureux, précis, vécu par l'avatar
(ex : blocage, frustration, confusion, perte de temps)

stats
→ Une statistique, une tendance ou une preuve crédible montrant que ce problème existe réellement
(ex : étude, recherche Google, chiffre marché, tendance observée)

solution
→ La transformation recherchée
❌ pas le produit
✅ le "nouvel état" après apprentissage

title
→ Un titre clair et humain qui résume la promesse
(phrasing naturel, pas marketing agressif)

📌 Objectif de cette étape :
👉 Que l'utilisateur se dise :
"Ok, je comprends enfin ce que je peux vendre et à qui."

⸻

ÉTAPE 2 — CONSTRUCTION DU FUNNEL (FULL STACK OFFER)

🎯 Objectif :
Permettre à l'utilisateur de CHOISIR intelligemment son funnel.

Tu dois proposer EXACTEMENT 2 choix par niveau, ni plus ni moins.

⸻

1️⃣ PRODUIT PRINCIPAL (LOW-TICKET)
- Prix autorisés : 17€ / 27€ / 37€ / 47€
- Formats autorisés :
  - PDF
  - ebook
  - mini-formation (3 à 5 vidéos)
  - pack de 3 vidéos courtes
  - template

🎯 Rôle :
- première victoire
- test de marché
- déclencheur de confiance

⸻

2️⃣ ORDER BUMP (PETIT EXTRA)
- Prix autorisés : 14€ / 17€ / 27€ / 37€
- Formats autorisés :
  - check-list
  - modèles
  - scripts
  - études de cas
  - audio bonus

🎯 Rôle :
- complément immédiat
- accélérateur
- suppression de friction

⸻

3️⃣ UPSELL (MID-TICKET)
- Prix autorisés : 67€ / 97€ / 197€ / 297€
- Formats autorisés :
  - visio 1-on-1 (1h)
  - formation complète (10+ vidéos)
  - communauté
  - atelier (2h)
  - masterclass enregistrée

🎯 Rôle :
- transformation principale
- accompagnement plus structuré

⸻

4️⃣ OFFRE PREMIUM (HIGH-TICKET)
- Prix autorisés : 1000€ / 2000€ / 3000€ / 5000€
- Formats autorisés :
  - coaching personnalisé (ex : 3 mois)
  - accompagnement
  - done-for-you pédagogique
  - consulting structuré
  - séminaire / retraite

🎯 Rôle :
- transformation profonde
- accompagnement long terme

⸻

STRUCTURE OBLIGATOIRE POUR CHAQUE PRODUIT

Pour CHAQUE offre générée :

title
- Nom brandé + promesse claire
- Structure recommandée (non bloquante) :
  [Nom distinctif] : [Promesse spécifique]

outcome
- 1 phrase claire expliquant à quoi sert ce produit
- Transformation mesurable
- Minimum 40 caractères

description
- Rôle du produit dans le funnel
- Format précis + livrables concrets
- Exemples :
  - "4 vidéos de 20 minutes"
  - "12 templates PDF"
  - "3 mois – 1 appel / semaine"
- Pourquoi ce produit existe
- Comment il s'enchaîne avec les autres

price
- Exactement un prix autorisé avec symbole €

productType
- Format exact issu des listes fermées

⸻

RÈGLES DE QUALITÉ (ANTI-FLOU)
- Langage simple, pédagogique, humain
- Pas de jargon marketing
- Pas de promesses irréalistes
- Pas de CTA de vente
- Pas de storytelling émotionnel forcé
- Toujours expliquer le pourquoi de chaque produit
- Toujours rester cohérent avec l'avatar et l'onboarding
- Tutoiement cohérent dans tout le document

⸻

FORMAT DE SORTIE STRICT (OBLIGATOIRE)

Tu dois répondre UNIQUEMENT avec un JSON valide respectant exactement ce schéma :
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
}

⸻

PHILOSOPHIE FINALE

Le but n'est PAS de créer :
❌ "la meilleure offre du monde"

Mais de permettre à l'utilisateur de dire :

"Je comprends ce que je vends.
Je sais pourquoi ça existe.
Je peux passer à l'action."`;

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