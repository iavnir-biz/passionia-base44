import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * 🚨 FONCTION ADMIN UNIQUEMENT 🚨
 * Débloquer manuellement un client qui a payé mais dont le webhook a échoué
 * 
 * ⚠️ CETTE FONCTION DONNE UN ACCÈS PREMIUM COMPLET
 * ⚠️ TOUTES LES ACTIONS SONT LOGGÉES POUR AUDIT
 *
 * Usage: { email: "email@client.com", reason: "webhook stripe failed" }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // 🔒 SÉCURITÉ #1 : VÉRIFICATION ADMIN OBLIGATOIRE (ULTRA-CRITIQUE)
    let user;
    try {
      user = await base44.auth.me();
    } catch (authError) {
      console.warn("🚨 [SECURITY BREACH ATTEMPT] Unauthenticated access to manuallyMarkAsPurchased", {
        timestamp: new Date().toISOString(),
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown'
      });
      
      return Response.json({ 
        error: 'Authentification requise',
        message: 'Cette action nécessite une connexion administrateur'
      }, { status: 401 });
    }

    // 🔒 SÉCURITÉ #2 : VÉRIFICATION RÔLE ADMIN (ULTRA-CRITIQUE)
    // Adapte le champ 'role' selon ta structure UserProfile
    const userProfile = await base44.asServiceRole.entities.UserProfile.filter({ 
      user_id: user.id 
    });
    
    const isAdmin = userProfile && 
                    userProfile.length > 0 && 
                    (userProfile[0].role === 'admin' || userProfile[0].is_admin === true);
    
    if (!isAdmin) {
      console.warn("🚨 [SECURITY BREACH ATTEMPT] Non-admin tried manuallyMarkAsPurchased", {
        userId: user.id,
        userEmail: user.email,
        timestamp: new Date().toISOString(),
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown'
      });
      
      return Response.json({ 
        error: 'Accès refusé',
        message: 'Cette action est réservée aux administrateurs'
      }, { status: 403 });
    }

    // 🔒 SÉCURITÉ #3 : Validation des données entrantes
    const { email, reason } = await req.json();

    if (!email) {
      return Response.json({
        error: 'Email requis',
        usage: 'Envoie { "email": "client@example.com", "reason": "webhook stripe failed" }'
      }, { status: 400 });
    }

    // 🔒 SÉCURITÉ #4 : Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({
        error: 'Format email invalide',
        email
      }, { status: 400 });
    }

    // 🔒 SÉCURITÉ #5 : LOG COMPLET DE L'ACTION (AUDIT TRAIL)
    console.log("🚨 [ADMIN ACTION] manuallyMarkAsPurchased START", {
      adminUserId: user.id,
      adminEmail: user.email,
      targetEmail: email,
      reason: reason || 'Non spécifié',
      timestamp: new Date().toISOString(),
      ip: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown'
    });

    // 🔒 SÉCURITÉ #6 : Trouver l'utilisateur cible
    const users = await base44.asServiceRole.entities.User.filter({ email });

    if (users.length === 0) {
      console.warn("⚠️ [ADMIN ACTION] Target user not found", {
        adminEmail: user.email,
        targetEmail: email
      });
      
      return Response.json({
        error: 'Utilisateur non trouvé',
        email
      }, { status: 404 });
    }

    const targetUser = users[0];

    // 🔒 SÉCURITÉ #7 : Vérifier si l'utilisateur a déjà un accès
    if (targetUser.has_purchased) {
      console.warn("⚠️ [ADMIN ACTION] User already has access", {
        adminEmail: user.email,
        targetEmail: email,
        purchasedAt: targetUser.purchased_at
      });
      
      return Response.json({
        warning: 'Cet utilisateur a déjà un accès premium',
        user: {
          email: targetUser.email,
          has_purchased: true,
          purchased_at: targetUser.purchased_at
        }
      }, { status: 200 });
    }

    // Mettre à jour has_purchased
    await base44.asServiceRole.entities.User.update(targetUser.id, {
      has_purchased: true,
      purchased_at: new Date().toISOString(),
      manually_granted: true,  // Flag pour savoir que c'est un accès manuel
      granted_by: user.id,      // Qui a donné l'accès
      grant_reason: reason || 'Manuel - webhook failed'
    });

    // Envoyer l'email de bienvenue avec magic link
    const APP_URL = Deno.env.get('APP_URL') || 'https://6930250f9337193d59c1dcf5.base44.app';

    // 🔒 SÉCURITÉ #8 : Sanitize email pour magic link
    const sanitizedEmail = email.toLowerCase().trim();

    const magicLinkResponse = await fetch(`https://api.base44.com/v1/auth/magic-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        email: sanitizedEmail,
        redirectTo: `${APP_URL}/WelcomeOpening`
      })
    });

    const magicLinkData = await magicLinkResponse.json();
    const magicLink = magicLinkData.magicLink;

    // 🔒 SÉCURITÉ #9 : Sanitize user data pour email
    const displayName = (targetUser.full_name || targetUser.firstName || sanitizedEmail.split('@')[0])
      .slice(0, 100)  // Limite la taille
      .replace(/[<>]/g, '');  // Anti-injection

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: sanitizedEmail,
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
            🎉 Bravo ${displayName} !
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

    // 🔒 SÉCURITÉ #10 : LOG DE SUCCÈS COMPLET
    console.log("✅ [ADMIN ACTION SUCCESS] User manually granted access", {
      adminUserId: user.id,
      adminEmail: user.email,
      targetUserId: targetUser.id,
      targetEmail: sanitizedEmail,
      reason: reason || 'Non spécifié',
      timestamp: new Date().toISOString(),
      magicLinkSent: true
    });

    return Response.json({
      success: true,
      message: 'Utilisateur débloqué et email envoyé',
      user: {
        id: targetUser.id,
        email: sanitizedEmail,
        has_purchased: true,
        purchased_at: new Date().toISOString(),
        manually_granted: true,
        granted_by: user.email
      },
      magicLink,
      audit: {
        grantedBy: user.email,
        grantedAt: new Date().toISOString(),
        reason: reason || 'Non spécifié'
      }
    });

  } catch (error) {
    console.error('❌ [manuallyMarkAsPurchased] Critical error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return Response.json({
      error: 'Une erreur est survenue',
      message: error.message
    }, { status: 500 });
  }
});