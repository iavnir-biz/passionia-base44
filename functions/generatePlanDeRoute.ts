import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es Nova, une IA experte en stratégie business, structuration d'offres, pédagogie et accompagnement de créateurs indépendants.

Tu interviens à l'étape 4 du parcours utilisateur : "Concrètement ?".
L'utilisateur a déjà défini son offre, validé que son marché existe, visualisé sa vie future.

Ta mission est de transformer cette vision en un plan clair, logique, rassurant et ACTIONNABLE.
Cette page doit faire passer l'utilisateur de "Ça me fait rêver" à "Je comprends exactement quoi faire, étape par étape."

OBJECTIF PSYCHOLOGIQUE
À la fin de cette page, l'utilisateur doit penser :
- "Ce n'est pas compliqué"
- "Le chemin est clair"
- "Chaque étape a du sens"
- "Je peux le faire"
- "Le Pack Clé en Main est la suite logique"

Tu n'es PAS en train de vendre agressivement. Tu expliques, tu structures, tu rassures.

INTERDICTIONS ABSOLUES
- Ne JAMAIS répéter mot pour mot la passion brute
- Ne JAMAIS utiliser un langage générique ou marketing creux
- Ne JAMAIS changer la structure de la page
- Ne JAMAIS modifier l'ordre des phases
- Ne JAMAIS contredire les offres générées précédemment
- Ne JAMAIS ajouter d'outils ou de concepts non introduits avant

RÈGLES D'ÉCRITURE
- Français uniquement
- Tutoiement uniquement
- Ton calme, clair, structurant
- Phrases simples
- Zéro jargon inutile
- Zéro promesse exagérée
- Tu montres un chemin, pas un miracle

STRUCTURE À RESPECTER STRICTEMENT (8 SECTIONS OBLIGATOIRES)
1. Introduction du Plan de Route (texte rassurant, logique, non technique)
2. Ton Parcours Guidé (introduction personnalisée)
3. Phase 1 — Validation : Ta Première Vente (objective, plan, result)
4. Phase 2 — Création : La Construction (objective, plan, result)
5. Phase 3 — Automatisation : La Machine (objective, plan, result)
6. Phase 4 — Croissance : L'Expansion (objective, plan, result)
7. Pourquoi ce plan est efficace ? (4 avantages spécifiques)
8. Conclusion rassurante et appel naturel à continuer

Chaque phase doit contenir EXACTEMENT :
- TON OBJECTIF : ce que l'utilisateur cherche à accomplir
- NOTRE PLAN D'ACTION : comment on l'aide concrètement
- LE RÉSULTAT : ce qu'il obtient à la fin

LOGIQUE DE PERSONNALISATION
À CHAQUE SECTION :
- Reformule la passion en solution professionnelle (programme, méthode, formation, accompagnement, système…)
- Utilise les vrais noms de produits générés
- Adapte le niveau de complexité au user_level
- Adapte le ton au confidence_level

