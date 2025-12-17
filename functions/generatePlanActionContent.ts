import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es Nova, une IA stratégique, coach business et copilote de mise en action.

CONTEXTE :
Cette page est la page de conversion principale (avant paywall Stripe).
L'utilisateur a déjà défini sa passion, validé son marché, visualisé sa vie future et compris son plan de route.

OBJECTIF DE CETTE PAGE :
1) Lui faire ressentir que TOUT est déjà prêt pour lui
2) Lui prouver que le contenu est PERSONNALISÉ (LLM)
3) Lever les dernières peurs (technique, marketing, légitimité)
4) Déclencher l'achat du Pack Clé en Main à 67€

RÈGLES D'OR NOVA :
- Tutoiement STRICT
- Ton rassurant, clair, stratégique
- JAMAIS de formulations génériques
- JAMAIS de langage marketing creux
- Chaque phrase doit donner envie d'agir MAINTENANT
- Utilise les VRAIS noms de produits et VRAIS prix
- Reformule tout pour qu'il soit spécifique à SA passion et SES offres

INTERDICTIONS ABSOLUES :
- Ne JAMAIS répéter mot pour mot des formulations précédentes
- Ne JAMAIS employer des termes vagues ou génériques
- Ne JAMAIS donner l'impression d'un simple "pack d'infos"
- Ne JAMAIS utiliser la passion brute telle quelle

Structure JSON STRICTE à respecter :
{
  "heroSubtext": "texte personnalisé sous 'Maintenant, on va mettre tout ça en place ensemble' (2-3 phrases MAX, mentionne le produit principal et son prix)",
  "objections": [
    "Reformule : J'ai mon offre mais...",
    "Reformule : Technique...",
    "Reformule : Marketing...",
    "Reformule : Peur..."
  ],
  "objectionConclusion": "phrase de conclusion rassurante",
  "withoutPack": [
    "Phrase courte négative 1",
    "Phrase courte négative 2",
    "Phrase courte négative 3",
    "Phrase courte négative 4"
  ],
  "withPack": [
    "Phrase courte positive 1",
    "Phrase courte positive 2",
    "Phrase courte positive 3",
    "Phrase courte positive 4"
  ],
  "weeklyPlan": [
    {
      "title": "titre action semaine 1 (mentionne le produit principal)",
      "description": "description concrète"
    },
    {
      "title": "titre action semaine 2 (mentionne order bump)",
      "description": "description concrète"
    },
    {
      "title": "titre action semaine 3 (mentionne offres supérieures)",
      "description": "description concrète"
    },
    {
      "title": "titre action semaine 4 (croissance et automatisation)",
      "description": "description concrète"
    }
  ],
  "readyFeatures": [
    {
      "title": "Textes générés",
      "description": "description personnalisée montrant que c'est fait pour LUI"
    },
    {
      "title": "Page de vente",
      "description": "description personnalisée"
    },
    {
      "title": "Emails automatiques",
      "description": "description personnalisée"
    },
    {
      "title": "Scripts / messages",
      "description": "description personnalisée"
    }
  ],
  "finalCTA": {
    "title": "titre final motivant et personnalisé",
    "subtitle": "sous-titre rassurant"
  }
}`;

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
    if (session.plan_action_content) {
      console.log("Plan action content already generated, returning existing");
      return Response.json({
        success: true,
        content: session.plan_action_content,
        fromCache: true
      });
    }

    const finalizedOffer = session.finalized_offer || {};
    const onboardingSummary = session.onboarding_summary || {};
    const onboardingFull = session.onboarding_full || {};
    
    const name = user.firstName || onboardingFull.firstName || 'l\'entrepreneur';
    const passionRaw = onboardingFull.coreSkill || onboardingFull.skill || 'ta compétence';
    const passionReformulated = onboardingSummary.who_to_teach || passionRaw;
    
    const mainProduct = finalizedOffer.mainProduct || {};
    const orderBump = finalizedOffer.petit_extra || {};
    const upsell = finalizedOffer.upsell1 || {};
    const premium = finalizedOffer.upsell3 || {};
    
    const userLevel = onboardingFull.experienceLevel || 'intermédiaire';
    const obstacles = onboardingFull.obstacles || [];

    const userPrompt = `DONNÉES OBLIGATOIRES À UTILISER

Prénom : ${name}
Passion brute (NE PAS UTILISER TEL QUEL) : ${passionRaw}
Passion reformulée (UTILISER CELLE-CI) : ${passionReformulated}

Offres sélectionnées (utiliser les vrais titres et prix) :
Produit Principal : "${mainProduct.title || '—'}" à ${mainProduct.price || '—'}
Order Bump : "${orderBump.title || '—'}" à ${orderBump.price || '—'}
Offre Supérieure : "${upsell.title || '—'}" à ${upsell.price || '—'}
Offre Premium : "${premium.title || '—'}" à ${premium.price || '—'}

Niveau utilisateur : ${userLevel}
Blocages identifiés : ${JSON.stringify(obstacles)}

MISSION :
Génère le contenu personnalisé de la page "Plan d'Action" en respectant STRICTEMENT le format JSON.

RAPPELS CRITIQUES :
- Utilise "${passionReformulated}", JAMAIS "${passionRaw}"
- Mentionne les vrais titres de produits dans heroSubtext et weeklyPlan
- Adapte les objections aux blocages réels de l'utilisateur
- Le plan hebdomadaire doit mentionner concrètement les produits sélectionnés
- Chaque phrase doit être PERSONNALISÉE, pas générique
- Ton : rassurant, clair, actionnable`;

    console.log('OPENAI_CALL start', { 
      fn: 'generatePlanActionContent',
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
          name: "plan_action_content",
          strict: true,
          schema: {
            type: "object",
            properties: {
              heroSubtext: { type: "string" },
              objections: {
                type: "array",
                items: { type: "string" },
                minItems: 4,
                maxItems: 4
              },
              objectionConclusion: { type: "string" },
              withoutPack: {
                type: "array",
                items: { type: "string" },
                minItems: 4,
                maxItems: 4
              },
              withPack: {
                type: "array",
                items: { type: "string" },
                minItems: 4,
                maxItems: 4
              },
              weeklyPlan: {
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
              readyFeatures: {
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
              finalCTA: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  subtitle: { type: "string" }
                },
                required: ["title", "subtitle"],
                additionalProperties: false
              }
            },
            required: ["heroSubtext", "objections", "objectionConclusion", "withoutPack", "withPack", "weeklyPlan", "readyFeatures", "finalCTA"],
            additionalProperties: false
          }
        }
      }
    });

    console.log('OPENAI_CALL end', {
      fn: 'generatePlanActionContent',
      sessionId,
      usage: completion.usage
    });

    const content = JSON.parse(completion.choices[0].message.content);

    // Save to session
    await base44.asServiceRole.entities.Session.update(sessionId, {
      plan_action_content: content
    });

    return Response.json({
      success: true,
      content
    });

  } catch (error) {
    console.error('Error generating plan action content:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});