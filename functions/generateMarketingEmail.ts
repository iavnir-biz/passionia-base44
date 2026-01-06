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

        const { emailType, profile, session, tone, customRequest } = await req.json();

        if (!emailType || !profile || !session) {
            return Response.json({ 
                error: 'Missing required fields' 
            }, { status: 400 });
        }

        const emailConfig = EMAIL_PROMPTS[emailType];
        if (!emailConfig) {
            return Response.json({ 
                error: 'Invalid email type' 
            }, { status: 400 });
        }

        // Extraire les données pour personnalisation
        const skill = profile.passion || 'ta compétence';
        const name = user.full_name || 'l\'expert';
        const incomeGoal = session.onboarding_full?.target_income || 5000;
        const lifeChanges = session.onboarding_full?.life_change || 'vivre de ta passion';
        const impact = session.onboarding_full?.impact || 'aider les autres';
        const pride = session.onboarding_full?.emotions || 'fierté';
        const socialValidation = session.onboarding_full?.relatives || 'reconnaissance de tes proches';
        const painPoints = profile.main_problem || 'tes blocages actuels';
        
        const mainProductTitle = session.offer_generation?.offerChoices?.product_principal?.title || 'ton produit';
        const mainProductPrice = session.offer_generation?.offerChoices?.product_principal?.price || 97;
        const premiumTitle = session.offer_generation?.offerChoices?.offre_premium?.title || 'ton offre premium';
        const premiumPrice = session.offer_generation?.offerChoices?.offre_premium?.price || 997;

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

        // Ajustement du ton selon le choix de l'utilisateur
        const toneInstructions = {
            friendly: "Ton chaleureux et amical, comme si tu parlais à un ami proche. Utilise un langage simple et rassurant.",
            professional: "Ton professionnel et expert, tout en restant accessible. Vocabulaire précis mais pas corporate.",
            urgent: "Ton direct avec un sentiment d'urgence authentique (pas manipulateur). Insiste sur le coût de l'inaction.",
            inspiring: "Ton inspirant et motivant. Focus sur la vision et la transformation possible."
        };

        const selectedTone = tone || 'friendly';
        const toneInstruction = toneInstructions[selectedTone] || toneInstructions.friendly;

        // Génération avec personnalisation de ton et requête custom
        const systemPrompt = `Tu es un expert en Copywriting Émotionnel et en Storytelling de Transformation. Ta mission est de rédiger un email de séquence marketing pour un expert qui vend son savoir-faire.

${emailConfig.title}

Sujet suggéré : ${emailConfig.subject}

Angle et ton de base : ${emailConfig.instruction}

TON DEMANDÉ PAR L'UTILISATEUR : ${toneInstruction}

${customRequest ? `\nDEMANDE SPÉCIFIQUE DE L'UTILISATEUR :\n${customRequest}\n` : ''}

RÈGLES DE STYLE STRICTES :
- Utilise exclusivement le 'Tu'
- Paragraphes courts (2 lignes max)
- Langage "Terre-à-terre", pas de jargon marketing
- Intègre les variables naturellement dans le texte
- Émojis utilisés avec parcimonie
- Entre 200 et 400 mots maximum

Structure de l'email :
1. 📧 Objet : [Crée un objet optimisé pour les taux d'ouverture, accrocheur, max 50 caractères]
2. Corps de l'email avec storytelling émotionnel
3. Call-to-action CLAIR et ACTIONNABLE (ex: "Clique ici pour découvrir [Produit]")
4. Signature personnalisée

Optimisations obligatoires :
- L'objet doit créer de la curiosité ou de l'urgence
- Le CTA doit être explicite avec un verbe d'action fort
- Personnalise avec les données fournies

Remplace les variables entre accolades par les données réelles du client fournies ci-dessous.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: userContext
                }
            ],
            temperature: selectedTone === 'professional' ? 0.6 : 0.8,
        });

        const emailContent = completion.choices[0].message.content;

        return Response.json({
            success: true,
            email: emailContent,
            type: emailType,
            title: emailConfig.title
        });

    } catch (error) {
        console.error('Error generating marketing email:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});