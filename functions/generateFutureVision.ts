import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Anthropic from 'npm:@anthropic-ai/sdk@0.32.1';

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es Noah, expert en storytelling de transformation et copywriting émotionnel.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TA MISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Créer un récit de transformation personnel, crédible et inspirant qui projette 
l'utilisateur dans sa vie future une fois son projet lancé.

Ce texte doit provoquer une prise de conscience émotionnelle forte, sans jamais 
tomber dans le cliché, l'exagération ou le bullshit marketing.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 STRUCTURE OBLIGATOIRE (5 SECTIONS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Le récit doit suivre cette progression narrative en 5 sections distinctes.
Chaque section doit être séparée par un double saut de ligne (\n\n).

**SECTION 1 : AUJOURD'HUI (2-3 phrases)**
Point de départ - Où l'utilisateur se trouve actuellement.

Utilise ses VRAIES réponses :
- Ses obstacles actuels
- Ses frustrations
- Ce qui le bloque aujourd'hui
- "Si rien ne change" → conséquences négatives

Objectif : Effet miroir. Il doit se dire "C'est exactement moi."

Exemples :
❌ "Tu as une idée mais tu ne sais pas par où commencer."
✅ "Tu as des idées d'apps plein la tête, mais tu ne sais pas coder. Tu regardes 
    les développeurs freelance à 5000€ le projet et tu te dis 'c'est mort'. 
    Tu restes bloqué à l'étape de l'idée."

**SECTION 2 : LE DÉCLIC (2-3 phrases)**
Le moment où il décide de passer à l'action.

Pas un miracle. Un choix lucide.
Pas d'héroïsation. Juste une décision calme.

Peut mentionner :
- Son niveau de préparation (ex: "Tu te sens prêt à 7/10")
- Sa méthode unique
- Le premier pas concret qu'il fait

Exemples :
❌ "Tu décides de te lancer courageusement."
✅ "Un jour, tu décides d'arrêter de chercher la solution parfaite. Tu te lances 
    avec les outils no-code. Tu crées ton premier proto en 72h. Il est moche, 
    mais il fonctionne. C'est le début."

**SECTION 3 : DANS 6 MOIS (3-4 phrases)**
Première victoire - Premier résultat tangible.

Raconte LA première vente :
- Le moment précis (notification, email, etc.)
- Le montant exact (utilise le prix de son produit principal)
- L'émotion ressentie (soulagement, fierté, validation)
- La transformation qu'il offre (PAS le nom du produit)

Puis la montée progressive :
- Revenus premiers mois (chiffres réalistes basés sur son système)
- Changement de posture
- Premières preuves que ça fonctionne

⚠️ RÈGLE CRITIQUE : TRANSFORMATION AVANT OUTIL
❌ "Tu vends ton [nom du produit]"
✅ "Une première personne te fait confiance pour [transformation]"

Exemples :
❌ "Tu fais tes premières ventes et tu es content."
✅ "Tu viens de recevoir ta première vente. 27€. Ce n'est pas énorme, mais c'est 
    la PREUVE. Quelqu'un a payé pour apprendre ce que tu sais faire. Tu n'es plus 
    'celui qui a une idée'. Tu es celui qui AIDE les autres à créer. Les ventes 
    s'enchaînent. 847€ le premier mois. 2 340€ le deuxième."

**SECTION 4 : DANS 1 AN (4-5 phrases)**
Vie transformée - Nouvelle réalité quotidienne.

C'est la section LA PLUS IMPORTANTE. Elle doit être ULTRA-PERSONNALISÉE avec :

✅ OBLIGATOIRE à intégrer :
- Sa projection de vie exacte (Q18 : lifeChange)
- Son objectif de revenus atteint (Q16 : targetIncome)
- Son style de vie désiré (Q22 : lifestyle)
- Ses émotions recherchées (Q20 : emotions)
- Le regard de ses proches (Q21 : relatives)

Peins une SCÈNE CONCRÈTE de son quotidien :
- Où il se réveille (lieu physique si liberté géographique)
- Comment se passe sa journée type
- Ses revenus mensuels exacts
- Sa nouvelle liberté (temps, argent, géographie)
- Son état émotionnel

