import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es Noah, expert en storytelling de transformation et copywriting émotionnel.

Ta mission est de créer un récit de transformation personnel, crédible et inspirant,
qui projette l'utilisateur dans sa vie future une fois son projet lancé.

Ce texte doit provoquer une prise de conscience émotionnelle forte,
sans jamais tomber dans le cliché, l'exagération ou le bullshit marketing.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLES STRICTES (NON NÉGOCIABLES)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Texte BRUT uniquement (aucun Markdown, aucune liste, aucun titre)
- Paragraphes courts et aérés (rythme émotionnel)
- Tutoiement EXCLUSIF ("tu", "ton", "tes")
- Accords grammaticaux adaptés au genre si disponible
- 1 à 2 emojis maximum (✨ 🚀 ❤️) – optionnels
- Aucune promesse irréaliste
- Pas de langage "coach Instagram"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STRUCTURE PSYCHOLOGIQUE OBLIGATOIRE (8 ÉTAPES)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ Tu dois respecter les 8 étapes dans cet ordre,
mais sans jamais afficher de titres ou de numérotation.

1️⃣ EFFET MIROIR (PRÉSENT)
Décris sa situation actuelle :
- ses doutes
- ses frustrations
- ce qui le bloque aujourd'hui

Il doit se dire : "C'est exactement moi."

2️⃣ DÉCLIC
Décris le moment où il décide d'arrêter de réfléchir
et de passer à l'action.
Pas un miracle.
Un choix lucide.

3️⃣ PREMIÈRE VICTOIRE
Raconte le moment précis où il vend son premier produit.
La notification.
Le soulagement.
La preuve que ce n'était pas "juste une idée".

⚠️ Ne PAS répéter le titre exact du produit
✅ Parler de la transformation offerte

4️⃣ TRANSFORMATION IDENTITAIRE
Montre le changement intérieur :
- confiance
- légitimité
- posture

Il ne "tente plus".
Il construit.

5️⃣ MONTÉE EN PUISSANCE
Décris comment, progressivement :
- il structure ses offres
- il améliore son système
- les revenus deviennent réguliers

Jusqu'à se rapprocher de son objectif financier.
Sans promesse magique.

6️⃣ NOUVELLE RÉALITÉ (VIE FUTURE)
Projette sa vie :
- plus de clarté
- plus de liberté
- plus d'alignement

⚠️ Si données personnelles disponibles (life_change, dream_life) : les utiliser
⚠️ Sinon, reste générique mais humain

7️⃣ IMPACT
Parle des élèves.
Montre la satisfaction :
- transmettre
- aider
- voir des transformations réelles

