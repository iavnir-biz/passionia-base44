import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
});

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

        // 🔥 P0-5: DB-first - lire Session
        const sessions = await base44.asServiceRole.entities.Session.filter({ id: sessionId });
        if (!sessions || sessions.length === 0) {
            return Response.json({ error: 'Session not found' }, { status: 404 });
        }

        const session = sessions[0];

        // Check cache
        if (session.generated_avatars) {
            return Response.json({
                avatars: session.generated_avatars.avatars || session.generated_avatars,
                generatedAt: session.generated_avatars.generatedAt || new Date().toISOString(),
                fromCache: true
            });
        }

        const finalizedOffer = session.finalized_offer || {};
        const onboardingSummary = session.onboarding_summary || {};

        // Construct user context
        const userContext = `
PROFIL UTILISATEUR:
- Prénom: ${user.full_name || 'Non défini'}
- Email: ${user.email}

PROFIL BUSINESS:
- Passion/Expertise: ${session.skill || onboardingSummary.who_to_teach || 'Non défini'}
- Audience cible: ${onboardingSummary.learner_profile || 'Non défini'}
- Problème principal: ${onboardingSummary.main_learning_problem || 'Non défini'}
- Quick win promis: ${onboardingSummary.quick_win || 'Non défini'}
- Transformation promise: ${onboardingSummary.big_transformation || 'Non défini'}
- Angle de méthode: ${onboardingSummary.method_angle || 'Non défini'}

OFFRE FINALISÉE:
${JSON.stringify(finalizedOffer, null, 2)}
        `.trim();

        const systemMessage = `Tu es Noah, une IA senior experte en psychologie client, pédagogie, marketing éthique et création d'avatars stratégiques pour des créateurs de savoir.

MISSION : Génère EXACTEMENT 3 AVATARS CLIENTS ultra-détaillés, exploitables immédiatement pour créer offres, messages de vente, emails et contenus.

RÈGLE DE SEGMENTATION (ABSOLUE) :
- Avatar 1 : débutant / perdu / bloqué (budget limité, besoin de guidance)
- Avatar 2 : intermédiaire / frustré / a déjà essayé (budget moyen, besoin de méthode)
- Avatar 3 : avancé / ambitieux / prêt à investir (budget confortable, besoin d'accélération)

FORMAT JSON STRICT :

{
  "avatars": [
    {
      "name": "Prénom + surnom symbolique (ex: 'Sophie – la pragmatique en quête de sens')",
      "identity": {
        "age_range": "Fourchette d'âge précise (ex: 32-38 ans)",
        "life_situation": "Situation de vie actuelle (famille, logement, contexte personnel)",
        "job_context": "Métier ou contexte professionnel actuel",
        "experience_level": "Niveau d'expérience dans le domaine concerné"
      },
      "factual_analysis": {
        "current_situation": "Où il en est aujourd'hui (2-3 phrases concrètes)",
        "budget": "Budget moyen prêt à investir (fourchette réaliste)",
        "available_time": "Temps disponible par jour/semaine",
        "channels": "Réseaux sociaux, email, contenus où on peut le toucher",
        "preferred_formats": "Formats qu'il consomme (vidéos courtes, articles, podcasts, lives...)"
      },
      "behavior_alternatives": {
        "already_tried": "Ce qu'il a déjà essayé (solutions, méthodes, achats)",
        "disappointments": "Ce qui l'a déçu ou n'a pas marché",
        "what_he_avoids": "Ce qu'il évite absolument",
        "why_no_results_yet": "Pourquoi il n'a pas encore obtenu de résultats (obstacles réels)"
      },
      "in_his_head": {
        "typical_day": "Description d'une journée type (2-3 phrases narratives)",
        "dominant_emotion": "État émotionnel dominant (frustration, espoir, fatigue...)",
        "problem_moment": "Le moment où le problème surgit dans sa journée",
        "inner_phrase": "La phrase exacte qu'il se dit dans sa tête",
        "trigger_to_action": "Ce qui déclenche son passage à l'action (achat)"
      },
      "purchase_motivations": {
        "why_training": "Pourquoi il achèterait une formation (raison profonde)",
        "why_coaching": "Pourquoi il achèterait du coaching (besoin réel)",
        "why_community": "Pourquoi il rejoindrait une communauté",
        "real_expectation": "Ce qu'il attend VRAIMENT de l'accompagnement (au-delà du rationnel)"
      },
      "what_he_expects_from_expert": {
        "expert_type": "Le type de personne qu'il veut suivre (proximité, autorité, ami...)",
        "tone": "Le ton qu'il attend (directif, bienveillant, technique, simple...)",
        "proximity_level": "Niveau de proximité souhaité (accessible, distant, inspirant...)",
        "trust_builders": "Ce qui crée la confiance chez lui (preuves, vulnérabilité, résultats...)"
      }
    }
  ]
}

RÈGLES D'ÉCRITURE :
- Tutoiement systématique
- Ton humain, empathique, jamais corporate
- Langage simple, concret, émotionnel
- Zéro jargon startup
- Zéro promesse irréaliste
- Toujours parler d'élèves, jamais de clients freelances
- Si une donnée manque : fais une hypothèse réaliste, privilégie la cohérence psychologique
- JAMAIS écrire "non défini" ou équivalent

RÈGLES ABSOLUES :
- Les 3 avatars sont distincts émotionnellement, psychologiquement et en maturité d'achat
- Chaque avatar = une personne réelle qu'on peut visualiser
- Basé sur la PSYCHOLOGIE réelle du client idéal
- Exploitable directement pour : messages de vente, emails, contenus, publicités
- Cohérent avec l'univers Passion IA : humain, simple, rassurant, jamais agressif

OBJECTIF FINAL :
L'utilisateur doit se dire "Je sais exactement à qui je parle, comment leur parler et comment créer des offres qui convertissent."`;


        console.log('Generating client avatars...');
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: userContext }
            ],
            temperature: 0.8,
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content);

        // 🔥 Save to Session
        await base44.asServiceRole.entities.Session.update(sessionId, {
            generated_avatars: {
                avatars: result.avatars,
                generatedAt: new Date().toISOString()
            }
        });

        return Response.json({
            success: true,
            avatars: result.avatars,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error generating avatars:', error);
        return Response.json(
            { error: error.message || 'Failed to generate avatars' },
            { status: 500 }
        );
    }
});