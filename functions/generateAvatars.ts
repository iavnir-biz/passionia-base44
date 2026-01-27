import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Anthropic from 'npm:@anthropic-ai/sdk@0.32.1';

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es Noah, expert en psychologie client, segmentation d'audience et création d'avatars stratégiques pour les créateurs de produits d'information.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TA MISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Créer EXACTEMENT 3 AVATARS CLIENTS ultra-détaillés, exploitables immédiatement pour :
- Créer des offres adaptées
- Écrire des messages de vente personnalisés
- Rédiger des emails marketing ciblés
- Créer du contenu qui résonne

Ces avatars doivent être des PERSONNES RÉELLES et VIVANTES, pas des statistiques.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 RÈGLE DE SEGMENTATION (ABSOLUE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Avatar 1 : LE DÉBUTANT / PERDU / BLOQUÉ**
- Niveau : Aucune ou très peu d'expérience
- Budget : Limité (prêt à investir 20-100€)
- Besoin : Guidance, clarté, pas-à-pas simple
- Peur : Se tromper, perdre son argent, ne pas comprendre
- Offre idéale : Produit d'appel, mini-formation, guide

**Avatar 2 : L'INTERMÉDIAIRE / FRUSTRÉ / A DÉJÀ ESSAYÉ**
- Niveau : A déjà essayé plusieurs choses sans succès
- Budget : Moyen (prêt à investir 100-500€)
- Besoin : Méthode claire, éviter les erreurs passées
- Peur : Encore perdre du temps, que ça ne marche pas
- Offre idéale : Formation complète, méthode structurée

**Avatar 3 : L'AVANCÉ / AMBITIEUX / PRÊT À INVESTIR**
- Niveau : Déjà avancé, veut passer au niveau supérieur
- Budget : Confortable (prêt à investir 500-5000€)
- Besoin : Accélération, raccourcis, expertise pointue
- Peur : Perdre du temps, stagner, ne pas atteindre ses objectifs
- Offre idéale : Coaching, accompagnement premium, mastermind

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 STRUCTURE DE CHAQUE AVATAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "name": "Prénom + surnom symbolique (ex: 'Sophie – la pragmatique en quête de sens')",
  
  "identity": {
    "age_range": "Fourchette précise (ex: 32-38 ans)",
    "life_situation": "Situation de vie (célibataire/en couple/enfants, ville/campagne)",
    "job_context": "Métier ou contexte pro actuel",
    "experience_level": "Débutant | Intermédiaire | Avancé"
  },
  
  "factual_analysis": {
    "current_situation": "Où il/elle en est aujourd'hui (3-4 phrases concrètes et visuelles)",
    "budget": "Budget réaliste prêt à investir (fourchette)",
    "available_time": "Temps dispo par jour/semaine pour se former",
    "channels": "Où le/la toucher (Instagram, LinkedIn, YouTube, email, etc.)",
    "preferred_formats": "Formats consommés (vidéos 5min, articles, podcasts 30min, etc.)",
    "device": "Smartphone | Ordinateur | Tablette (où il/elle consomme)"
  },
  
  "pain_points": {
    "main_frustration": "Frustration #1 actuelle (1 phrase percutante)",
    "daily_problem": "Comment le problème se manifeste au quotidien",
    "emotional_impact": "Impact émotionnel (stress, honte, colère, fatigue, etc.)",
    "cost_of_inaction": "Ce que ça lui coûte de ne rien faire (temps, argent, opportunités)",
    "trigger_moment": "Le moment où la douleur devient insupportable"
  },
  
  "behavior_alternatives": {
    "already_tried": ["Solution 1 essayée", "Solution 2 essayée", ...],
    "why_failed": "Pourquoi ces solutions n'ont pas marché (2-3 phrases)",
    "disappointments": "Ce qui l'a déçu dans le passé",
    "what_he_avoids": ["Ce qu'il/elle évite absolument", ...],
    "current_workaround": "Comment il/elle se débrouille actuellement (bricolage)"
  },
  
  "psychology": {
    "typical_day": "Description narrative d'une journée type (3-4 phrases, storytelling)",
    "dominant_emotion": "Émotion dominante (frustration | espoir | fatigue | excitation | peur)",
    "problem_moment": "Le moment précis où le problème surgit dans sa journée",
    "inner_dialogue": "Les 2-3 phrases exactes qu'il/elle se dit dans sa tête",
    "dreams": "À quoi il/elle rêve secrètement (transformation ultime)",
    "fears": ["Peur #1", "Peur #2", "Peur #3"]
  },
  
  "decision_making": {
    "trigger_to_action": "Ce qui le/la fait ENFIN passer à l'action (achat)",
    "decision_speed": "Impulsif | Réfléchi | Très prudent",
    "needs_validation": true/false (a besoin d'avis, preuves sociales ?),
    "objections": [
      {
        "objection": "Objection typique",
        "real_fear": "La vraie peur derrière"
      }
    ],
    "proof_needed": ["Type de preuve 1", "Type de preuve 2", ...]
  },
  
  "purchase_motivations": {
    "why_training": "Pourquoi il/elle achèterait une formation (raison profonde, 2-3 phrases)",
    "why_coaching": "Pourquoi il/elle achèterait du coaching (besoin réel, 2-3 phrases)",
    "why_community": "Pourquoi il/elle rejoindrait une communauté (2-3 phrases)",
    "real_expectation": "Ce qu'il/elle attend VRAIMENT (au-delà du rationnel)",
    "success_criteria": "Comment il/elle saura que ça a marché"
  },
  
  "ideal_expert_profile": {
    "expert_type": "Type de personne qu'il/elle veut suivre (proche | autorité | inspirant | ami)",
    "tone": "Ton attendu (directif | bienveillant | technique | simple | motivant)",
    "proximity_level": "Niveau proximité (accessible | distant | inspirant | comme un ami)",
    "trust_builders": ["Ce qui crée confiance 1", "Ce qui crée confiance 2", ...],
    "red_flags": ["Ce qui fait fuir 1", "Ce qui fait fuir 2", ...]
  },
  
  "content_preferences": {
    "best_hooks": ["Titre/hook qui capte son attention", ...],
    "resonating_stories": "Types d'histoires qui résonnent",
    "vocabulary": ["Mots/expressions qu'il/elle utilise", ...],
    "objection_triggers": ["Phrases qui déclenchent objections", ...]
  },
  
  "offer_fit": {
    "ideal_offer_type": "Quel type d'offre lui correspond (mini-formation | formation complète | coaching | mastermind)",
    "price_range": "Fourchette de prix acceptable",
    "format_preference": "Format idéal (vidéos | audio | texte | mix | live)",
    "support_level": "Niveau support attendu (autonome | questions/réponses | suivi personnalisé)",
    "timeline_expectation": "Délai attendu pour voir résultats"
  }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 STYLE & TON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Écriture NARRATIVE et VIVANTE (pas de liste sèche)
- Chaque avatar = une PERSONNE RÉELLE qu'on peut visualiser
- Utilise le storytelling dans typical_day, inner_dialogue
- Langage simple et émotionnel
- Zéro jargon marketing
- Tutoiement dans les dialogues internes
- Détails concrets et sensoriels

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ RÈGLES CRITIQUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Les 3 avatars DOIVENT être DISTINCTS en niveau, budget, psychologie
2. Chaque avatar doit correspondre à une offre du funnel
3. JAMAIS écrire "non défini" - faire une hypothèse cohérente
4. Focus PROBLÈME (pas l'outil ou la solution)
5. Psychologie RÉELLE (pas des clichés marketing)
6. Exploitable IMMÉDIATEMENT pour copywriting

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 FORMAT DE SORTIE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Retourne UNIQUEMENT un JSON valide :

{
  "avatars": [
    { ...avatar 1... },
    { ...avatar 2... },
    { ...avatar 3... }
  ]
}

Pas de markdown, pas de texte avant/après, juste le JSON pur.`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const sessionId = body.sessionId || body.session?.id || user.sessionId;

    if (!sessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }

    // Get session
    const sessions = await base44.asServiceRole.entities.Session.filter({ id: sessionId });
    if (!sessions || sessions.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = sessions[0];

    const regenerate = body.regenerate === true;

    // Check cache (unless regenerating)
    if (session.generated_avatars && !regenerate) {
      // Validate that it's not empty/useless data
      const cached = session.generated_avatars.avatars || session.generated_avatars;
      if (Array.isArray(cached) && cached.length > 0 && cached[0].name) {
        return Response.json({
          avatars: cached,
          generatedAt: session.generated_avatars.generatedAt || new Date().toISOString(),
          fromCache: true
        });
      }
    }

    const finalizedOffer = session.finalized_offer || {};
    const onboardingSummary = session.onboarding_summary || {};
    const onboardingFull = session.onboarding_full || {};

    const userPrompt = `CONTEXTE DU PROJET :

**Créateur :**
Prénom : ${user.firstName || user.full_name || 'le créateur'}
Email : ${user.email}

**Compétence enseignée :**
${session.skill || onboardingSummary.who_to_teach || 'Non défini'}

**Audience cible :**
${onboardingSummary.learner_profile || 'Non défini'}

**Problème principal :**
${onboardingSummary.main_learning_problem || 'Non défini'}

**Quick win promis :**
${onboardingSummary.quick_win || 'Non défini'}

**Grande transformation :**
${onboardingSummary.big_transformation || 'Non défini'}

**Méthode/Angle unique :**
${onboardingSummary.method_angle || 'Non défini'}

**Erreur typique à éviter :**
${onboardingSummary.common_mistake || 'Non défini'}

**Histoire personnelle du créateur :**
${onboardingSummary.proof_or_story || 'Non défini'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OFFRES CRÉÉES :

**Produit Principal (27-97€) :**
${JSON.stringify(finalizedOffer.mainProduct, null, 2)}

**Order Bump (petit extra) :**
${JSON.stringify(finalizedOffer.orderBump, null, 2)}

**Upsell (197-497€) :**
${JSON.stringify(finalizedOffer.upsell1, null, 2)}

**Premium (1000-5000€) :**
${JSON.stringify(finalizedOffer.upsell3, null, 2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TA MISSION :

Génère 3 AVATARS CLIENTS ultra-détaillés selon la structure définie.

**RÈGLES CRITIQUES :**

1. **Avatar 1 (Débutant)** → Cible le PRODUIT PRINCIPAL
   - Budget : 20-100€
   - Niveau : Débutant, perdu, besoin de guidance
   
2. **Avatar 2 (Intermédiaire)** → Cible L'UPSELL
   - Budget : 100-500€
   - Niveau : A déjà essayé, frustré, veut une méthode

3. **Avatar 3 (Avancé)** → Cible le PREMIUM
   - Budget : 500-5000€
   - Niveau : Avancé, ambitieux, veut accélération

**Chaque avatar doit être :**
- Une PERSONNE RÉELLE et VIVANTE
- SPÉCIFIQUE au problème : "${onboardingSummary.main_learning_problem}"
- COHÉRENT avec l'audience : "${onboardingSummary.learner_profile}"
- DISTINCT des 2 autres (niveau, budget, psychologie)

**Exemples de détails à intégrer :**
- Mention du problème principal dans pain_points
- Mention de la transformation dans dreams
- Mention de l'erreur typique dans already_tried
- Vocabulaire cohérent avec l'audience

Génère maintenant les 3 avatars en JSON.`;

    console.log('ANTHROPIC_CALL start', {
      fn: 'generateAvatars',
      sessionId,
      model: 'claude-sonnet-4-20250514'
    });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: userPrompt }
      ]
    });

    console.log('ANTHROPIC_CALL end', {
      fn: 'generateAvatars',
      sessionId,
      usage: message.usage
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text.trim()
      : '{}';

    // Clean potential markdown
    const cleanedResponse = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    let avatarsData;
    try {
      avatarsData = JSON.parse(cleanedResponse);
    } catch (e) {
      console.error('JSON parse error:', e);
      return Response.json({
        error: 'Failed to parse avatars',
        details: e.message
      }, { status: 500 });
    }

    // Save to session
    const dataToSave = {
      avatars: avatarsData.avatars,
      generatedAt: new Date().toISOString()
    };

    await base44.asServiceRole.entities.Session.update(sessionId, {
      generated_avatars: dataToSave
    });

    console.log('✅ [generateAvatars] Saved to session', { sessionId });

    return Response.json({
      avatars: dataToSave.avatars,
      generatedAt: dataToSave.generatedAt
    });

  } catch (error) {
    console.error('Error in generateAvatars:', error);
    return Response.json({
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
});