import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const EMAIL_PROMPTS = {
    contraste: {
        title: "Email 1 : Le Contraste (Aujourd'hui vs Demain)",
        subject: "Une décision pour tes {incomeGoal}€ par mois...",
        instruction: "Rappelle la douleur {painPoints}. Compare la situation actuelle avec le rêve {lifeChanges}. Présente le produit {mainProductTitle} comme le pont pour traverser. Ton : Empathique, direct."
    },
    validation: {
        title: "Email 2 : La Validation Sociale (Le Regard des autres)",
        subject: "Ce que tes proches vont enfin dire de toi.",
        instruction: "Utilise la donnée {socialValidation}. Décris la scène où l'expert est enfin reconnu pour son succès. C'est l'email 'Émotionnel'. Lien : Présente l'offre comme le moyen d'obtenir cette reconnaissance."
    },
    calcul: {
        title: "Email 3 : Le Calcul de Faisabilité (La Logique)",
        subject: "Juste 1 vente par jour...",
        instruction: "Décompose mathématiquement comment atteindre {incomeGoal}€ en vendant {mainProductTitle}. Montre que c'est simple et accessible. Ton : Rationnel, rassurant."
    },
    impact: {
        title: "Email 4 : L'Impact et la Fierté (Le Sens)",
        subject: "Imaginer les visages de ceux que tu vas aider.",
        instruction: "Utilise {impact} et {pride}. Parle de la sensation d'être utile. Mentionne l'Offre Premium {premiumTitle} comme l'expérience ultime de transformation. Ton : Inspirant."
    },
    urgence: {
        title: "Email 5 : L'Urgence de l'Inaction (Le Regret)",
        subject: "Où seras-tu dans 6 mois si rien ne change ?",
        instruction: "Rappelle le coût émotionnel de ne pas se lancer. Reprends le rêve {lifeChanges} et montre qu'il s'éloigne si l'action n'est pas prise maintenant."
    }
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { emailType, sessionId } = await req.json();

        if (!emailType) {
            return Response.json({ error: 'emailType required' }, { status: 400 });
        }

        if (!sessionId) {
            return Response.json({ error: 'sessionId required' }, { status: 400 });
        }

        const emailConfig = EMAIL_PROMPTS[emailType];
        if (!emailConfig) {
            return Response.json({ 
                error: 'Invalid email type' 
            }, { status: 400 });
        }

        // 🔥 P0-5: DB-first
        const sessions = await base44.asServiceRole.entities.Session.filter({ id: sessionId });
        if (!sessions || sessions.length === 0) {
            return Response.json({ error: 'Session not found' }, { status: 404 });
        }

        const session = sessions[0];

        // Check cache
        if (session.generated_marketing_emails?.[emailType]) {
            return Response.json({
                ...session.generated_marketing_emails[emailType],
                fromCache: true
            });
        }

        const finalizedOffer = session.finalized_offer || {};
        const onboardingSummary = session.onboarding_summary || {};
        const onboardingFull = session.onboarding_full || {};

        // Extraire les données pour personnalisation
        const skill = session.skill || onboardingSummary.who_to_teach || 'ta compétence';
        const name = user.full_name || 'l\'expert';
        const incomeGoal = onboardingFull.target_income || onboardingFull.targetIncome || 5000;
        const lifeChanges = onboardingFull.life_change || 'vivre de ta passion';
        const impact = onboardingFull.impact || 'aider les autres';
        const pride = onboardingFull.emotions || 'fierté';
        const socialValidation = onboardingFull.relatives || 'reconnaissance de tes proches';
        const painPoints = onboardingSummary.main_learning_problem || 'tes blocages actuels';
        
        const mainProductTitle = finalizedOffer.mainProduct?.title || 'ton produit';
        const mainProductPrice = finalizedOffer.mainProduct?.price || '97€';
        const premiumTitle = finalizedOffer.upsell3?.title || 'ton offre premium';
        const premiumPrice = finalizedOffer.upsell3?.price || '997€';

        // Construire le contexte utilisateur
        const userContext = `
DONNÉES À UTILISER POUR PERSONNALISATION :
- Savoir-faire : ${skill}
- Prénom de l'expert : ${name}
- Objectif de revenu : ${incomeGoal}€
- Ce que l'argent va changer (Rêve) : ${lifeChanges}
- Impact désiré : ${impact}
- Fierté ressentie : ${pride}
- Validation des proches attendue : ${socialValidation}
- Frein principal actuel (Douleur) : ${painPoints}
- Nom du Produit Principal : ${mainProductTitle} (Prix : ${mainProductPrice}€)
- Nom de l'Offre Premium : ${premiumTitle} (Prix : ${premiumPrice}€)
`;

        // Générer l'email avec OpenAI - Méthode PASSION IA
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `Tu es un expert en Copywriting Émotionnel et en Storytelling de Transformation. Ta mission est de rédiger un email de séquence marketing pour un expert qui vend son savoir-faire.

${emailConfig.title}

Sujet suggéré : ${emailConfig.subject}

Angle et ton : ${emailConfig.instruction}

RÈGLES DE STYLE STRICTES :
- Utilise exclusivement le 'Tu'
- Paragraphes courts (2 lignes max)
- Langage "Terre-à-terre", pas de jargon marketing
- Intègre les variables naturellement dans le texte
- Émojis utilisés avec parcimonie
- Entre 200 et 400 mots maximum

Structure de l'email :
- Objet : ${emailConfig.subject} (commence par "📧 Objet: ")
- Corps de l'email avec storytelling émotionnel
- Call-to-action clair et motivant
- Signature personnalisée

Remplace les variables entre accolades par les données réelles du client fournies ci-dessous.`
                },
                {
                    role: "user",
                    content: userContext
                }
            ],
            temperature: 0.8,
        });

        const emailContent = completion.choices[0].message.content;

        const result = {
            success: true,
            email: emailContent,
            type: emailType,
            title: emailConfig.title,
            generatedAt: new Date().toISOString()
        };

        // 🔥 Save to Session (merge avec existant)
        const currentEmails = session.generated_marketing_emails || {};
        await base44.asServiceRole.entities.Session.update(sessionId, {
            generated_marketing_emails: {
                ...currentEmails,
                [emailType]: result
            }
        });

        return Response.json({
            ...result,
            fromCache: false
        });

    } catch (error) {
        console.error('Error generating marketing email:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});