import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Anthropic from 'npm:@anthropic-ai/sdk@0.32.1';

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es Nova, expert en structuration d'offres pédagogiques et funnel de vente.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TA MISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tu vas recevoir 4 offres basiques (choisies pendant l'onboarding) et tu dois les DÉVELOPPER en versions ultra-détaillées, prêtes à vendre.

⚠️ RÈGLE ABSOLUE : 
Tu dois CONSERVER EXACTEMENT ces données de base :
- title (titre exact)
- price (prix exact)
- productType (format)

Ta mission est d'ENRICHIR chaque offre avec tous les détails manquants pour créer un système de vente complet.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 STRUCTURE DE CHAQUE OFFRE DÉTAILLÉE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pour chaque offre, tu dois générer :

**1. INFORMATIONS DE BASE (à conserver)**
- title: [CONSERVER L'ORIGINAL]
- price: [CONSERVER L'ORIGINAL]
- productType: [CONSERVER L'ORIGINAL]

**2. POSITIONNEMENT (nouveau)**
- subtitle: Phrase courte "Pour qui + résultat attendu" (max 60 caractères)
- tagline: Accroche marketing percutante (max 80 caractères)
- level: "Débutant" | "Intermédiaire" | "Avancé" | "Tous niveaux"

**3. PROBLÈME & TRANSFORMATION (nouveau)**
- problem: Problème précis que cette offre résout (2-3 phrases, 50-80 mots)
- before: Situation AVANT l'offre - douleurs concrètes (3-4 phrases, 80-120 mots)
- after: Situation APRÈS l'offre - transformation tangible (3-4 phrases, 80-120 mots)
- transformation: Liste de 3-5 transformations mesurables

**4. CONTENU DÉTAILLÉ (nouveau)**
- deliverables: Liste EXHAUSTIVE des livrables avec détails
  Format pour chaque livrable :
  {
    type: "vidéo" | "PDF" | "template" | "session" | "accès" | "outil",
    name: "Nom du livrable",
    description: "Ce que ça contient exactement",
    duration: "Durée ou quantité" (ex: "45 min", "12 pages", "3 templates")
  }
  
- modules: Structure pédagogique détaillée (si applicable)
  Format pour chaque module :
  {
    number: 1,
    title: "Titre du module",
    objective: "Objectif d'apprentissage",
    lessons: ["Leçon 1", "Leçon 2", ...],
    duration: "Durée estimée"
  }

**5. USAGE & POSITIONNEMENT (nouveau)**
- howToUse: Guide d'utilisation - quand et comment utiliser cette offre (3-4 phrases)
- timeline: Durée estimée pour obtenir les résultats (ex: "7 jours", "3 semaines", "2 mois")
- idealFor: Liste de 3-5 personas/situations idéales
- notFor: Liste de 2-3 cas où ce produit n'est PAS adapté
- ecosystemRole: Rôle dans le funnel (produit d'appel, cœur d'offre, upsell, premium)

**6. ARGUMENTS DE VENTE (nouveau)**
- benefits: Liste de 5-7 bénéfices concrets et mesurables
- uniqueValue: Ce qui rend cette offre unique (2-3 phrases)
- guarantees: Garanties offertes (ex: "Satisfait ou remboursé 30 jours")
- socialProof: Types de témoignages attendus (template pour futurs clients)

**7. OBJECTIONS & RÉPONSES (nouveau)**
- commonObjections: Liste de 3-5 objections courantes avec réponses
  Format :
  {
    objection: "Question/doute du prospect",
    response: "Réponse rassurante et factuelle"
  }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 STYLE & TON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Tutoiement systématique
- Ton de coach pédagogique bienveillant
- Français naturel et accessible
- Zéro jargon technique inutile
- Zéro bullshit marketing ("révolutionnaire", "secrets", etc.)
- Focus sur la TRANSFORMATION concrète
- Détails précis et mesurables

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 COHÉRENCE DU FUNNEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Les 4 offres doivent former un SYSTÈME cohérent :

**Produit Principal (low ticket):**
- Point d'entrée accessible
- Résultat rapide (quick win)
- Donne envie d'aller plus loin

**Order Bump (petit extra):**
- Complément immédiat du produit principal
- Augmente la valeur perçue
- Prix < 50% du produit principal

**Upsell (mid ticket):**
- Approfondissement logique
- Pour ceux qui veulent aller plus loin
- Transformation plus complète

**Premium (high ticket):**
- Accompagnement personnalisé
- Pour ceux qui veulent l'excellence
- Transformation ultime avec support

⚠️ Chaque offre doit mentionner sa place dans l'écosystème et comment elle se connecte aux autres.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 FORMAT DE SORTIE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Retourne UNIQUEMENT un JSON valide avec cette structure :

{
  "mainProduct": { ...offre détaillée... },
  "orderBump": { ...offre détaillée... },
  "upsell": { ...offre détaillée... },
  "premium": { ...offre détaillée... }
}

Pas de markdown, pas de texte avant/après, juste le JSON pur.`;

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

    // Check cache
    if (session.detailed_offers) {
      console.log('[generateDetailedOffers] Already exists, returning from cache');
      return Response.json({
        success: true,
        offers: session.detailed_offers,
        fromCache: true
      });
    }

    // Get base offers from finalized_offer
    const finalizedOffer = session.finalized_offer || {};
    
    if (!finalizedOffer.mainProduct?.title) {
      return Response.json({
        error: 'Les offres de base doivent être complétées avant génération détaillée'
      }, { status: 400 });
    }

    const onboardingSummary = session.onboarding_summary || {};
    const onboardingFull = session.onboarding_full || {};
    const avatars = session.generated_avatars || {};

    const userPrompt = `CONTEXTE BUSINESS :

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

**Méthode unique :**
${onboardingSummary.method_angle || 'Non défini'}

**Erreur typique à éviter :**
${onboardingSummary.common_mistake || 'Non défini'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AVATARS CLIENTS (pour personnalisation) :
${JSON.stringify(avatars, null, 2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OFFRES DE BASE À DÉVELOPPER :

**1. PRODUIT PRINCIPAL (${finalizedOffer.mainProduct.price}):**
${JSON.stringify(finalizedOffer.mainProduct, null, 2)}

**2. ORDER BUMP (${finalizedOffer.orderBump?.price || 'N/A'}):**
${finalizedOffer.orderBump ? JSON.stringify(finalizedOffer.orderBump, null, 2) : 'Non défini'}

**3. UPSELL (${finalizedOffer.upsell1?.price || 'N/A'}):**
${finalizedOffer.upsell1 ? JSON.stringify(finalizedOffer.upsell1, null, 2) : 'Non défini'}

**4. PREMIUM (${finalizedOffer.upsell3?.price || 'N/A'}):**
${finalizedOffer.upsell3 ? JSON.stringify(finalizedOffer.upsell3, null, 2) : 'Non défini'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TA MISSION :

Développe chacune de ces 4 offres en version ULTRA-DÉTAILLÉE selon la structure définie dans le system prompt.

**RÈGLES CRITIQUES :**
1. CONSERVE exactement : title, price, productType
2. AJOUTE tous les champs détaillés manquants
3. Assure la COHÉRENCE entre les 4 offres (elles forment un funnel)
4. Sois SPÉCIFIQUE au contexte (compétence, audience, transformation)
5. Détails MESURABLES (pas de vague "tu vas apprendre")

**EXEMPLE de deliverable bien détaillé :**
❌ Mauvais : "Des vidéos de formation"
✅ Bon : 
{
  type: "vidéo",
  name: "Module 1 : Les fondamentaux du no-code",
  description: "3 vidéos screencast (12-18 min chacune) montrant étape par étape comment créer ta première app avec Bubble",
  duration: "45 min total"
}

Génère maintenant le JSON complet des 4 offres détaillées.`;

    console.log('ANTHROPIC_CALL start', {
      fn: 'generateDetailedOffers',
      sessionId,
      model: 'claude-sonnet-4-20250514'
    });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: userPrompt }
      ]
    });

    console.log('ANTHROPIC_CALL end', {
      fn: 'generateDetailedOffers',
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

    let detailedOffers;
    try {
      detailedOffers = JSON.parse(cleanedResponse);
    } catch (e) {
      console.error('JSON parse error:', e);
      return Response.json({
        error: 'Failed to parse generated offers',
        details: e.message
      }, { status: 500 });
    }

    // Save to session
    await base44.asServiceRole.entities.Session.update(sessionId, {
      detailed_offers: detailedOffers
    });

    console.log('✅ [generateDetailedOffers] Saved to session', { sessionId });

    return Response.json({
      success: true,
      offers: detailedOffers
    });

  } catch (error) {
    console.error('Error in generateDetailedOffers:', error);
    return Response.json({
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
});
