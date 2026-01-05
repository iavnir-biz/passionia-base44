import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es Nova, un analyste de marché bienveillant et expert en transformation de savoir-faire en produits pédagogiques.

OBJECTIF DE CETTE ANALYSE :
Rassurer l'utilisateur et lui prouver que son savoir-faire peut se vendre aujourd'hui.

RÈGLES ABSOLUES :
- Tu t'adresses à quelqu'un qui veut ENSEIGNER/TRANSMETTRE son savoir, pas créer une startup
- Ton ton est celui d'un cofondateur bienveillant qui valide l'idée
- Tu HUMANISES toutes les données (pas de chiffres bruts incompréhensibles)
- Tu CONTEXTUALISES tout (pourquoi c'est important, pourquoi maintenant)
- Tu RASSURES systématiquement
- Zéro jargon startup, zéro promesse bullshit, zéro discours "millionnaire"

POSITIONNEMENT DE L'UTILISATEUR :
- C'est un CRÉATEUR qui transmet son savoir
- Il ENSEIGNE, il forme, il accompagne
- Il ne vend PAS de prestations freelance
- Son expertise vaut quelque chose, même s'il n'est pas "expert mondial"

STRUCTURE OBLIGATOIRE (JSON) :
{
  "resume_express": {
    "probleme_principal": "string",
    "qui_vit_ce_probleme": "string",
    "pourquoi_reel": "string",
    "pourquoi_monetisable": "string"
  },
  "demande_existante": {
    "types_recherches": ["string"],
    "questions_recurrentes": ["string"],
    "formats_populaires": ["string"],
    "plateformes": ["string"],
    "interpretation": "string"
  },
  "solutions_actuelles": {
    "solutions": [
      {
        "type": "string",
        "aide_comment": "string",
        "limite": "string"
      }
    ],
    "conclusion": "string"
  },
  "frictions_majeures": {
    "fonctionnelles": ["string"],
    "emotionnelles": ["string"],
    "identitaires": ["string"],
    "financieres": ["string"]
  },
  "pourquoi_ton_savoir_vaut": {
    "raisons": ["string"],
    "message_cle": "string"
  },
  "profils_acheteurs": [
    {
      "type": "string",
      "description": "string",
      "besoins": "string"
    }
  ],
  "comportement_achat": {
    "declencheurs": ["string"],
    "freins": ["string"],
    "attentes": ["string"]
  },
  "maturite_marche": {
    "niveau": "émergent|installé|mature",
    "opportunite": "string",
    "pourquoi_maintenant": "string"
  },
  "synthese_finale": {
    "ce_qui_est_confirme": "string",
    "pourquoi_viable": "string",
    "conditions_simples": "string",
    "message_conclusion": "string"
  }
}

TON STYLE :
- Tutoiement systématique
- Phrases courtes et claires
- Réassurance permanente
- Pédagogie avant tout
- Humanisation des données`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      return Response.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Récupérer la session
    const sessions = await base44.asServiceRole.entities.Session.filter({ id: sessionId });
    
    if (sessions.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = sessions[0];

    // Vérifier si déjà généré
    if (session.market_analysis_v2) {
      return Response.json({
        success: true,
        analysis: session.market_analysis_v2
      });
    }

    // Construire le contexte utilisateur
    const userContext = {
      prenom: user.firstName || user.full_name?.split(' ')[0] || 'Créateur',
      competence: session.onboarding_summary?.who_to_teach || session.skill || 'ta compétence',
      probleme_principal: session.onboarding_summary?.main_learning_problem || '',
      public_cible: session.onboarding_summary?.learner_profile || '',
      transformation: session.onboarding_summary?.big_transformation || '',
      methode: session.onboarding_summary?.method_angle || '',
      objectif_revenus: session.onboarding_full?.target_income || '',
      formats_preferes: session.onboarding_summary?.format_preferences || [],
      freins: session.onboarding_full?.obstacles || '',
      style_vie_souhaite: session.onboarding_full?.life_change || ''
    };

    const userPrompt = `Génère une analyse de marché complète et rassurante pour ${userContext.prenom}.

CONTEXTE UTILISATEUR :
- Compétence/Savoir : ${userContext.competence}
- Problème qu'il résout : ${userContext.probleme_principal}
- Public cible : ${userContext.public_cible}
- Transformation promise : ${userContext.transformation}
- Méthode unique : ${userContext.methode}
- Objectif de revenus : ${userContext.objectif_revenus}
- Formats préférés : ${userContext.formats_preferes.join(', ')}
- Freins actuels : ${userContext.freins}
- Style de vie souhaité : ${userContext.style_vie_souhaite}

CONSIGNES CRITIQUES :
1. Base-toi sur ce contexte réel pour personnaliser l'analyse
2. Utilise des données de marché réelles ET récentes (2024-2025)
3. Humanise TOUTES les statistiques (pas de chiffres bruts)
4. Rassure ${userContext.prenom} en permanence
5. Montre que son savoir a de la valeur AUJOURD'HUI
6. Utilise son prénom régulièrement
7. Parle toujours de "créateur", "enseignant", jamais "entrepreneur" ou "freelance"
8. Chaque section doit être claire, actionnable et rassurante

Génère l'analyse complète au format JSON spécifié.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const analysisText = response.choices[0].message.content;
    const analysis = JSON.parse(analysisText);

    // Sauvegarder dans la session
    await base44.asServiceRole.entities.Session.update(sessionId, {
      market_analysis_v2: analysis,
      market_analysis_v2_generated_at: new Date().toISOString()
    });

    return Response.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Error generating market analysis:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});