8️⃣ CONCLUSION INSPIRANTE
Termine par une phrase forte, sobre, réaliste.
Pas de slogan.
Pas de CTA.
Juste une évidence :
👉 Ce futur commence maintenant.`;

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
    
    const name = user.firstName || onboardingFull.firstName || 'l\'entrepreneur';
    const gender = user.gender || onboardingFull.gender || '';
    const skill = onboardingSummary.who_to_teach || onboardingFull.coreSkill || onboardingFull.skill || 'cette compétence';
    
    // 🔥 DB-FIRST KEYS MAPPING (clés réelles stockées)
    const personalAnswers = {
      obstacles: onboardingFull.perceivedObstacles || onboardingFull.obstacles || '',
      ifNothingChanges: onboardingFull.ifNothingChanges || ''
    };
    
    const goalAnswers = {
      lifeChange: onboardingFull.lifeChangeStory || onboardingFull.lifeChange || '',
      impact: onboardingFull.impactGoals || onboardingFull.impact || '',
      emotions: onboardingFull.emotionalBenefits || onboardingFull.emotions || '',
      relatives: onboardingFull.relativesThoughts || onboardingFull.relatives || '',
      lifestyle: onboardingFull.lifestyleGoals || onboardingFull.lifestyle || '',
      readiness: onboardingFull.readinessScore || onboardingFull.readiness || ''
    };

    // 🔥 DEBUG LOG: clés disponibles
    console.log('📊 [generateFutureVision] onboarding_full keys:', Object.keys(onboardingFull));
    console.log('📊 [generateFutureVision] Mapped data:', {
      name,
      skill,
      gender,
      personalAnswers,
      goalAnswers,
      hasObstacles: !!personalAnswers.obstacles,
      hasLifeChange: !!goalAnswers.lifeChange,
      hasImpact: !!goalAnswers.impact,
      hasEmotions: !!goalAnswers.emotions,
      hasRelatives: !!goalAnswers.relatives,
      hasLifestyle: !!goalAnswers.lifestyle
    });

    const mainProductTitle = finalizedOffer.mainProduct?.title || 'ton produit principal';
    const mainProductType = finalizedOffer.mainProduct?.productType || '';
    const upsell1Title = finalizedOffer.upsell1?.title || '';
    const premiumTitle = finalizedOffer.upsell3?.title || '';
    const targetIncome = onboardingFull.targetIncome || 500;

    // Déterminer les accords grammaticaux selon le genre
    let genderAgreement = '';
    if (gender === 'Femme') {
      genderAgreement = 'CRITIQUE: L\'utilisateur est une FEMME. Tu DOIS utiliser les accords féminins dans TOUT le récit (elle, alignée, motivée, prête, lancée, devenue, accomplie, inspirée, etc.). Vérifie CHAQUE adjectif et participe passé.';
    } else if (gender === 'Homme') {
      genderAgreement = 'CRITIQUE: L\'utilisateur est un HOMME. Tu DOIS utiliser les accords masculins dans TOUT le récit (il, aligné, motivé, prêt, lancé, devenu, accompli, inspiré, etc.). Vérifie CHAQUE adjectif et participe passé.';
    } else {
      genderAgreement = 'CRITIQUE: Genre non spécifié. Utilise "il/elle" ou des formulations neutres. Évite les accords de genre quand possible, sinon utilise la forme "aligné(e)", "motivé(e)", etc.';
    }

    const userPrompt = `${genderAgreement}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DONNÉES UTILISATEUR (À EXPLOITER OBLIGATOIREMENT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Prénom : ${name}
Âge : ${onboardingFull.ageRange || 'non spécifié'}
Situation familiale : ${onboardingFull.familyStatus || 'non spécifié'}
Revenus actuels : ${onboardingFull.currentIncome || 'non spécifié'}€/mois

📋 ONBOARDING SUMMARY (données structurées Q1-Q11) :
- Compétence : ${onboardingSummary.who_to_teach || skill}
- Profil élève : ${onboardingSummary.learner_profile || 'non spécifié'}
- Problème principal : ${onboardingSummary.main_learning_problem || 'non spécifié'}
- Quick win : ${onboardingSummary.quick_win || 'non spécifié'}
- Grande transformation : ${onboardingSummary.big_transformation || 'non spécifié'}
- Méthode/Angle : ${onboardingSummary.method_angle || 'non spécifié'}
- Erreur typique : ${onboardingSummary.common_mistake || 'non spécifié'}
- Histoire personnelle : ${onboardingSummary.proof_or_story || 'non spécifié'}

🎯 OBJECTIFS & MOTIVATIONS (Q16-Q22) :
- Objectif revenu : ${targetIncome}€/mois (ce que ${name} visait)
- Délai souhaité : ${onboardingFull.targetIncomeDelay || 'non spécifié'} mois
- Projection de vie : ${goalAnswers.lifeChange || 'non spécifié'}
- Impact souhaité : ${goalAnswers.impact || 'non spécifié'}
- Émotions recherchées : ${goalAnswers.emotions || 'non spécifié'}
- Regard des proches : ${goalAnswers.relatives || 'non spécifié'}
- Style de vie : ${goalAnswers.lifestyle || 'non spécifié'}

🚧 FREINS & BLOCAGES (Q23-Q25) :
- Obstacles perçus : ${personalAnswers.obstacles || 'non spécifié'}
- "Si rien ne change" : ${personalAnswers.ifNothingChanges || 'non spécifié'}
- Niveau préparation : ${goalAnswers.readiness || 'non spécifié'}/10

📦 OFFRES SÉLECTIONNÉES :
- Produit Principal : "${mainProductTitle}" (Format: ${mainProductType})
- Upsell : "${upsell1Title}"
- Premium : "${premiumTitle}"

💰 REVENUS :
- Objectif déclaré : ${targetIncome}€/mois
- Potentiel système : ${potentialRevenue}€/mois

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MISSION : RÉCIT EN 8 ÉTAPES (ULTRA-PERSONNALISÉ)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ SITUATION ACTUELLE (EFFET MIROIR)
Utilise les VRAIES réponses de ${name} :
- Obstacles perçus : ${personalAnswers.obstacles}
- "Si rien ne change" : ${personalAnswers.ifNothingChanges}
- Problème qu'il veut résoudre : ${onboardingSummary.main_learning_problem}

Montre que tu as COMPRIS son blocage réel.
Crée un effet miroir : "${name} se reconnaît exactement"

2️⃣ MOMENT DU DÉCLIC (SANS HÉROÏSATION)
Le jour où ${name} décide de structurer son savoir
Décision calme, pas de dramatisation
Peut mentionner : niveau préparation ${goalAnswers.readiness}/10

3️⃣ PREMIÈRE VENTE (PRODUIT PRINCIPAL)
⚡ RÈGLE CRITIQUE : TRANSFORMATION AVANT OUTIL
❌ Ne PAS dire : "Tu vends ton ${mainProductTitle}"
✅ Dire : "Une première personne te fait confiance pour [transformation]"

Inclure 1 micro-détail concret du format (${mainProductType}) sans répéter le titre exact
Moment précis, émotion ressentie
Peut mentionner le quick win : ${onboardingSummary.quick_win}

4️⃣ CHANGEMENT D'IDENTITÉ (AVANT REVENUS)
🔥 PRIORITÉ ABSOLUE : IDENTITÉ AVANT CHIFFRES

"Tu n'essaies plus, tu ES..."
Nouvelle posture liée à :
- Grande transformation : ${onboardingSummary.big_transformation}
- Impact souhaité : ${goalAnswers.impact}
- Émotions recherchées : ${goalAnswers.emotions}

5️⃣ ACTIVATION DES AUTRES OFFRES
Progression naturelle vers upsell et premium
OBLIGATOIRE : "Tu visais ${targetIncome}€, ton système peut atteindre ${potentialRevenue}€"

6️⃣ NOUVELLE RÉALITÉ DE VIE
Basée sur SES VRAIES réponses :
- Projection de vie : ${goalAnswers.lifeChange}
- Style de vie : ${goalAnswers.lifestyle}
- Regard des proches : ${goalAnswers.relatives}

Situations concrètes du quotidien (pas abstraites)

7️⃣ IMPACT SUR LES ÉLÈVES
Transformation qu'ils vivent : ${onboardingSummary.big_transformation}
Témoignages, fierté ressentie
Transmission, héritage

8️⃣ CONCLUSION ANCRÉE AU PRÉSENT
"Ce futur commence maintenant"
Premiers pas concrets, pas futur abstrait
Sentiment : "Je suis prêt, aligné, c'est crédible"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CONTRAINTES STRICTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ OBLIGATOIRE :
- Longueur : 600-900 mots
- 8 étapes DÉVELOPPÉES (pas résumées)
- Réinjecter les VRAIES réponses de ${name}
- Zéro généricité détectable
- TRANSFORMATION HUMAINE > OUTIL

❌ INTERDIT :
- Répéter les titres d'offres textuellement
- Parler du "marché de la formation"
- Promesses irréalistes
- Langage marketing hype
- Abstractions vagues

Génère le narrativeText (texte continu, paragraphes courts, zéro markdown).`;

    console.log("OPENAI_CALL start", { fn: "generateFutureVision", sessionId, model: "gpt-4o" });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.6,
      max_tokens: 1200,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "future_vision",
          strict: true,
          schema: {
            type: "object",
            properties: {
              narrativeText: { type: "string" }
            },
            required: ["narrativeText"],
            additionalProperties: false
          }
        }
      }
    });

    console.log("OPENAI_CALL end", { 
      fn: "generateFutureVision", 
      sessionId, 
      usage: completion.usage 
    });

    const result = JSON.parse(completion.choices[0].message.content);
    const narrativeText = result.narrativeText;

    // Save to session
    await base44.asServiceRole.entities.Session.update(sessionId, {
      future_vision: narrativeText
    });

    return Response.json({
      success: true,
      narrativeText
    });

  } catch (error) {
    console.error('Error in generateFutureVision:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});