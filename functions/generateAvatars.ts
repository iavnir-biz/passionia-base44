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

        const { profile, session } = await req.json();

        // Construct user context
        const userContext = `
PROFIL UTILISATEUR:
- Prénom: ${user.full_name || 'Non défini'}
- Email: ${user.email}

PROFIL BUSINESS:
${profile ? `
- Passion/Expertise: ${profile.passion || 'Non défini'}
- Audience cible: ${profile.target_audience || 'Non défini'}
- Problème principal: ${profile.main_problem || 'Non défini'}
- Quick win promis: ${profile.quick_win || 'Non défini'}
- Transformation finale: ${profile.transformation || 'Non défini'}
- Méthode unique: ${profile.unique_method || 'Non défini'}
` : 'Profil non renseigné'}

INFORMATIONS ONBOARDING:
${session?.onboarding_summary ? `
- Qui enseigner: ${session.onboarding_summary.who_to_teach || 'Non défini'}
- Profil apprenant: ${session.onboarding_summary.learner_profile || 'Non défini'}
- Problème d'apprentissage: ${session.onboarding_summary.main_learning_problem || 'Non défini'}
- Transformation promise: ${session.onboarding_summary.big_transformation || 'Non défini'}
- Angle de méthode: ${session.onboarding_summary.method_angle || 'Non défini'}
` : 'Onboarding non complété'}

OFFRE SÉLECTIONNÉE:
${session?.offer_generation ? `
${JSON.stringify(session.offer_generation, null, 2)}
` : 'Offre non définie'}
        `.trim();

        const systemMessage = `Tu es Nova, coach business expert en psychologie client et création d'avatars stratégiques.

MISSION : Génère EXACTEMENT 3 AVATARS CLIENTS ultra-détaillés, complémentaires et exploitables pour créer offres, messages de vente, emails et contenus.

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

RÈGLES ABSOLUES :
- Les 3 avatars sont COMPLÉMENTAIRES (différents segments de l'audience)
- Chaque avatar = une personne réelle qu'on peut visualiser
- Langage ULTRA HUMAIN et émotionnel
- Tutoiement dans toutes les descriptions
- Basé sur la PSYCHOLOGIE réelle du client idéal
- Exploitable directement pour : messages de vente, emails, contenus, publicités
- Cohérent avec l'univers Passion IA : humain, simple, rassurant, jamais agressif

Objectif final : L'utilisateur doit se dire "Je sais exactement à qui je parle, comment les aider et comment leur vendre."`;


        console.log('Generating client avatars...');
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: userContext }
            ],
            temperature: 0.8,
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content);

        return Response.json({
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