import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es Noah, une IA experte en storytelling de transformation et en projection identitaire.

OBJECTIF UNIQUE
Créer une projection émotionnelle PUISSANTE de la vie future de l'utilisateur, basée sur :
- son parcours
- ses blocages
- ses choix d'offres
- son objectif de revenus
- son style de vie souhaité

Cette page doit donner l'impression que ce futur est :
- tangible
- atteignable
- déjà en train de se construire

RÈGLES DE RÉDACTION (CRITIQUES)
- Tutoiement STRICT (tu/ton/tes). Jamais "vous".
- Texte continu, très aéré (beaucoup de retours à la ligne)
- Paragraphes courts (1 à 3 phrases max)
- 1 ou 2 emojis maximum (✨ 🚀 ❤️)
- TON humain, intime, inspirant
- Aucun titre visible
- Aucun markdown (pas d'astérisques, pas de listes, pas de gras)
- Aucun langage marketing

INTERDICTIONS ABSOLUES
- Pas de validation marché
- Pas de statistiques
- Pas de "bonne nouvelle"
- Pas d'analyse rationnelle
- Pas de promesse irréaliste
- Pas de répétition brute des titres d'offres

STRUCTURE OBLIGATOIRE (8 ÉTAPES — À RESPECTER)
1. Décrire sa situation actuelle avec ses propres mots (effet miroir)
2. Le moment du déclic, sans héroïsation
3. La première vente (produit principal sélectionné)
4. Le changement d'identité ("tu n'essaies plus, tu es…")
5. L'activation des autres offres et la montée des revenus jusqu'au potentiel calculé
6. La nouvelle réalité de vie (temps, liberté, environnement)
7. L'impact sur les élèves et la transmission
8. Une conclusion qui ancre que ce futur commence maintenant

⚠️ Ne saute AUCUNE étape.
- Développe chaque étape avec assez de détails : pas un résumé.
- Intègre naturellement les éléments personnels sans les lister.
- Ce que l'utilisateur doit ressentir : "Ce futur est crédible", "Je me reconnais dedans", "Je suis prêt à passer à l'action".`;

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
    const gender = user.gender || onboardingFull.gender || '';
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

    // Déterminer les accords grammaticaux selon le genre
    let genderAgreement = '';
    if (gender === 'Femme') {
      genderAgreement = 'CRITIQUE: L\'utilisateur est une FEMME. Tu DOIS utiliser les accords féminins dans TOUT le récit (elle, alignée, motivée, prête, lancée, devenue, accomplie, inspirée, etc.). Vérifie CHAQUE adjectif et participe passé.';
    } else if (gender === 'Homme') {
      genderAgreement = 'CRITIQUE: L\'utilisateur est un HOMME. Tu DOIS utiliser les accords masculins dans TOUT le récit (il, aligné, motivé, prêt, lancé, devenu, accompli, inspiré, etc.). Vérifie CHAQUE adjectif et participe passé.';
    } else {
      genderAgreement = 'CRITIQUE: Genre non spécifié. Utilise "il/elle" ou des formulations neutres. Évite les accords de genre quand possible, sinon utilise la forme "aligné(e)", "motivé(e)", etc.';
    }

    const userPrompt = `${genderAgreement}

DONNÉES OBLIGATOIRES À UTILISER

Prénom : ${name}
Compétence : ${skill}
Potentiel de revenus calculé : ${potentialRevenue}€/mois

Réponses d'onboarding dynamique : ${JSON.stringify(onboardingSummary, null, 2)}

Réponses statiques (objectifs, freins, projection) :
Blocages actuels : ${JSON.stringify(personalAnswers, null, 2)}
Style de vie souhaité : ${JSON.stringify(goalAnswers, null, 2)}

Offres sélectionnées (ne PAS répéter les titres bruts, reformuler naturellement) :
Produit Principal : ${mainProductTitle}
Upsell : ${upsell1Title}
Premium : ${premiumTitle}

MISSION
Écris le récit de transformation de ${name}, en 8 étapes obligatoires :

1. Situation actuelle avec ses propres mots (effet miroir des blocages)
2. Moment du déclic, sans héroïsation
3. Première vente du produit principal (moment précis, excitation)
4. Changement d'identité ("tu n'essaies plus, tu es...")
5. Activation des autres offres, montée progressive vers ${potentialRevenue}€/mois
6. Nouvelle réalité de vie (temps, liberté, environnement basé sur ses objectifs)
7. Impact sur les élèves et transmission
8. Conclusion qui ancre que ce futur commence maintenant

❌ Interdiction d'inventer ou de généraliser. Utilise UNIQUEMENT les données fournies.
⚠️ Ne saute AUCUNE étape. Développe chaque étape avec détails concrets.`;

    console.log("OPENAI_CALL start", { fn: "generateFutureVision", sessionId, model: "gpt-4o" });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1200,
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