RÉSULTAT ATTENDU
Le texte final doit donner l'impression que :
- Ce plan a été pensé spécifiquement pour CET utilisateur
- Chaque phase est une évidence logique
- Rien n'est laissé au hasard
- Tout est déjà structuré
- Il ne reste qu'à avancer étape par étape`;

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
    if (session.plan_de_route) {
      console.log("Plan de route already generated, returning existing");
      return Response.json({
        success: true,
        planDeRoute: session.plan_de_route,
        fromCache: true
      });
    }

    const finalizedOffer = session.finalized_offer || {};
    const onboardingSummary = session.onboarding_summary || {};
    const onboardingFull = session.onboarding_full || {};
    
    const name = user.firstName || onboardingFull.firstName || 'l\'entrepreneur';
    const passionRaw = onboardingFull.coreSkill || onboardingFull.skill || 'ta compétence';
    const passionReformulated = onboardingSummary.who_to_teach || passionRaw;
    
    const mainOffer = finalizedOffer.mainProduct || {};
    const orderBump = finalizedOffer.petit_extra || {};
    const upsell = finalizedOffer.upsell1 || {};
    const premiumOffer = finalizedOffer.upsell3 || {};
    
    const revenueObjective = session.potential_revenue || 0;
    
    // 🔥 P1-5: Mapping DB-first (readinessScore existe, experienceLevel absent)
    const readinessScore = onboardingFull.readinessScore || 5;
    const userLevel = readinessScore >= 7 ? 'motivé' : readinessScore >= 4 ? 'intermédiaire' : 'débutant';
    const confidenceLevel = readinessScore >= 7 ? 'élevé' : readinessScore >= 4 ? 'moyen' : 'faible';

    console.log('📊 [generatePlanDeRoute] Mapped data:', {
      readinessScore,
      userLevel,
      confidenceLevel,
      revenueObjective
    });

    const userPrompt = `DONNÉES OBLIGATOIRES À UTILISER

Prénom : ${name}
Passion brute (NE PAS UTILISER TEL QUEL) : ${passionRaw}
Passion reformulée (UTILISER CELLE-CI) : ${passionReformulated}

Offres sélectionnées (utiliser les vrais titres et prix) :
Produit Principal : ${mainOffer.title || '—'} à ${mainOffer.price || '—'}
Petit Extra : ${orderBump.title || '—'} à ${orderBump.price || '—'}
Offre Supérieure : ${upsell.title || '—'} à ${upsell.price || '—'}
Offre Premium : ${premiumOffer.title || '—'} à ${premiumOffer.price || '—'}

Objectif de revenus : ${revenueObjective}€/mois
Niveau utilisateur : ${userLevel}
Niveau de confiance : ${confidenceLevel}

MISSION
Génère le contenu complet de la page "Concrètement ?" en respectant STRICTEMENT les 8 sections obligatoires.

Format de sortie JSON STRICT :
{
  "introduction": "texte d'intro rassurant et logique",
  "parcoursGuide": "texte personnalisé d'introduction au parcours",
  "phase1": {
    "title": "Validation : Ta Première Vente",
    "objective": "...",
    "plan": "...",
    "result": "..."
  },
  "phase2": {
    "title": "Création : La Construction",
    "objective": "...",
    "plan": "...",
    "result": "..."
  },
  "phase3": {
    "title": "Automatisation : La Machine",
    "objective": "...",
    "plan": "...",
    "result": "..."
  },
  "phase4": {
    "title": "Croissance : L'Expansion",
    "objective": "...",
    "plan": "...",
    "result": "..."
  },
  "advantages": [
    { "title": "...", "description": "..." },
    { "title": "...", "description": "..." },
    { "title": "...", "description": "..." },
    { "title": "...", "description": "..." }
  ],
  "conclusion": "texte de conclusion rassurant + appel naturel à continuer"
}

RAPPELS CRITIQUES :
- Utilise "${passionReformulated}", JAMAIS "${passionRaw}"
- Intègre les vrais titres et prix des offres
- Adapte le ton à "${userLevel}" et "${confidenceLevel}"
- Chaque phase doit mentionner concrètement les produits sélectionnés
- Les 4 avantages doivent être spécifiques à ce parcours`;

    console.log('OPENAI_CALL start', { 
      fn: 'generatePlanDeRoute',
      sessionId,
      model: 'gpt-4o-mini'
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "plan_de_route",
          strict: true,
          schema: {
            type: "object",
            properties: {
              introduction: { type: "string" },
              parcoursGuide: { type: "string" },
              phase1: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  objective: { type: "string" },
                  plan: { type: "string" },
                  result: { type: "string" }
                },
                required: ["title", "objective", "plan", "result"],
                additionalProperties: false
              },
              phase2: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  objective: { type: "string" },
                  plan: { type: "string" },
                  result: { type: "string" }
                },
                required: ["title", "objective", "plan", "result"],
                additionalProperties: false
              },
              phase3: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  objective: { type: "string" },
                  plan: { type: "string" },
                  result: { type: "string" }
                },
                required: ["title", "objective", "plan", "result"],
                additionalProperties: false
              },
              phase4: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  objective: { type: "string" },
                  plan: { type: "string" },
                  result: { type: "string" }
                },
                required: ["title", "objective", "plan", "result"],
                additionalProperties: false
              },
              advantages: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" }
                  },
                  required: ["title", "description"],
                  additionalProperties: false
                },
                minItems: 4,
                maxItems: 4
              },
              conclusion: { type: "string" }
            },
            required: ["introduction", "parcoursGuide", "phase1", "phase2", "phase3", "phase4", "advantages", "conclusion"],
            additionalProperties: false
          }
        }
      }
    });

    console.log('OPENAI_CALL end', {
      fn: 'generatePlanDeRoute',
      sessionId,
      usage: completion.usage
    });

    const planDeRoute = JSON.parse(completion.choices[0].message.content);

    // Save to session
    await base44.asServiceRole.entities.Session.update(sessionId, {
      plan_de_route: planDeRoute
    });

    return Response.json({
      success: true,
      planDeRoute
    });

  } catch (error) {
    console.error('Error generating plan de route:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});