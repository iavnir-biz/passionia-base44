import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const MESSAGE_PROMPTS = {
    diagnostic: {
        title: "Le Diagnostic",
        instruction: `Crée un message de vente qui identifie et diagnostique le problème principal du prospect. 
        Le message doit :
        - Commencer par une accroche qui capte l'attention
        - Décrire précisément le problème/la douleur
        - Montrer que tu comprends leur situation
        - Poser des questions qui les font réfléchir
        - Les amener à reconnaître qu'ils ont ce problème
        - Ton empathique mais direct
        - 150-200 mots maximum`
    },
    empathy: {
        title: "L'Empathie",
        instruction: `Crée un message de vente qui crée une connexion émotionnelle forte avec le prospect.
        Le message doit :
        - Montrer que tu as vécu la même chose
        - Partager une histoire personnelle courte et authentique
        - Exprimer de la compréhension profonde
        - Normaliser leurs difficultés
        - Créer un sentiment de "tu n'es pas seul"
        - Ton chaleureux et humain
        - 150-200 mots maximum`
    },
    solution: {
        title: "La Solution",
        instruction: `Crée un message de vente qui présente ta solution de manière irrésistible.
        Le message doit :
        - Introduire ta méthode/approche unique
        - Expliquer comment elle résout le problème
        - Présenter les bénéfices concrets et spécifiques
        - Montrer pourquoi c'est différent des autres solutions
        - Inclure un élément de preuve sociale ou résultat
        - Ton confiant et expert
        - 200-250 mots maximum`
    },
    purchase: {
        title: "L'Achat",
        instruction: `Crée un message de vente qui pousse à l'action d'achat maintenant.
        Le message doit :
        - Rappeler brièvement le problème et la solution
        - Créer l'urgence avec une raison valide
        - Présenter l'offre de manière claire et attractive
        - Anticiper et lever les objections principales
        - Call-to-action fort et direct
        - Bonus ou garantie pour rassurer
        - Ton persuasif et décisif
        - 200-250 mots maximum`
    }
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { messageType, profile, session } = await req.json();

        if (!messageType || !MESSAGE_PROMPTS[messageType]) {
            return Response.json({ error: 'Invalid message type' }, { status: 400 });
        }

        const promptConfig = MESSAGE_PROMPTS[messageType];

        // Construct user context
        const userContext = `
PROFIL UTILISATEUR:
- Prénom: ${user.full_name || 'Non défini'}
- Email: ${user.email}

PROFIL BUSINESS:
${profile ? `
- Passion/Expertise: ${profile.passion || 'Non défini'}
- Audience cible: ${profile.target_audience || 'Non défini'}
- Problème principal: ${profile.main_problem || 'Non défini'}
- Quick win promis: ${profile.quick_win || 'Non défini'}
- Transformation finale: ${profile.transformation || 'Non défini'}
- Méthode unique: ${profile.unique_method || 'Non défini'}
` : 'Profil non renseigné'}

INFORMATIONS ONBOARDING:
${session?.onboarding_summary ? `
- Qui enseigner: ${session.onboarding_summary.who_to_teach || 'Non défini'}
- Profil apprenant: ${session.onboarding_summary.learner_profile || 'Non défini'}
- Problème d'apprentissage: ${session.onboarding_summary.main_learning_problem || 'Non défini'}
- Transformation promise: ${session.onboarding_summary.big_transformation || 'Non défini'}
- Angle de méthode: ${session.onboarding_summary.method_angle || 'Non défini'}
- Erreur commune: ${session.onboarding_summary.common_mistake || 'Non défini'}
- Preuve/Histoire: ${session.onboarding_summary.proof_or_story || 'Non défini'}
` : 'Onboarding non complété'}

OFFRE SÉLECTIONNÉE:
${session?.offer_generation ? `
${JSON.stringify(session.offer_generation, null, 2)}
` : 'Offre non définie'}
        `.trim();

        const systemMessage = `Tu es un expert en copywriting et messages de vente pour produits d'enseignement digitaux.

${promptConfig.instruction}

RÈGLES IMPORTANTES:
- Utilise le tutoiement
- Style conversationnel et naturel
- Pas de formule de politesse finale
- Pas de signature
- Formatage simple (sauts de lignes pour aérer)
- Émojis uniquement si pertinent (max 2-3)
- Message prêt à envoyer tel quel

Génère un message de vente puissant basé sur le contexte utilisateur fourni.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: userContext }
            ],
            temperature: 0.8,
            max_tokens: 800
        });

        const messageContent = completion.choices[0].message.content;

        return Response.json({
            type: messageType,
            title: promptConfig.title,
            content: messageContent,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error generating sales message:', error);
        return Response.json(
            { error: error.message || 'Failed to generate message' },
            { status: 500 }
        );
    }
});