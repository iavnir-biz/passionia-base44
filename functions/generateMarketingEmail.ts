import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const EMAIL_PROMPTS = {
    contraste: {
        title: "Le Contraste",
        objective: "Faire prendre conscience de l'écart entre aujourd'hui et demain"
    },
    validation: {
        title: "La Validation",
        objective: "Créer la connexion émotionnelle"
    },
    calcul: {
        title: "Le Calcul",
        objective: "Rassurer le cerveau logique"
    },
    impact: {
        title: "L'Impact",
        objective: "Donner du sens à l'action"
    },
    urgence: {
        title: "L'Urgence",
        objective: "Déclencher la décision"
    }
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        console.log('[generateMarketingEmail] body received:', body);

        const sessionId = body.sessionId || body.session?.id || user.sessionId;
        const { generateAll } = body;
        console.log('[generateMarketingEmail] resolved sessionId:', sessionId, 'generateAll:', generateAll);

        if (!sessionId) {
            return Response.json({ error: 'sessionId required' }, { status: 400 });
        }

        // 🔥 P0-5: DB-first
        const sessions = await base44.asServiceRole.entities.Session.filter({ id: sessionId });
        if (!sessions || sessions.length === 0) {
            return Response.json({ error: 'Session not found' }, { status: 404 });
        }

        const session = sessions[0];

        // Check cache
        if (session.generated_marketing_emails && Object.keys(session.generated_marketing_emails).length === 5) {
            return Response.json({
                success: true,
                emails: session.generated_marketing_emails,
                fromCache: true
            });
        }

        // 🔥 EXTRACTION DONNÉES (LOW TICKET UNIQUEMENT)
        const lowTicketOffer = session.my_generated_offers?.low || {};
        const avatars = session.generated_avatars || {};
        const onboardingSummary = session.onboarding_summary || {};
        const onboardingFull = session.onboarding_full || {};

        // Vérification critique
        if (!lowTicketOffer.title) {
            return Response.json({ 
                error: 'Offre LOW TICKET non trouvée. Complète d\'abord la génération des offres.' 
            }, { status: 400 });
        }

        // PROMPT SYSTÈME COMPLET (3 prompts fusionnés)
        const systemMessage = `TU ES UN EXPERT EN EMAIL MARKETING CONVERSATIONNEL ET COPYWRITING HUMAIN.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 MISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Générer une SÉQUENCE DE 5 EMAILS MARKETING destinés à vendre UN SEUL PRODUIT :
→ le PRODUIT LOW TICKET validé par l'utilisateur.

IMPORTANT :
- Ces emails ne vendent PAS une marque
- Ils ne vendent PAS une offre premium
- Ils vendent UN PRODUIT SIMPLE, ACCESSIBLE, D'ENTRÉE DE GAMME

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 STYLE & TON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Tutoiement obligatoire
- Ton humain, simple, direct
- Langage parlé, naturel
- Pas de jargon marketing
- Pas de promesses exagérées
- Pas de storytelling bullshit

FORMAT STRICT :
- TEXTE BRUT (plain text)
- AUCUN Markdown
- Paragraphes courts (2 lignes max)
- Copiable tel quel dans Gmail/Notion/Mailchimp

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 STRUCTURE GLOBALE DE LA SÉQUENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMAIL 1 — LE CONTRASTE
Objectif : Faire prendre conscience de l'écart entre aujourd'hui et demain
- Situation actuelle frustrante
- Ce qui pourrait changer
- Aucune vente directe
- Invitation à réfléchir

EMAIL 2 — LA VALIDATION
Objectif : Créer la connexion émotionnelle
- "Tu n'es pas seul"
- Situation vécue/observée
- Normalisation du problème
- Toujours pas de pression commerciale

EMAIL 3 — LE CALCUL
Objectif : Rassurer le cerveau logique
- Montrer que c'est faisable
- Montrer que ce produit est simple
- Expliquer pourquoi c'est une bonne première étape
- Introduction douce du produit LOW TICKET

EMAIL 4 — L'IMPACT
Objectif : Donner du sens à l'action
- Fierté
- Impact personnel
- Sentiment d'avancer enfin
- Le produit est présenté comme un levier, pas une fin

EMAIL 5 — L'URGENCE
Objectif : Déclencher la décision
- Coût de l'inaction
- Rappel du bénéfice
- Invitation claire à passer à l'action
- CTA simple, sans pression

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 INTERDICTIONS ABSOLUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Ne JAMAIS mentionner offre premium, upsell, coaching, programme avancé
- Ne PAS dire "plus tard"
- Ne PAS vendre autre chose que le produit LOW TICKET
- Ne jamais inventer une nouvelle offre
- Ne jamais changer le prix
- Ne jamais modifier la promesse

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 SORTIE ATTENDUE (JSON)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "contraste": "...",
  "validation": "...",
  "calcul": "...",
  "impact": "...",
  "urgence": "..."
}

Chaque email doit contenir :
- Objet (ligne 1 : "Objet: ...")
- Corps de texte (texte brut, paragraphes courts)
- CTA clair`;

        const userContext = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 DONNÉES PRODUIT (SOURCE DE VÉRITÉ)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OFFRE LOW TICKET (OBLIGATOIRE) :
${JSON.stringify(lowTicketOffer, null, 2)}

AVATARS CLIENTS :
${JSON.stringify(avatars, null, 2)}

ONBOARDING SUMMARY :
${JSON.stringify(onboardingSummary, null, 2)}

ONBOARDING FULL :
- Prénom créateur : ${user.full_name || user.firstName || 'Non renseigné'}
- Compétence : ${session.skill || 'Non renseigné'}
- Problème principal : ${onboardingSummary.main_learning_problem || 'Non renseigné'}
- Transformation : ${onboardingSummary.big_transformation || 'Non renseigné'}
- Coût de l'inaction : ${onboardingFull.if_nothing_changes || 'Non renseigné'}
- Vie future souhaitée : ${onboardingFull.life_change || 'Non renseigné'}
- Obstacles : ${JSON.stringify(onboardingFull.obstacles || [])}`;

        // Générer les 5 emails en une fois
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: userContext }
            ],
            temperature: 0.8,
            response_format: { type: "json_object" }
        });

        const generatedEmails = JSON.parse(completion.choices[0].message.content);

        // 🔥 Save to Session
        await base44.asServiceRole.entities.Session.update(sessionId, {
            generated_marketing_emails: generatedEmails
        });

        return Response.json({
            success: true,
            emails: generatedEmails,
            fromCache: false
        });

    } catch (error) {
        console.error('Error generating marketing email:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});