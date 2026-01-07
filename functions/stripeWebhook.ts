import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    return Response.json({ error: 'No signature' }, { status: 400 });
  }

  try {
    const body = await req.text();
    const base44 = createClientFromRequest(req);
    
    // Vérifier la signature du webhook
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    console.log('Webhook event:', event.type);

    // Traiter les événements de paiement réussi
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const customerEmail = session.customer_details?.email || session.metadata.user_email;
      const userId = session.metadata.user_id;
      
      if (userId) {
        // Utilisateur existant - mettre à jour
        await base44.asServiceRole.entities.User.update(userId, {
          has_purchased: true,
          purchased_at: new Date().toISOString()
        });
        
        console.log(`Existing user ${userId} marked as purchased`);
      } else if (customerEmail) {
        // Nouvel utilisateur - création automatique
        try {
          const firstName = customerEmail.split('@')[0];
          
          // Créer l'utilisateur
          const newUser = await base44.asServiceRole.entities.User.create({
            email: customerEmail,
            full_name: firstName,
            firstName: firstName,
            has_purchased: true,
            stripe_customer_id: session.customer,
            purchased_at: new Date().toISOString()
          });
          
          // Générer un lien de connexion magique
          const magicLinkResponse = await fetch(`https://api.base44.com/v1/auth/magic-link`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_ROLE_KEY')}`
            },
            body: JSON.stringify({
              email: customerEmail,
              redirectTo: 'https://6930250f9337193d59c1dcf5.base44.app/WelcomeOpening'
            })
          });
          
          const magicLinkData = await magicLinkResponse.json();
          const magicLink = magicLinkData.magicLink;
          
          // Envoyer l'email avec le lien de connexion
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: customerEmail,
            from_name: 'Passion IA',
            subject: '🎉 Ton accès est prêt !',
            body: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #61f7a2, #4de88f); border-radius: 16px; line-height: 80px;">
                    <span style="font-size: 40px; color: white; font-weight: bold;">P</span>
                  </div>
                  <h2 style="margin-top: 15px; color: #1a1a2e;">Passion IA</h2>
                </div>
                
                <h1 style="color: #1a1a2e; font-size: 28px; margin-bottom: 20px;">
                  🎉 Bienvenue ${firstName} !
                </h1>
                
                <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                  Ton paiement a bien été confirmé. Ton espace membre est maintenant prêt avec tous tes documents IA et ton plan d'action personnalisé.
                </p>
                
                <div style="text-align: center; margin: 35px 0;">
                  <a href="${magicLink}" style="display: inline-block; background: #61f7a2; color: #1a1a2e; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 15px rgba(97, 247, 162, 0.3);">
                    Accéder à mon espace
                  </a>
                </div>
                
                <div style="background: #f7fafc; border-left: 4px solid #61f7a2; padding: 20px; margin: 30px 0; border-radius: 8px;">
                  <p style="color: #2d3748; margin: 0; font-size: 14px;">
                    <strong>Ce qui t'attend :</strong><br>
                    ✅ Ton offre complète générée par IA<br>
                    ✅ Ta page de vente personnalisée<br>
                    ✅ Tes 5 emails de vente automatiques<br>
                    ✅ Ton plan d'action 7 et 30 jours<br>
                    ✅ Tous les documents IA personnalisés
                  </p>
                </div>
                
                <p style="color: #718096; font-size: 14px; margin-top: 30px;">
                  À tout de suite dans ton espace !<br>
                  L'équipe Passion IA
                </p>
                
                <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
                  <p style="color: #a0aec0; font-size: 12px;">
                    Si le bouton ne fonctionne pas, copie ce lien dans ton navigateur :<br>
                    <span style="color: #4299e1;">${magicLink}</span>
                  </p>
                </div>
              </div>
            `
          });
          
          console.log(`✅ New user created and magic link sent to ${customerEmail}`);
        } catch (error) {
          console.error('Error creating new user:', error);
        }
      }
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 400 });
  }
});