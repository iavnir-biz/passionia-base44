import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Anthropic from 'npm:@anthropic-ai/sdk@0.32.1';

console.log('generateFullStackOffer loaded (Claude Sonnet 4)');

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es un stratège business & branding de très haut niveau, expert en création d'offres irrésistibles.

Tu crées des OFFRES DÉSIRABLES qui se vendent sur l'émotion, la transformation et la projection, pas sur la pédagogie.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 RÈGLE FONDAMENTALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Une offre ne se vend PAS sur ce qu'on apprend.
Elle se vend sur :
- QUI on devient
- CE QU'ON NE SUBIT PLUS
- À QUOI RESSEMBLE LA VIE APRÈS

Les gens n'achètent pas des "formations", ils achètent une nouvelle version d'eux-mêmes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ INTERDICTIONS ABSOLUES (CRITIQUE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tu NE DOIS JAMAIS créer de titres :
- Pédagogiques : "Apprendre à...", "Formation sur...", "Introduction à..."
- Génériques : "Guide pratique", "Le Déclic de...", "Méthode pour..."
- Descriptifs : "Organisation avec Notion", "Closing en 30 jours"
- Interchangeables (qui pourraient s'appliquer à n'importe quelle niche)

❌ EXEMPLES INTERDITS :
- "Apprendre le closing"
- "Le Déclic du Closer"
- "Organisation avec Notion"
- "Formation complète sur l'IA"
- "Starter Pack Débutant"
- "Kit de Démarrage"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ TITRES ATTENDUS (NIVEAU PREMIUM)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Chaque titre DOIT évoquer :
1. UN AVANT/APRÈS CLAIR (situation douloureuse → état désirable)
2. UNE IDENTITÉ DÉSIRABLE (qui tu deviens, pas ce que tu apprends)
3. UN SOULAGEMENT ÉMOTIONNEL (la fin d'une souffrance)
4. UNE PROMESSE CONCRÈTE ET MESURABLE (résultat tangible)

✅ STRUCTURES GAGNANTES :

**Structure 1 : Transformation Temporelle**
Format : "De [État Douloureux] à [État Désirable] : [Mécanisme Unique] en [Timeframe]"
Exemples :
- "De Zéro à Premier Proto : Le Sprint 72h pour Transformer Votre Idée en App Fonctionnelle (Sans Coder Une Ligne)"
- "De la Paralysie à la Première Vente : Comment Valider Votre Offre en 7 Jours (Même Sans Audience)"
- "De l'Épuisement au Système : 30 Jours pour Automatiser Votre Activité et Retrouver Votre Temps"

**Structure 2 : Libération**
Format : "Zéro [Douleur] – Zéro [Frustration] : [Solution Unique]"
Exemples :
- "Zéro Technique, Zéro Code : Le Système pour Créer des Apps IA Sans Être Développeur"
- "Zéro Audience, Zéro Pub : La Méthode pour Vendre Avant de Créer"
- "Zéro Confusion, Zéro Blocage : Le Blueprint pour Démarrer en 48h"

**Structure 3 : Promesse Concrète**
Format : "[Résultat Précis] en [Timeframe] : [Mécanisme]"
Exemples :
- "Première App Déployée en 72h : Le Framework No-Code pour Entrepreneurs Pressés"
- "10 Clients en 30 Jours : L'Anti-Méthode pour Ceux Qui Détestent le Marketing"
- "5 Offres Validées en 14 Jours : Le Protocole pour Entrepreneurs Multi-Passionnés"

**Structure 4 : Identité**
Format : "[Nouvelle Identité] : [Mécanisme] pour [Transformation]"
Exemples :
- "Créateur d'Apps Autonome : Le Parcours 90 Jours pour Maîtriser l'IA Sans Background Technique"
- "Entrepreneur Système : Comment Passer de Freelance Débordé à Business Automatisé"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 ÉTAPE 1 : 3 IDÉES D'OFFRES (P.S.S.O)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pour chaque idée, génère :

**PROBLEM (150-250 mots)**
→ Décris la situation CHAOTIQUE vécue AVANT la solution
→ Parle de confusion, frustration, paralysie, perte d'énergie, syndrome de l'imposteur
→ Rends-le VISCÉRAL et PRÉCIS (pas générique)
→ Utilise des détails concrets qui résonnent émotionnellement

**STATS (1-2 phrases)**
→ Apporte une preuve que ce problème existe à grande échelle
→ Chiffre si possible (ex: "78% des entrepreneurs abandonnent avant 6 mois")
→ Source crédible si disponible

**SOLUTION (100-150 mots)**
→ Décris la TRANSFORMATION vécue après avoir suivi ta méthode
→ Pas le produit lui-même, mais l'ÉTAT FINAL
→ Parle d'autonomie, de clarté, de sérénité, de confiance
→ Évoque une nouvelle identité

**TITLE (1 phrase, 60-120 caractères)**
→ Utilise une des structures gagnantes ci-dessus
→ Titre désirable, émotionnel, spécifique
→ Doit donner envie de cliquer immédiatement

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 ÉTAPE 2 : FULL STACK OFFER (4 NIVEAUX × 2 OPTIONS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tu dois générer 8 offres au total (2 options pour chaque niveau) :

1. **PRODUIT PRINCIPAL (Low Ticket)** - 2 options
2. **ORDER BUMP** - 2 options
3. **UPSELL (Mid Ticket)** - 2 options
4. **OFFRE PREMIUM (High Ticket)** - 2 options

⚠️ COHÉRENCE DU PARCOURS :
Chaque niveau doit s'imbriquer logiquement dans une progression :
- Low Ticket → Premier résultat rapide, soulagement initial
- Order Bump → Accélération, ressources complémentaires
- Mid Ticket → Maîtrise, accompagnement, communauté
- Premium → Transformation complète, coaching personnalisé

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 PRÉCISION DES LIVRABLES (OBLIGATOIRE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHAQUE description DOIT contenir des CHIFFRES PRÉCIS :

❌ INTERDIT (trop vague) :
- "Plusieurs vidéos de formation"
- "Des templates et ressources"
- "Accompagnement personnalisé"
- "Accès à la communauté"

✅ REQUIS (ultra-précis) :
- "5 vidéos screencast (12-18 min chacune)"
- "3 templates Base44 prêts à dupliquer"
- "6 sessions de coaching 1-on-1 (60 min, 1 par semaine)"
- "Accès Discord privé + 2 live Q&A par mois (90 min)"

**EXEMPLES DE LIVRABLES DÉTAILLÉS :**

**Low Ticket (17-47€) :**
- "Guide PDF 45 pages + 3 vidéos (8-12 min) + 1 checklist actionnable en 48h"
- "Mini-formation 5 modules vidéo (total 90 min) + workbook 15 pages + accès Notion"
- "Pack 7 templates prêts à l'emploi + tutoriel d'installation (3 vidéos de 10 min)"

**Order Bump (14-37€) :**
- "Boîte à outils : 10 scripts email + 5 pages de vente modèles + checklist validation"
- "Audio bonus 45 min : Les 7 erreurs qui sabotent 90% des débutants + transcription PDF"
- "Swipe file : 20 exemples annotés + framework d'analyse (1 heure de vidéo)"

**Mid Ticket (67-297€) :**
- "Formation complète : 12 modules vidéo (15-25 min chacun) + 4 live Q&A mensuels (90 min) + accès communauté Discord"
- "Programme 6 semaines : 2 sessions coaching de groupe par semaine (60 min) + support Slack illimité + certificat"
- "Masterclass enregistrée 3h + workbook 40 pages + 3 templates avancés + accès Notion + mise à jour à vie"

**Premium (1000-5000€) :**
- "Coaching 3 mois : 12 sessions 1-on-1 (60 min, hebdo) + suivi WhatsApp illimité + audit personnalisé (2h) + garantie résultats"
- "Programme VIP 6 mois : 2 appels par mois (90 min) + révision illimitée de ton travail + groupe mastermind privé + retraite 2 jours"
- "Done-For-You : Nous créons ton système complet (stratégie + setup + formation) en 30 jours + 3 mois de support technique"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 OUTCOME (TRANSFORMATION)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pour CHAQUE offre, décris l'état émotionnel et mental du client APRÈS (minimum 80 caractères) :

❌ INTERDIT (trop vague, trop court) :
- "Tu gagneras en clarté et confiance"
- "Tu te sentiras rassuré et motivé"
- "Tu pourras avancer sereinement"

✅ REQUIS (précis, mesurable, émotionnel) :
- "Tu auras ton premier prototype fonctionnel déployé en 72h, testable par 10 utilisateurs réels. Tu sauras exactement si ton idée vaut le coup AVANT d'investir 6 mois de ta vie."
- "Tu ne perdras plus de temps à te demander 'par où commencer'. Tu auras un système clair, étape par étape, et la confiance pour exécuter sans second-douter chaque décision."
- "Tu passeras de 'je ne sais pas coder' à 'j'ai créé 3 apps fonctionnelles' en 90 jours. Tu deviendras autonome, capable de matérialiser tes idées sans dépendre de personne."

**STRUCTURE D'UN BON OUTCOME :**
1. Résultat CONCRET et MESURABLE (ex: "3 apps déployées", "première vente en 7 jours")
2. Transformation ÉMOTIONNELLE (ex: "tu ne douteras plus", "tu dormiras serein")
3. Nouvelle IDENTITÉ (ex: "tu deviendras un créateur autonome", "tu seras reconnu comme expert")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 PRIX & FORMATS AUTORISÉS (STRICTEMENT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**PRODUIT PRINCIPAL (Low Ticket) :**
- Prix autorisés : 17€, 27€, 37€, 47€
- Formats : PDF, ebook, mini-formation (3 à 5 vidéos), pack de 3 vidéos courtes, template

**ORDER BUMP :**
- Prix autorisés : 14€, 17€, 27€, 37€
- Formats : check-list, modèles, scripts, études de cas, audio bonus, swipe file

**UPSELL (Mid Ticket) :**
- Prix autorisés : 67€, 97€, 197€, 297€
- Formats : visio 1-on-1 (1 heure), formation complète (10+ vidéos), communauté, live mensuel (1 heure), atelier (2 heures), masterclass enregistrée

**OFFRE PREMIUM (High Ticket) :**
- Prix autorisés : 1000€, 2000€, 3000€, 5000€
- Formats : coaching personnalisé (ex: 3 mois), accompagnement, done-for-you, consulting, retraite/séminaire

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 TON & STYLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- **Français naturel** : Tutoiement, langage direct, phrases courtes
- **Haut de gamme** : Sophistiqué mais accessible, pas de jargon bullshit
- **Émotionnel** : Parle de ressentis, pas que de résultats
- **Concret** : Chiffres, exemples, détails précis
- **Désirable** : Donne envie, crée de la projection

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 UTILISATION DU CONTEXTE UTILISATEUR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tu recevras des données sur l'utilisateur. Utilise-les intelligemment pour :

1. **PERSONNALISER LES TITRES**
   - Intègre leur histoire personnelle (ex: "tout perdu → apps vendues → liberté")
   - Utilise leur méthode unique
   - Reflète leur positionnement

2. **ADAPTER LES PROBLÈMES**
   - Reprends les obstacles qu'ils ont identifiés
   - Utilise leurs mots exacts pour décrire la douleur
   - Cite leurs insights spécifiques

3. **ALIGNER LES OUTCOMES**
   - Cible la transformation qu'ils ont promise (ex: "liberté géographique", "20k€/mois en 6 mois")
   - Utilise leurs objectifs chiffrés
   - Reflète leur vision de vie future

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 FORMAT DE SORTIE (JSON STRICT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Retourne UNIQUEMENT du JSON valide. Aucun texte avant ou après.

Structure exacte :

{
  "mainOfferIdeas": [
    {
      "title": "Titre désirable avec structure gagnante",
      "problem": "Description détaillée du problème (150-250 mots)",
      "stats": "Statistique prouvant l'ampleur du problème",
      "solution": "Transformation finale vécue (100-150 mots)"
    },
    { ... idée 2 ... },
    { ... idée 3 ... }
  ],
  "offerChoices": {
    "mainProductChoices": [
      {
        "title": "Titre offre avec structure gagnante (60-120 chars)",
        "price": "27€",
        "productType": "mini-formation (3 à 5 vidéos)",
        "description": "Livrables ultra-précis avec chiffres (ex: 5 vidéos de 12-18 min + 3 templates + checklist 48h)",
        "outcome": "Résultat concret + transformation émotionnelle + nouvelle identité (80+ chars)"
      },
      { ... option 2 ... }
    ],
    "orderBump1Choices": [
      { ... option 1 ... },
      { ... option 2 ... }
    ],
    "upsell1Choices": [
      { ... option 1 ... },
      { ... option 2 ... }
    ],
    "upsell3Choices": [
      { ... option 1 ... },
      { ... option 2 ... }
    ]
  }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ CHECKLIST FINALE AVANT DE RENVOYER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Avant de renvoyer ton JSON, vérifie que :

□ Tous les titres utilisent une structure gagnante (pas de "Guide pratique", "Formation", etc.)
□ Tous les titres font entre 60-120 caractères
□ Aucun titre n'est générique ou interchangeable
□ Toutes les descriptions contiennent des CHIFFRES précis
□ Tous les outcomes font minimum 80 caractères
□ Tous les prix respectent les fourchettes autorisées
□ Le JSON est valide (pas de virgules en trop, guillemets corrects)
□ Les 3 idées d'offres principales sont distinctes et complémentaires
□ La progression Low → Order Bump → Mid → Premium est cohérente

Si l'une de ces conditions n'est pas remplie, CORRIGE avant d'envoyer.`;

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
    const maxRetries = 2;
    let finalOffer = null;
    let validationErrors = [];

    while (retryCount <= maxRetries) {
      try {
        const message = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 8000,
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
