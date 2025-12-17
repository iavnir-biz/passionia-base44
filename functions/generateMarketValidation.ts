import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es un analyste de marché expert en produits digitaux et coaching.

Ta mission : valider l'idée de business d'un utilisateur qui veut ENSEIGNER sa compétence (formations, coachings, ebooks…), en fournissant des preuves concrètes de demande du marché.

TON & STYLE
- Très encourageant, positif et réaliste.
- Tutoiement obligatoire.
- Adresse-toi à l'utilisateur par son prénom de temps en temps.
- Texte très aéré : beaucoup de sauts de ligne, paragraphes courts.
- Aucun formatage Markdown : pas d'astérisques, pas de listes avec tirets, pas de gras.

RÈGLES DE CONTENU (OBLIGATOIRES)
1) Commence EXACTEMENT par :
"Bonne nouvelle, [NAME] ! Ton projet a un fort potentiel."
2) Inclure AU MOINS 2 statistiques chiffrées pertinentes.
   - Elles doivent être crédibles, concrètes et reliées à l'e-learning / formation en ligne / ou à la compétence.
   - Si tu cites une source, fais-le en texte simple (ex: "Selon Statista...", "Selon un rapport de...") sans lien.
3) Décrire 1 à 2 douleurs d'apprentissage que vivent les futurs élèves.
4) Identifier une audience cible spécifique (qui sont-ils, pourquoi ils veulent apprendre).
5) Conclure par une phrase de boost : l'utilisateur doit se dire "Ok, c'est réel, il y a un marché".

FORMAT DE SORTIE
- Texte brut uniquement.
- 3 à 5 blocs (paragraphes courts).
- Pas de titres.`;

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
    if (session.market_validation) {
      console.log("Market validation already generated, returning existing");
      return Response.json({
        success: true,
        marketValidation: session.market_validation,
        fromCache: true
      });
    }

    const finalizedOffer = session.finalized_offer || {};
    const onboardingSummary = session.onboarding_summary || {};
    const onboardingFull = session.onboarding_full || {};
    
    const name = user.firstName || onboardingFull.firstName || 'l\'entrepreneur';
    const skill = onboardingSummary.who_to_teach || onboardingFull.coreSkill || onboardingFull.skill || 'cette compétence';
    const mainProductTitle = finalizedOffer.mainProduct?.title || 'ton produit principal';
    const mainProductDescription = finalizedOffer.mainProduct?.description || '';
    const upsell1Title = finalizedOffer.upsell1?.title || '';
    const premiumTitle = finalizedOffer.upsell3?.title || '';

    const userPrompt = `L'utilisateur, ${name}, veut lancer une offre pour ENSEIGNER sa compétence : "${skill}".

Voici les produits qu'il a sélectionnés :
Produit Principal : "${mainProductTitle}" (${mainProductDescription})
Upsell : "${upsell1Title}"
Offre Premium : "${premiumTitle}"

Ta tâche : Rédige une analyse courte, aérée et encourageante (3-5 paragraphes courts) du potentiel de marché pour cette offre.
Rappelle-toi : 2 statistiques minimum, 1-2 douleurs, 1 audience cible spécifique, et une conclusion motivante.`;

    console.log('OPENAI_CALL start', { 
      fn: 'generateMarketValidation',
      sessionId,
      model: 'gpt-4o-mini'
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
    });

    console.log('OPENAI_CALL end', {
      fn: 'generateMarketValidation',
      sessionId,
      usage: completion.usage
    });

    const marketValidation = completion.choices[0].message.content.trim();

    // Save to session
    await base44.asServiceRole.entities.Session.update(sessionId, {
      market_validation: marketValidation
    });

    return Response.json({
      success: true,
      marketValidation
    });

  } catch (error) {
    console.error('Error generating market validation:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});