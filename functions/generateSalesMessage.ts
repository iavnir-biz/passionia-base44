import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Anthropic from 'npm:@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

const MESSAGE_PROMPTS = {
    diagnostic: {
        title: "Le Diagnostic",
        objective: "Ouvrir la conversation sans vendre",
        tone: "Curiosité professionnelle",
        wordCount: "60-80 mots MAX"
    },
    empathy: {
        title: "L'Empathie",
        objective: "Créer un lien humain et de confiance",
        tone: "Chaleureux, vécu réel",
        wordCount: "70-90 mots MAX"
    },
    solution: {
        title: "La Solution",
        objective: "Introduire le produit comme une évidence",
        tone: "Calme, sûr, sans push",
        wordCount: "80-100 mots MAX"
    },
    purchase: {
        title: "L'Achat",
        objective: "Transformer l'échange en opportunité concrète",
        tone: "Clair, assumé, simple",
        wordCount: "90-110 mots MAX"
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
        console.log('[generateSalesMessage] body received:', body);

        const { messageType } = body;
        const sessionId = body.sessionId || body.session?.id || user.sessionId;
        console.log('[generateSalesMessage] resolved sessionId:', sessionId, 'messageType:', messageType);

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
        const finalizedOffer = session.finalized_offer || {};
        const lowTicketOffer = session.my_generated_offers?.low || finalizedOffer.mainProduct || {};
        const avatars = session.generated_avatars || {};
        const onboardingSummary = session.onboarding_summary || {};
        const onboardingFull = session.onboarding_full || {};

        // Vérification critique
        if (!lowTicketOffer.title || !lowTicketOffer.price) {
            return Response.json({ 
                error: 'Offre LOW TICKET incomplète. Complète d\'abord ton onboarding d\'offres.' 
            }, { status: 400 });
        }

        // PROMPT SYSTÈME COMPLET (optimisé pour DM courts)
        const systemMessage = `TU ES UN EXPERT EN COPYWRITING CONVERSATIONNEL POUR CRÉATEURS QUI VENDENT LEUR SAVOIR.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 CONTEXTE PRODUIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tu écris des messages utilisés en DM Instagram/Facebook/LinkedIn pour vendre un PRODUIT LOW TICKET.
Ce n'est PAS du marketing agressif. Ce sont de vraies conversations humaines.

FORMAT CRITIQUE : Messages COURTS optimisés pour mobile et DM.
Les gens scrollent vite. Pas de pavés. Phrases courtes. Paragraphes aérés.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 MESSAGE ${messageType.toUpperCase()} — ${promptConfig.title}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Objectif : ${promptConfig.objective}
Ton : ${promptConfig.tone}
LONGUEUR MAXIMALE : ${promptConfig.wordCount}

${messageType === 'diagnostic' ? `
STRUCTURE (60-80 mots MAX) :
- Salut + prénom
- Question intelligente ET COURTE sur leur situation
- Pourquoi tu leur poses cette question (lien avec ta compétence)
- Question finale ouverte
- Aucune mention d'offre
- Format : 3-4 phrases courtes max
- 2 sauts de ligne maximum
` : ''}${messageType === 'empathy' ? `
STRUCTURE (70-90 mots MAX) :
- "Je comprends [prénom]"
- Validation courte de leur douleur (1 phrase)
- Mini-vécu personnel OU client (1-2 phrases)
- Lien avec ta passion/compétence
- Question finale
- Format : 4-5 phrases courtes max
- 2-3 sauts de ligne maximum
` : ''}${messageType === 'solution' ? `
STRUCTURE (80-100 mots MAX) :
- Transition douce (1 phrase)
- Présentation ULTRA COURTE du produit LOW TICKET (nom + promesse)
- Format + bénéfice clé + timing
- Mini-preuve sociale OU résultat
- Question finale ouverte
- Pas de pitch agressif
- Format : 4-5 phrases courtes max
- 2-3 sauts de ligne maximum
` : ''}${messageType === 'purchase' ? `
STRUCTURE (90-110 mots MAX) :
- "Ok parfait [prénom]"
- Nom produit + prix exact
- Liste à puces COURTE (3 éléments max)
- Garantie OU cadre limité (1 phrase)
- Question finale d'action
- Format : 5-6 phrases courtes max
- 3 sauts de ligne maximum pour liste
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 INTERDICTIONS ABSOLUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- NE JAMAIS dépasser ${promptConfig.wordCount}
- Ne jamais inventer une nouvelle offre
- Ne jamais changer le prix
- Ne jamais changer la promesse
- Ne jamais utiliser de jargon marketing
- Ne jamais survendre
- Pas de CTA agressif
- Pas de pression
- Pas de storytelling émotionnel forcé
- Pas de bloc de texte (phrases courtes obligatoires)
- Maximum 3 sauts de ligne dans tout le message

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 RÈGLES DE FORMAT DM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Tutoiement strict
- Langue : Français
- Pas de markdown
- Pas de titres visibles
- Pas de signature
- Ton calme, posé, sûr
- Phrases COURTES (10-15 mots max par phrase)
- Paragraphes AÉRÉS (1-2 phrases par bloc)
- Message prêt à copier-coller dans Instagram/Facebook
- Optimisé pour lecture mobile rapide

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 GARDE-FOU PRODUIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ce message doit vendre EXACTEMENT la même chose que la page de vente.
1 offre = 1 discours
1 produit = 1 message
1 promesse = répétée partout

Tu utilises UNIQUEMENT l'offre LOW TICKET validée lors de l'onboarding.
AUCUNE dérive créative autorisée.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✂️ RÈGLE DE CONCISION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Si ton message dépasse ${promptConfig.wordCount}, COUPE.
Chaque mot doit avoir un rôle précis.
Supprime tout ce qui n'est pas essentiel.
Phrases courtes > phrases longues.
Direct > détours.`;

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
- Obstacles : ${JSON.stringify(onboardingFull.obstacles || [])}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 RAPPEL CRITIQUE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MESSAGE TYPE : ${messageType}
LONGUEUR MAX : ${promptConfig.wordCount}
FORMAT : DM Instagram/Facebook (mobile-first)

Écris maintenant le message en respectant STRICTEMENT la longueur maximale.`;

        // Appel API Anthropic Claude Sonnet 4
        const completion = await anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 400,
            temperature: 0.8,
            system: systemMessage,
            messages: [
                {
                    role: "user",
                    content: userContext
                }
            ]
        });

        const messageContent = completion.content[0].text;

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