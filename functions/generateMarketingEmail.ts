import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const EMAIL_PROMPTS = {
    welcome: {
        title: "Email de Bienvenue",
        instruction: "Crée un email de bienvenue chaleureux et engageant pour quelqu'un qui vient de s'inscrire. L'email doit créer un lien émotionnel fort, présenter la valeur qu'ils vont recevoir, et donner envie de passer à l'action."
    },
    nurture: {
        title: "Email de Nurturing",
        instruction: "Crée un email de nurturing qui apporte de la valeur éducative, renforce la relation, et positionne l'expéditeur comme expert. L'email doit être informatif sans être vendeur."
    },
    promo: {
        title: "Email Promotionnel",
        instruction: "Crée un email promotionnel persuasif qui présente l'offre, ses bénéfices, crée l'urgence, et pousse à l'action. Utilise des techniques de copywriting avancées."
    },
    story: {
        title: "Email Storytelling",
        instruction: "Crée un email basé sur le storytelling et le parcours personnel. Raconte une histoire authentique qui crée de l'identification, inspire et connecte émotionnellement avec le lecteur."
    },
    reengagement: {
        title: "Email de Réengagement",
        instruction: "Crée un email de réengagement pour réactiver des abonnés inactifs. L'email doit être empathique, créer la curiosité, et donner une raison forte de revenir."
    }
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { emailType, profile, session } = await req.json();

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

        // Construire le contexte utilisateur
        const userContext = `
**Informations de l'utilisateur:**
- Prénom: ${user.full_name || 'l\'utilisateur'}
- Passion/Compétence: ${profile.passion || 'sa compétence'}
- Public cible: ${profile.target_audience || 'son audience'}
- Problème principal: ${profile.main_problem || 'les défis de son audience'}
- Transformation promise: ${profile.transformation || 'la transformation qu\'il apporte'}

**Contexte de l'offre:**
${session.offer_generation ? `
- Produit Principal: ${session.offer_generation.offerChoices?.product_principal?.title || 'Non défini'}
- Prix: ${session.offer_generation.offerChoices?.product_principal?.price || 'Non défini'}€
` : ''}

**Style de communication souhaité:**
Utilise un ton ${session.onboarding_summary?.format_preferences?.includes('Présentiel') ? 'premium et professionnel' : 'accessible et bienveillant'}.
Tutoie le lecteur et crée une connexion authentique.
`;

        // Générer l'email avec OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `Tu es un expert en email marketing et copywriting. ${emailConfig.instruction}

Structure de l'email:
- Objet captivant (commence par "📧 Objet: ")
- Corps de l'email avec storytelling et émotion
- Call-to-action clair et motivant
- Signature personnalisée

Utilise des émojis avec parcimonie, des paragraphes courts, et un ton conversationnel.
L'email doit faire entre 200 et 400 mots maximum.`
                },
                {
                    role: "user",
                    content: userContext
                }
            ],
            temperature: 0.8,
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