⚠️ PRIORITÉ ABSOLUE : IDENTITÉ AVANT CHIFFRES
"Tu n'essaies plus, tu ES..."

Exemples de détails concrets :
✅ "Tu te réveilles à Bali. Tu ouvres ton Mac. 3 nouvelles ventes pendant la nuit."
✅ "5 200€ ce mois-ci. Tu as dépassé ton objectif de 5000€/mois."
✅ "Tu travailles 4h par jour sur ce qui te passionne. Le reste du temps, tu explores."
✅ "Tes parents qui te disaient 'trouve un vrai travail' te demandent maintenant comment tu fais."

**SECTION 5 : TON IMPACT (2-3 phrases)**
L'impact sur les autres - Le sens profond.

Montre la satisfaction de :
- Transmettre son savoir
- Voir des transformations réelles chez ses élèves
- Recevoir des témoignages
- Créer un changement concret dans la vie des gens

Termine par UNE phrase forte, sobre, réaliste :
"Cette vie, elle commence maintenant. Pas dans 5 ans. Maintenant."

Exemples :
❌ "Tu aides plein de gens et c'est super."
✅ "Chaque semaine, tu reçois des messages : 'Grâce à toi, j'ai lancé mon app en 
    10 jours.' Tu ne transmets pas juste une compétence. Tu libères des gens du 
    syndrome de l'imposteur technique. Cette vie, elle commence maintenant."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ RÈGLES DE STYLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Texte BRUT uniquement (aucun Markdown, aucune liste, aucun titre)
