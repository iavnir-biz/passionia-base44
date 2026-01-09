import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const MESSAGE_PROMPTS = {
    diagnostic: {
        title: "Le Diagnostic",
        objective: "Ouvrir la conversation sans vendre",
        tone: "Curiosité professionnelle"
    },
    empathy: {
        title: "L'Empathie",
        objective: "Créer un lien humain et de confiance",
        tone: "Chaleureux, vécu réel"
    },
    solution: {
        title: "La Solution",
        objective: "Introduire le produit comme une évidence",
        tone: "Calme, sûr, sans push"
    },
    purchase: {
        title: "L'Achat",
        objective: "Transformer l'échange en opportunité concrète",
        tone: "Clair, assumé, simple"
    }
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { messageType, sessionId } = await req.json();

        if (!messageType || !MESSAGE_PROMPTS[messageType]) {
            return Response.json({ error: 'Invalid message type' }, { status: 400 });
        }

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
        if (session.generated_sales_messages?.[messageType]) {
            return Response.json({
                ...session.generated_sales_messages[messageType],
                fromCache: true
            });
        }

        const promptConfig = MESSAGE_PROMPTS[messageType];
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
        const systemMessage = `TU ES UN EXPERT EN COPYWRITING CONVERSATIONNEL POUR CRÉATEURS QUI VENDENT LEUR SAVOIR.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 CONTEXTE PRODUIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tu écris des messages utilisés en DM, email ou vocal pour vendre un PRODUIT LOW TICKET.
Ce n'est PAS du marketing agressif. Ce sont de vraies conversations humaines.

Inspiration : webinaires de vente, messages Instagram/LinkedIn, ton naturel, oral, fluide.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 MESSAGE ${messageType.toUpperCase()} — ${promptConfig.title}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Objectif : ${promptConfig.objective}
Ton : ${promptConfig.tone}

${messageType === 'diagnostic' ? `
- Question intelligente
- Curiosité sincère
- Aucune mention d'offre
- Fait parler la personne
- Longueur : 120-180 mots
` : ''}${messageType === 'empathy' ? `
- Validation de la douleur
- "Je comprends"
- Vécu personnel ou accompagnement client
- Ton humain, calme
- Longueur : 120-180 mots
` : ''}${messageType === 'solution' ? `
- Pivot doux vers la solution
- Présentation courte du produit LOW TICKET
- Positionné comme un "coup de main"
- Pas de pitch agressif
- Longueur : 150-220 mots
` : ''}${messageType === 'purchase' ? `
- Offre claire avec prix exact
- Cadre simple (beta / test / accès limité)
- Garantie ou réassurance
- Question finale ouverte
- Longueur : 150-220 mots
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 INTERDICTIONS ABSOLUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Ne jamais inventer une nouvelle offre
- Ne jamais changer le prix
- Ne jamais changer la promesse
- Ne jamais utiliser de jargon marketing
- Ne jamais survendre
- Pas de CTA agressif
- Pas de pression
- Pas de storytelling émotionnel forcé

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 RÈGLES DE FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Tutoiement strict
- Langue : Français
- Pas de markdown
- Pas de titres visibles
- Pas de signature
- Ton calme, posé, sûr
- Texte brut, paragraphes aérés
- Message prêt à être envoyé tel quel

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 GARDE-FOU PRODUIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ce message doit vendre EXACTEMENT la même chose que la page de vente.
1 offre = 1 discours
1 produit = 1 message
1 promesse = répétée partout

Tu utilises UNIQUEMENT l'offre LOW TICKET validée lors de l'onboarding.
AUCUNE dérive créative autorisée.`;

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
- Obstacles : ${JSON.stringify(onboardingFull.obstacles || [])}`;


        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: userContext }
            ],
            temperature: 0.8,
            max_tokens: 800
        });

        const messageContent = completion.choices[0].message.content;

        const result = {
            messageType: messageType,
            title: promptConfig.title,
            content: messageContent,
            generatedAt: new Date().toISOString()
        };

        // 🔥 Save to Session (merge avec existant)
        const currentMessages = session.generated_sales_messages || {};
        await base44.asServiceRole.entities.Session.update(sessionId, {
            generated_sales_messages: {
                ...currentMessages,
                [messageType]: result
            }
        });

        return Response.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error('Error generating sales message:', error);
        return Response.json(
            { error: error.message || 'Failed to generate message' },
            { status: 500 }
        );
    }
});