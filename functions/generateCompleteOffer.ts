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
      return Response.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    // Récupérer les données de session
    const sessions = await base44.asServiceRole.entities.Session.filter({ id: sessionId });
    if (sessions.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = sessions[0];
    const generatedOffers = session.generated_offers || {};

    // Vérifier que les 4 offres individuelles sont générées
    const requiredOffers = ['offre_premium', 'offre_superieure', 'petit_extra', 'product_principal'];
    const allGenerated = requiredOffers.every(type => generatedOffers[type]);

    if (!allGenerated) {
      return Response.json({ 
        error: 'Toutes les offres individuelles doivent être générées d\'abord',
        success: false 
      }, { status: 400 });
    }

    // Construire le prompt avec toutes les offres
    const offersText = requiredOffers.map(type => {
      const offer = generatedOffers[type];
      return `${offer.name} (${offer.recommendedPrice}) - ${offer.promise}`;
    }).join('\n');

    const prompt = `Tu es un expert en structuration d'offres digitales.

Voici les 4 offres individuelles déjà créées :

${offersText}

Crée maintenant une synthèse complète qui présente l'ensemble de l'offre comme un pack cohérent et attractif.

Retourne un objet JSON avec :
{
  "name": "Nom du pack complet",
  "description": "Description du pack (3-4 phrases)",
  "offers": [
    {
      "name": "Nom offre",
      "price": "Prix",
      "description": "Description courte"
    }
  ],
  "version": 1
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "Tu es un expert en structuration d'offres. Réponds uniquement en JSON valide." 
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const completeOffer = JSON.parse(response.choices[0].message.content);

    // Sauvegarder l'offre complète
    generatedOffers.complete = {
      ...completeOffer,
      generatedAt: new Date().toISOString()
    };

    await base44.asServiceRole.entities.Session.update(sessionId, {
      generated_offers: generatedOffers
    });

    return Response.json({
      success: true,
      offer: completeOffer
    });

  } catch (error) {
    console.error('Error generating complete offer:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});