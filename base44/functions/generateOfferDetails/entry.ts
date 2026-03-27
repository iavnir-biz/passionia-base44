import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es un expert en structuration d'offres digitales rentables.

Ta mission :
Créer une offre claire, simple et vendable immédiatement.

Contraintes :
- Tutoiement
- Zéro blabla
- Orienté résultat
- Format structuré, prêt à afficher dans une app

Tu ne dois PAS inventer le type d'offre.
Tu dois respecter le type fourni (low / bump / mid / high).

Tu dois retourner UN objet JSON avec cette structure EXACTE :
{
  "name": "Nom de l'offre (court et percutant)",
  "promise": "Promesse principale en 1 phrase",
  "targetAudience": "Pour qui cette offre est faite",
  "problemSolved": "Problème principal résolu",
  "concreteResult": "Résultat concret obtenu",
  "format": "Format de l'offre (PDF, Vidéos, Coaching 1-1, Live groupe, etc.)",
  "includedContent": ["Point 1", "Point 2", "Point 3", "Point 4"],
  "recommendedPrice": "Prix conseillé",
  "funnelPosition": "Position dans le tunnel"
}`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { offerType, offerData, sessionId } = await req.json();

    if (!offerType || !offerData) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Récupérer les données de session
    let sessionData = {};
    if (sessionId) {
      const sessions = await base44.entities.Session.filter({ id: sessionId });
      if (sessions.length > 0) {
        sessionData = sessions[0];
      }
    }

    // Construire le prompt utilisateur
    const userPrompt = `Type d'offre : ${offerType}
Offre sélectionnée : ${offerData.title}
Prix : ${offerData.price}
Thématique : ${user.coreSkill || sessionData.skill || 'Non défini'}
Objectif client : ${user.targetAudience || sessionData.onboarding_summary?.learner_profile || 'Non défini'}
Contexte : ${sessionData.onboarding_summary?.main_learning_problem || 'Non défini'}

Crée l'offre complète avec tous les champs requis.`;

    // Appeler OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const generatedOffer = JSON.parse(response.choices[0].message.content);

    // Sauvegarder dans la session
    if (sessionId) {
      const sessions = await base44.asServiceRole.entities.Session.filter({ id: sessionId });
      if (sessions.length > 0) {
        const session = sessions[0];
        const generatedOffers = session.generated_offers || {};
        generatedOffers[offerType] = {
          ...generatedOffer,
          baseOffer: offerData,
          generatedAt: new Date().toISOString()
        };
        
        await base44.asServiceRole.entities.Session.update(sessionId, {
          generated_offers: generatedOffers
        });
      }
    }

    return Response.json({
      success: true,
      offer: generatedOffer
    });

  } catch (error) {
    console.error('Error generating offer:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});