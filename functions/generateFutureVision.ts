import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es un expert en storytelling de transformation et copywriting émotionnel.

Ta mission : créer un récit de transformation UNIQUE, personnalisé et percutant, qui projette l'utilisateur dans sa "vie future" après avoir lancé son activité de formation.

TON & STYLE
- Tutoiement obligatoire (tu/ton/tes). Jamais "vous".
- Très aéré : beaucoup de sauts de ligne, paragraphes courts.
- Émotionnel, imagé, motivant, mais crédible.
- 1 à 2 emojis max (✨ 🚀 ❤️), pas plus.

FORMATAGE INTERDIT
- Texte brut uniquement.
- Aucun Markdown : pas d'astérisques, pas de listes avec tirets, pas de titres.
- Pas de sections type "Étape 1", "Conclusion", etc. Le récit doit être un texte fluide.

STRUCTURE OBLIGATOIRE (8 ÉTAPES À RESPECTER)
1) Effet miroir : sa situation actuelle (doutes, frustrations) avec ses propres mots.
2) Élément déclencheur : le déclic, décision de passer à l'action.
3) Validation : première vente du produit principal, moment précis (notification, excitation).
4) Transformation identitaire : il se voit différemment, fierté, confiance.
5) Ascension : il met en place upsell/premium, les revenus montent progressivement jusqu'au revenu potentiel.
6) Nouvelle réalité : liberté, style de vie, impact (utiliser ses réponses sur ce que ça changerait).
7) Impact : ses élèves, la transmission, les résultats chez eux.
8) Appel au destin : phrase finale inspirante, "ça commence maintenant".

IMPORTANT
- Ne saute aucune étape.
- Développe chaque étape avec assez de détails : pas un résumé.
- Intègre naturellement les éléments personnels (réponses perso + objectifs).`;

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
    if (session.future_vision) {
      console.log("Future vision already generated, returning existing");
      return Response.json({
        success: true,
        narrativeText: session.future_vision,
        fromCache: true
      });
    }

    const finalizedOffer = session.finalized_offer || {};
    const onboardingSummary = session.onboarding_summary || {};
    const onboardingFull = session.onboarding_full || {};
    const potentialRevenue = session.potential_revenue || 0;
    
    const name = user.firstName || onboardingFull.firstName || 'l\'entrepreneur';
    const skill = onboardingSummary.who_to_teach || onboardingFull.coreSkill || onboardingFull.skill || 'cette compétence';
    
    // Personal answers (effet miroir + nouvelle réalité)
    const personalAnswers = {
      obstacles: onboardingFull.obstacles || '',
      ifNothingChanges: onboardingFull.ifNothingChanges || ''
    };
    
    // Goal answers (vision + style de vie)
    const goalAnswers = {
      lifeChange: onboardingFull.lifeChange || '',
      impact: onboardingFull.impact || '',
      emotions: onboardingFull.emotions || '',
      relatives: onboardingFull.relatives || '',
      lifestyle: onboardingFull.lifestyle || ''
    };

    const mainProductTitle = finalizedOffer.mainProduct?.title || 'ton produit principal';
    const upsell1Title = finalizedOffer.upsell1?.title || '';
    const premiumTitle = finalizedOffer.upsell3?.title || '';

    const userPrompt = `Écris l'histoire de transformation de ${name} qui lance son activité de formation en "${skill}".

Infos à intégrer naturellement :
Prénom : ${name}
Compétence : ${skill}
Objectif : ${potentialRevenue}€/mois

Réponses personnelles (à réutiliser pour l'effet miroir et la nouvelle réalité) :
${JSON.stringify(personalAnswers, null, 2)}

Objectifs (à réutiliser pour la vision et le style de vie) :
${JSON.stringify(goalAnswers, null, 2)}

Offres sélectionnées (à mentionner au bon moment, surtout la première vente) :
Produit Principal : ${mainProductTitle}
Upsell : ${upsell1Title}
Premium : ${premiumTitle}

RAPPEL : Respecte les 8 étapes obligatoires dans l'ordre. Développe chaque étape, ne résume pas.`;

    console.log("OPENAI_CALL start", { fn: "generateFutureVision", sessionId, model: "gpt-4o-mini" });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.5,
      max_tokens: 800,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "future_vision",
          strict: true,
          schema: {
            type: "object",
            properties: {
              narrativeText: { type: "string" }
            },
            required: ["narrativeText"],
            additionalProperties: false
          }
        }
      }
    });

    console.log("OPENAI_CALL end", { 
      fn: "generateFutureVision", 
      sessionId, 
      usage: completion.usage 
    });

    const result = JSON.parse(completion.choices[0].message.content);
    const narrativeText = result.narrativeText;

    // Save to session
    await base44.asServiceRole.entities.Session.update(sessionId, {
      future_vision: narrativeText
    });

    return Response.json({
      success: true,
      narrativeText
    });

  } catch (error) {
    console.error('Error in generateFutureVision:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});