- Paragraphes courts et aérés (rythme émotionnel)
- Tutoiement EXCLUSIF ("tu", "ton", "tes")
- Accords grammaticaux adaptés au genre si disponible
- 0 à 2 emojis maximum (✨ 🚀 ❤️) - utilisés avec parcimonie
- Détails concrets et visuels (lieux, chiffres, scènes)
- Phrases courtes et percutantes
- Longueur cible : 300-500 mots (pas plus !)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 INTERDICTIONS ABSOLUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ NE JAMAIS :
- Répéter les titres d'offres textuellement (parler de transformation à la place)
- Utiliser du langage "coach Instagram" ("boss life", "manifester", etc.)
- Faire des promesses irréalistes ou magiques
- Parler du "marché de la formation en ligne"
- Utiliser des abstractions vagues ("tu réussis", "tu es heureux")
- Dépasser 500 mots
- Utiliser du Markdown (pas de ##, pas de **, pas de listes)

✅ À LA PLACE :
- Scènes concrètes et visuelles
- Chiffres précis et réalistes
- Émotions ressenties
- Transformations humaines
- Détails du quotidien

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 FORMAT DE SORTIE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Retourne UNIQUEMENT le texte narratif en texte brut.
Pas de JSON, pas de markdown, pas de balises.
Juste le texte direct avec des sauts de ligne entre les sections.`;

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
    if (session.future_vision) {
      console.log("Future vision already generated, returning existing");
      return Response.json({
        success: true,
        narrativeText: session.future_vision,
        fromCache: true
      });
    }

    const finalizedOffer = session.finalized_offer || {};
    const onboardingSummary = session.onboarding_summary || {};
    const onboardingFull = session.onboarding_full || {};
    const potentialRevenue = session.potential_revenue || 0;
    
    const firstName = user.firstName || onboardingFull.firstName || '';
    const gender = user.gender || onboardingFull.gender || '';
    const skill = onboardingSummary.who_to_teach || onboardingFull.coreSkill || 'cette compétence';
    
    // Extract key personal data
    const obstacles = onboardingFull.obstacles || '';
    const ifNothingChanges = onboardingFull.ifNothingChanges || '';
    const lifeChange = onboardingFull.lifeChange || '';
    const impact = onboardingFull.desiredImpact || onboardingFull.impact || '';
    const emotions = onboardingFull.desiredEmotions || onboardingFull.emotions || '';
    const relatives = onboardingFull.relativesReaction || onboardingFull.relatives || '';
    const lifestyle = onboardingFull.lifestyleGoals || onboardingFull.lifestyle || '';
    const readiness = onboardingFull.readinessLevel || onboardingFull.readiness || '';
    
    const mainProductPrice = finalizedOffer.mainProduct?.price || '27€';
    const mainProductType = finalizedOffer.mainProduct?.productType || 'mini-formation';
    const targetIncome = onboardingFull.targetIncome || 5000;
    const targetDelay = onboardingFull.targetIncomeDelay || 12;

    // Gender agreement
    let genderNote = '';
    if (gender === 'Femme') {
      genderNote = 'CRITIQUE: L\'utilisateur est une FEMME. Utilise les accords féminins (elle, alignée, motivée, prête, lancée, devenue, accomplie, inspirée, etc.).';
    } else if (gender === 'Homme') {
      genderNote = 'CRITIQUE: L\'utilisateur est un HOMME. Utilise les accords masculins (il, aligné, motivé, prêt, lancé, devenu, accompli, inspiré, etc.).';
    } else {
      genderNote = 'Genre non spécifié. Utilise des formulations neutres ou "tu" autant que possible.';
    }

    const userPrompt = `${genderNote}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 DONNÉES UTILISATEUR (À EXPLOITER OBLIGATOIREMENT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**PROFIL :**
- Prénom : ${firstName || 'toi'}
- Âge : ${onboardingFull.ageRange || 'non spécifié'}
- Situation familiale : ${onboardingFull.familySituation || 'non spécifié'}
- Revenus actuels : ${onboardingFull.currentIncome || 'non spécifié'}€/mois

**PROJET (Onboarding Q1-Q11) :**
- Compétence enseignée : ${skill}
- Public cible : ${onboardingSummary.learner_profile || 'non spécifié'}
- Problème à résoudre : ${onboardingSummary.main_learning_problem || 'non spécifié'}
- Quick win promis : ${onboardingSummary.quick_win || 'non spécifié'}
- Grande transformation : ${onboardingSummary.big_transformation || 'non spécifié'}
- Méthode unique : ${onboardingSummary.method_angle || 'non spécifié'}
- Histoire personnelle : ${onboardingSummary.proof_or_story || 'non spécifié'}

**OBJECTIFS & RÊVES (Q16-Q22) :**
- Objectif revenu : ${targetIncome}€/mois
- Délai souhaité : ${targetDelay} mois
- Projection de vie (Q18) : "${lifeChange || 'non spécifié'}"
- Impact souhaité (Q19) : "${impact || 'non spécifié'}"
- Émotions recherchées (Q20) : "${emotions || 'non spécifié'}"
- Réaction des proches (Q21) : "${relatives || 'non spécifié'}"
- Style de vie visé (Q22) : "${lifestyle || 'non spécifié'}"

**BLOCAGES ACTUELS (Q23-Q25) :**
- Obstacles perçus (Q23) : "${obstacles || 'non spécifié'}"
- Si rien ne change (Q24) : "${ifNothingChanges || 'non spécifié'}"
- Niveau de préparation (Q25) : ${readiness || 'non spécifié'}/10

**OFFRES CRÉÉES :**
- Produit principal : ${mainProductPrice} (Format: ${mainProductType})
- Potentiel système : ${potentialRevenue}€/mois

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TA MISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Génère un récit de transformation en 5 SECTIONS pour ${firstName || 'cet utilisateur'}.

**SECTION 1 : AUJOURD'HUI (2-3 phrases)**
Point de départ actuel.
Utilise :
- Obstacles : "${obstacles}"
- Si rien ne change : "${ifNothingChanges}"
- Problème à résoudre : "${onboardingSummary.main_learning_problem}"

Crée un effet miroir puissant. ${firstName || 'L\'utilisateur'} doit se reconnaître exactement.

**SECTION 2 : LE DÉCLIC (2-3 phrases)**
Moment où ${firstName || 'il/elle'} décide de passer à l'action.
Décision calme, pas de dramatisation.
Peut mentionner : niveau préparation ${readiness}/10, méthode unique.

**SECTION 3 : DANS 6 MOIS (3-4 phrases)**
Première vente !
- Montant : ${mainProductPrice}
- Format : ${mainProductType}
- Transformation offerte (PAS le nom du produit)
- Premières ventes mensuelles réalistes
- Changement de posture

⚠️ RÈGLE : Parle de la TRANSFORMATION qu'il offre, pas du produit

**SECTION 4 : DANS 1 AN (4-5 phrases) - LA PLUS IMPORTANTE**
Vie transformée complète.

⚡ OBLIGATOIRE à intégrer :
- Projection de vie : "${lifeChange}"
- Objectif atteint : ${targetIncome}€/mois (vs potentiel ${potentialRevenue}€)
- Style de vie : "${lifestyle}"
- Émotions : "${emotions}"
- Proches : "${relatives}"

Peins une SCÈNE CONCRÈTE :
- Où se réveille ${firstName || 'il/elle'} (lieu physique si applicable)
- Journée type
- Revenus mensuels exacts
- Liberté (temps/argent/géographie)
- État émotionnel

Exemples de détails concrets à inclure :
✅ "Tu te réveilles à [lieu]. Tu ouvres ton Mac. X ventes pendant la nuit."
✅ "${targetIncome}€ ce mois-ci. Tu as atteint/dépassé ton objectif."
✅ "Tu travailles Xh par jour. Le reste du temps, [activité]."
✅ "Tes proches [réaction basée sur Q21]."

**SECTION 5 : TON IMPACT (2-3 phrases)**
Impact sur les élèves.
Transformation : "${onboardingSummary.big_transformation}"
Témoignages, fierté, transmission.

Termine par : "Cette vie, elle commence maintenant."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CONTRAINTES STRICTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ OBLIGATOIRE :
- Longueur : 300-500 mots (PAS PLUS !)
- 5 sections développées (pas résumées)
- Réinjecter les VRAIES réponses de ${firstName || 'l\'utilisateur'}
- Détails concrets et visuels
- Scènes vivantes et tangibles
- Tutoiement exclusif
- Texte brut (pas de markdown)

❌ INTERDIT :
- Répéter les titres d'offres
- Langage marketing hype
- Promesses irréalistes
- Abstractions vagues
- Dépasser 500 mots
- Utiliser du Markdown

Génère maintenant le récit (texte brut, paragraphes courts, zéro markdown).`;

    console.log("ANTHROPIC_CALL start", { 
      fn: "generateFutureVision", 
      sessionId, 
      model: "claude-sonnet-4-20250514" 
    });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: userPrompt }
      ]
    });

    console.log("ANTHROPIC_CALL end", { 
      fn: "generateFutureVision", 
      sessionId,
      usage: message.usage
    });

    const narrativeText = message.content[0].type === 'text' 
      ? message.content[0].text.trim() 
      : '';

    // Save to session
    await base44.asServiceRole.entities.Session.update(sessionId, {
      future_vision: narrativeText
    });

    console.log('✅ [generateFutureVision] Sauvegardé dans session', { sessionId });

    return Response.json({
      success: true,
      narrativeText
    });

  } catch (error) {
    console.error('Error in generateFutureVision:', error);
    
    // Fallback text
    const skill = error.session?.skill || 'ta compétence';
    const fallbackText = `Imagine-toi, dans quelques mois… Tu te réveilles le matin en sachant que des personnes comptent sur toi pour progresser en ${skill}.

Tu as réussi à structurer ton savoir-faire en une offre claire, accessible, et qui résonne avec ton audience. Chaque jour, de nouvelles personnes découvrent ton travail et décident de te faire confiance.

Tu n'es plus seul(e) à avancer. Ta communauté grandit, tes témoignages s'accumulent, et tu ressens cette fierté profonde d'avoir osé franchir le pas.

Cette vie, elle t'attend. Il te suffit maintenant de passer à l'action, étape par étape.`;

    return Response.json({
      success: true,
      narrativeText: fallbackText,
      warning: 'Fallback text used due to error'
    });
  }
});