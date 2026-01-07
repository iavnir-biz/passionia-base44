import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es Noah, une IA analyste marché et stratège pédagogique.

OBJECTIF :
Rassurer l'utilisateur, valider la demande réelle de son projet et déclencher un sentiment de légitimité et d'excitation.

TON & STYLE
- Ton rassurant, professionnel, humain
- Jamais vendeur agressif
- Jamais générique
- Toujours spécifique à la passion et à la cible
- Tutoiement obligatoire
- Adresse-toi à l'utilisateur par son prénom
- Texte fluide, pas de formatage Markdown (pas d'astérisques, pas de listes, pas de gras)
- Paragraphes courts et aérés (3 sections distinctes séparées par des sauts de ligne)
- Ajoute 2-3 émojis pertinents pour dynamiser le texte (🎯, 💡, 🚀, 📈, ✨, 💰, etc.)

TEXTE TRANSFORMATIONNEL PRINCIPAL (OBLIGATOIRE)
Rédige un texte fluide et humain qui :
- Explique pourquoi des personnes cherchent activement à résoudre ce problème
- Décrit les frustrations, blocages et douleurs réelles de la cible
- Montre que la compétence de l'utilisateur répond à un besoin existant
- Relie la passion à une transformation concrète

Ce texte doit donner l'impression d'une analyse de consultant, pas d'un texte marketing.

VALIDATION MARCHÉ – DONNÉES CONTEXTUELLES
Présente une validation marché basée sur :
- La taille globale du marché lié à la niche (ordre de grandeur)
- La croissance actuelle ou émergente du secteur
- La demande en ligne (recherches, tendances, intérêt croissant)
- L'évolution des comportements des utilisateurs

Tu peux t'inspirer de sources comme :
Statista, Google Trends, rapports sectoriels, études consommateurs (sans citer de lien précis).

RÈGLES DE CONTENU (OBLIGATOIRES)
1) Commence par une introduction positive et personnalisée avec le prénom
2) Inclure AU MOINS 2-3 statistiques chiffrées pertinentes liées à la niche EXACTE
3) Décrire les frustrations, blocages et douleurs réelles de la cible
4) Identifier pourquoi des personnes cherchent activement cette solution
5) Expliquer pourquoi ce marché peut être monétisé
6) Conclure en préparant psychologiquement l'utilisateur : "Ok, c'est réel. Il y a des gens qui attendent exactement ça."

INTERDICTIONS ABSOLUES
- Ne JAMAIS répéter mot pour mot une étape précédente
- Ne JAMAIS être générique ou vague
- Ne JAMAIS utiliser un ton marketing agressif

FORMAT DE SORTIE
- Texte brut uniquement
- EXACTEMENT 3 sections distinctes séparées par "\n\n" (double saut de ligne)
- Chaque section : 2-3 phrases maximum
- Intègre 2-3 émojis pertinents dans le texte pour le rendre vivant
- Pas de titres ni de sous-titres`;

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
    const gender = user.gender || onboardingFull.gender || '';
    // 🔥 P2: Fallback session.skill prioritaire
    const skill = session.skill || onboardingSummary.who_to_teach || onboardingFull.coreSkill || onboardingFull.skill || 'cette compétence';
    const mainProductTitle = finalizedOffer.mainProduct?.title || 'ton produit principal';
    // 🔥 P2: Protection anti-payload énorme
    const mainProductDescription = (finalizedOffer.mainProduct?.description || '').slice(0, 600);
    const upsell1Title = finalizedOffer.upsell1?.title || '';
    const premiumTitle = finalizedOffer.upsell3?.title || '';

    // Déterminer les accords grammaticaux selon le genre
    let genderAgreement = '';
    if (gender === 'Femme') {
      genderAgreement = 'IMPORTANT: L\'utilisateur est une femme. Utilise les accords féminins (elle, alignée, motivée, prête, etc.) dans tout le texte.';
    } else if (gender === 'Homme') {
      genderAgreement = 'IMPORTANT: L\'utilisateur est un homme. Utilise les accords masculins (il, aligné, motivé, prêt, etc.) dans tout le texte.';
    } else {
      genderAgreement = 'IMPORTANT: Genre non spécifié. Utilise "il/elle" ou reformule pour éviter les accords de genre quand possible.';
    }

    const userPrompt = `${genderAgreement}

L'utilisateur, ${name}, veut lancer une offre pour ENSEIGNER sa compétence : "${skill}".

Voici les produits qu'il a sélectionnés :
Produit Principal : "${mainProductTitle}" (${mainProductDescription})
Upsell : "${upsell1Title}"
Offre Premium : "${premiumTitle}"

Ta tâche : Rédige une analyse courte, aérée et encourageante en EXACTEMENT 3 sections distinctes séparées par un double saut de ligne (\n\n).
Rappelle-toi : 2 statistiques minimum, 1-2 douleurs, 1 audience cible spécifique, une conclusion motivante, et 2-3 émojis bien placés pour dynamiser le texte (🎯, 💡, 🚀, 📈, ✨, 💰, etc.).`;

    console.log('OPENAI_CALL start', { 
      fn: 'generateMarketValidation',
      sessionId,
      model: 'gpt-4o'
    });

    // 🔥 P1: Retry avec validation format
    let marketValidation = null;
    let attempt = 0;
    const maxRetries = 2;

    while (attempt <= maxRetries && !marketValidation) {
      attempt++;
      
      console.log(`🔄 [generateMarketValidation] Tentative ${attempt}/${maxRetries + 1}`);

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
      });

      console.log('OPENAI_CALL end', {
        fn: 'generateMarketValidation',
        sessionId,
        attempt,
        usage: completion.usage
      });

      const generatedText = completion.choices[0].message.content.trim();

      // 🔥 VALIDATION GUARDRAILS
      const sections = generatedText.split('\n\n');
      const numberCount = (generatedText.match(/\d+/g) || []).length;
      const isLongEnough = generatedText.length > 350;

      const isValid = sections.length === 3 && numberCount >= 2 && isLongEnough;

      if (isValid) {
        marketValidation = generatedText;
        console.log('✅ [generateMarketValidation] Validation réussie:', {
          sections: sections.length,
          numbers: numberCount,
          length: generatedText.length
        });
      } else {
        console.warn('⚠️ [generateMarketValidation] Format invalide:', {
          sections: sections.length,
          numbers: numberCount,
          length: generatedText.length,
          attempt
        });

        // Dernier essai échoué ? Fallback safe
        if (attempt > maxRetries) {
          console.error('❌ [generateMarketValidation] Max retries atteint, fallback');
          marketValidation = `${name}, ton projet dans "${skill}" répond à un vrai besoin. 🎯

Le marché de la formation en ligne connaît une croissance de +25% par an, et des milliers de personnes cherchent chaque mois des solutions pour progresser dans ce domaine. 📈

Ta proposition arrive au bon moment : les personnes que tu veux aider sont prêtes à investir dans leur apprentissage. 💡`;
        }
      }
    }

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