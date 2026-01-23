import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Fonction d'urgence pour débloquer manuellement un client qui a payé
 * mais dont le webhook a échoué
 *
 * Usage: Appeler avec { email: "email@client.com" }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email } = await req.json();

    if (!email) {
      return Response.json({
        error: 'Email requis',
        usage: 'Envoie { "email": "client@example.com" }'
      }, { status: 400 });
    }

    // Trouver l'utilisateur
    const users = await base44.asServiceRole.entities.User.filter({ email });

    if (users.length === 0) {
      return Response.json({
        error: 'Utilisateur non trouvé',
        email
      }, { status: 404 });
    }

    const user = users[0];

    // Mettre à jour has_purchased
    await base44.asServiceRole.entities.User.update(user.id, {
      has_purchased: true,
      purchased_at: new Date().toISOString()
    });

    // Envoyer l'email de bienvenue avec magic link
    const APP_URL = Deno.env.get('APP_URL') || 'https://6930250f9337193d59c1dcf5.base44.app';

    const magicLinkResponse = await fetch(`https://api.base44.com/v1/auth/magic-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        email: user.email,
        redirectTo: `${APP_URL}/WelcomeOpening`
      })
    });

    const magicLinkData = await magicLinkResponse.json();
    const magicLink = magicLinkData.magicLink;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: user.email,
      from_name: 'Passion IA',
      subject: '🎉 Paiement confirmé - Ton accès est activé',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #61f7a2, #4de88f); border-radius: 16px; line-height: 80px;">
              <span style="font-size: 40px; color: white; font-weight: bold;">P</span>
            </div>
            <h2 style="margin-top: 15px; color: #1a1a2e; font-size: 18px;">Passion IA</h2>
          </div>

          <h1 style="color: #1a1a2e; font-size: 28px; margin-bottom: 20px; text-align: center;">
            🎉 Bravo ${user.full_name || user.firstName || user.email.split('@')[0]} !
          </h1>

          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
            Ton paiement a bien été confirmé et ton accès est maintenant <strong>activé</strong>.
          </p>

          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Utilise le bouton ci-dessous pour accéder à ton espace et commencer à générer tes documents personnalisés.
          </p>

          <div style="text-align: center; margin: 35px 0;">
            <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #61f7a2, #4de88f); color: #1a1a2e; padding: 18px 45px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 20px rgba(97, 247, 162, 0.4);">
              Accéder à mon espace
            </a>
          </div>

          <p style="color: #718096; font-size: 14px; margin-top: 35px; text-align: center;">
            À tout de suite ! 🚀<br>
            <strong>L'équipe Passion IA</strong>
          </p>

          <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
            <p style="color: #a0aec0; font-size: 12px;">
              Lien de connexion :<br>
              <span style="color: #4299e1; word-break: break-all;">${magicLink}</span>
            </p>
          </div>
        </div>
      `
    });

    return Response.json({
      success: true,
      message: 'Utilisateur débloqué et email envoyé',
      user: {
        id: user.id,
        email: user.email,
        has_purchased: true,
        purchased_at: new Date().toISOString()
      },
      magicLink
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({
      error: error.message
    }, { status: 500 });
  }
});
