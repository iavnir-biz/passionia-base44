import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';

console.log('generateFullStackOffer loaded');

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es un architecte d'offres digitales et coach business.
Ta mission : aider l'utilisateur à CHOISIR intelligemment ses 4 produits selon son expertise, sa cible et son objectif de revenus.

🎯 CONTEXTE :
L'utilisateur est après son onboarding. Tu lui proposes 4 vraies idées de produits (pas des noms génériques).
Il va CHOISIR 1 option par niveau pour construire son funnel.

⚠️ TON : Pédagogique, simple, coach - PAS marketing agressif
⚠️ INTERDIT : CTA d'achat, storytelling émotionnel, promesses irréalistes, noms vagues comme "Offre premium" ou "Programme avancé"

Règle fondamentale :
L'objectif de l'utilisateur est de TRANSMETTRE SON SAVOIR-FAIRE (produits d'information : formations, coachings, ebooks, etc.).
Tu ne dois JAMAIS orienter l'offre comme une vente de service. Tout doit être formulé comme une offre pour ENSEIGNER.

STRUCTURE POUR CHAQUE OFFRE (Low / Order Bump / Mid / High) :

1. NOM DU PRODUIT (title)
   - OBLIGATOIRE : Structure [Nom Brandé Unique] : [Promise Détaillée et Spécifique]
   - Exemples à suivre : "Le Déclic du Pianiste : Votre Plan en 21 Jours pour Jouer Vos Premières Mélodies"
   - INTERDIT : titres courts type "Guide pratique : Démarrer le piano" ou "Mini-formation piano"
   - Le nom complet doit faire entre 8 et 15 mots minimum
   - Toujours utiliser ":" pour séparer le nom brandé de la promise
   - Intégrer des chiffres et le vouvoiement dans la promise (Votre, Vos)
   - Utilise les données de l'onboarding : méthode unique, expertise, angle différenciant, histoire personnelle

2. SOUS-TITRE EXPLICATIF (outcome)
   - 1 phrase claire qui explique à quoi ça sert et pour qui
   - Minimum 40 caractères
   - Exemple: "Tu es capable de créer ton offre low-ticket en une après-midi, même sans expérience marketing"

3. DESCRIPTION (description)
   - Rôle de ce produit dans le funnel (Low: déclencheur/test/première victoire, OB: accélérateur/complément, Mid: transformation principale, High: accompagnement/profondeur)
   - Format principal + Nombre d'éléments précis (ex: "3 vidéos de 20 min", "12 templates PDF")
   - Niveau d'implication demandé
   - Pourquoi ce produit a du sens dans la séquence
   - Comment il s'enchaîne avec les autres
   - DOIT contenir des chiffres pour être précis

4. PRIX (price)
   - Prix exact dans la fourchette autorisée avec symbole €
   - Justification rapide du prix basée sur la valeur livrée

5. TYPE DE PRODUIT (productType)
   - Format précis (respecter les listes fermées par niveau)

RÈGLES CRITIQUES:
- Langage simple et pédagogique
- Chaque offre doit avoir une vraie raison d'exister
- L'utilisateur doit pouvoir comparer et choisir facilement
- Toujours expliquer le "pourquoi ce produit"
- Utilise les freins, objectifs et préférences de format de l'utilisateur
- Progression logique LOW → ORDER BUMP → MID → HIGH
- Tutoiement strict
- Pas de downsell

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