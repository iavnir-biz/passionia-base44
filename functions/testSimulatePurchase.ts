import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // ⚠️ Vérifier que c'est un admin
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email required' }, { status: 400 });
    }

    console.log('🧪 [TEST_SIMULATE_PURCHASE] Starting for email:', email);

    // 1️⃣ Trouver l'utilisateur par email
    const users = await base44.asServiceRole.entities.User.filter({ 
      email: email 
    });

    if (!users || users.length === 0) {
      return Response.json({ 
        error: 'User not found',
        email 
      }, { status: 404 });
    }

    const targetUser = users[0];

    // 2️⃣ Mettre à jour has_paid
    await base44.asServiceRole.entities.User.update(targetUser.id, {
      has_paid: true
    });

    console.log('✅ [TEST_SIMULATE_PURCHASE] User updated with has_paid=true');

    // 3️⃣ Envoyer l'email de bienvenue avec magic link
    const magicLink = `${Deno.env.get('APP_URL')}/WelcomeOpening`;
    
    const emailBody = `
Félicitations ${targetUser.firstName || ''} ! 🎉

Bienvenue dans Passion IA.

Ton espace personnel est maintenant accessible ici :
👉 ${magicLink}

Ce lien te connecte automatiquement à ton espace sécurisé.

Tu vas pouvoir accéder à :
✅ Ton plan d'action personnalisé
✅ Tes offres détaillées
✅ Tes documents de vente
✅ Ta stratégie complète

À tout de suite,
L'équipe Passion IA

---
⚠️ Ceci est un email de test (simulation de paiement)
    `;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: targetUser.email,
      from_name: 'Passion IA',
      subject: '🎉 Bienvenue dans Passion IA (TEST)',
      body: emailBody
    });

    console.log('✅ [TEST_SIMULATE_PURCHASE] Welcome email sent');

    return Response.json({
      success: true,
      message: 'Purchase simulated successfully',
      user: {
        id: targetUser.id,
        email: targetUser.email,
        firstName: targetUser.firstName,
        has_paid: true
      },
      emailSent: true,
      magicLink
    });

  } catch (error) {
    console.error('❌ [TEST_SIMULATE_PURCHASE] Error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});