import { createClient } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

// Créer le client base44 avec la clé de service (pas depuis la requête)
const base44 = createClient({
  appId: Deno.env.get('BASE44_APP_ID'),
  serviceRoleKey: Deno.env.get('BASE44_SERVICE_ROLE_KEY')
});

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    console.error('No Stripe signature');
    return Response.json({ error: 'No signature' }, { status: 400 });
  }

  try {
    const body = await req.text();

    // Vérifier la signature du webhook
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    console.log('=== Webhook event received ===');
    console.log('Event type:', event.type);

    // Traiter les evenements de paiement reussi
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const customerEmail = session.customer_details?.email || session.metadata?.user_email;
      const userId = session.metadata?.user_id;
      const hasOrderBump = session.metadata?.has_order_bump === 'true';
      const hasPremiumBump = session.metadata?.has_premium_bump === 'true';
      const paymentType = session.metadata?.type;

      console.log('Session metadata:', { userId, customerEmail, hasOrderBump, paymentType });

      // --- TRAITEMENT ORDER BUMP (37€) ---
      if (paymentType === 'order_bump') {
        console.log('Processing order bump payment');

        if (userId) {
          try {
            await base44.entities.User.update(userId, {
              has_purchased_order_bump: true,
              order_bump_purchased_at: new Date().toISOString()
            });

            console.log(`Order bump payment processed for user ${userId}`);
          } catch (error) {
            console.error('Error processing order bump:', error);
          }
        }

        return Response.json({ received: true });
      }

      // --- TRAITEMENT UPSELL COACHING (497€) ---
      if (paymentType === 'upsell_coaching') {
        console.log('Processing upsell coaching payment');

        if (userId) {
          try {
            // Mettre a jour l'utilisateur avec le flag coaching ET upsell
            await base44.entities.User.update(userId, {
              has_coaching: true,
              has_purchased_upsell: true,
              coaching_purchased_at: new Date().toISOString()
            });

            // Mettre a jour la Session si on a un session_id
            const userSessionId = session.metadata?.session_id;
            if (userSessionId) {
              await base44.entities.Session.update(userSessionId, {
                has_seen_upsell: true,
                upsell_accepted: true,
                has_coaching: true,
                coaching_purchased_at: new Date().toISOString()
              });
            } else {
              // Trouver la session par email de l'utilisateur
              const users = await base44.entities.User.filter({ id: userId });
              if (users.length > 0) {
                const userEmail = users[0].email;
                const sessions = await base44.entities.Session.filter({ created_by: userEmail });
                if (sessions.length > 0) {
                  await base44.entities.Session.update(sessions[0].id, {
                    has_seen_upsell: true,
                    upsell_accepted: true,
                    has_coaching: true,
                    coaching_purchased_at: new Date().toISOString()
                  });
                }
              }
            }

            console.log(`Upsell coaching payment processed for user ${userId}`);
          } catch (error) {
            console.error('Error processing upsell coaching:', error);
          }
        }

        return Response.json({ received: true });
      }

      // --- TRAITEMENT DOWNSELL COACHING (197€) ---
      if (paymentType === 'downsell_coaching') {
        console.log('Processing downsell coaching payment');

        if (userId) {
          try {
            // Mettre a jour l'utilisateur avec le flag coaching ET downsell
            await base44.entities.User.update(userId, {
              has_coaching: true,
              has_purchased_downsell: true,
              coaching_purchased_at: new Date().toISOString()
            });

            // Mettre a jour la Session si on a un session_id
            const userSessionId = session.metadata?.session_id;
            if (userSessionId) {
              await base44.entities.Session.update(userSessionId, {
                has_seen_upsell: true,
                has_coaching: true,
                coaching_purchased_at: new Date().toISOString()
              });
            } else {
              // Trouver la session par email de l'utilisateur
              const users = await base44.entities.User.filter({ id: userId });
              if (users.length > 0) {
                const userEmail = users[0].email;
                const sessions = await base44.entities.Session.filter({ created_by: userEmail });
                if (sessions.length > 0) {
                  await base44.entities.Session.update(sessions[0].id, {
                    has_seen_upsell: true,
                    has_coaching: true,
                    coaching_purchased_at: new Date().toISOString()
                  });
                }
              }
            }

            console.log(`Downsell coaching payment processed for user ${userId}`);
          } catch (error) {
            console.error('Error processing downsell coaching:', error);
          }
        }

        return Response.json({ received: true });
      }

      // --- TRAITEMENT ACHAT INITIAL (existant) ---

      if (userId) {
        // Utilisateur existant - mettre à jour
        console.log('Updating existing user:', userId);
        const users = await base44.entities.User.filter({ id: userId });
        const user = users[0];

        if (!user) {
          console.error('User not found:', userId);
          return Response.json({ error: 'User not found' }, { status: 404 });
        }

        // Achat du pack principal
        await base44.entities.User.update(userId, {
          has_purchased: true,
          has_order_bump: hasOrderBump,
          has_premium_bump: hasPremiumBump,
          purchased_at: new Date().toISOString()
        });

        console.log('Main pack purchased:', { userId, hasOrderBump, hasPremiumBump });

        // 📧 Envoyer l'email de bienvenue avec magic link
        const APP_URL = Deno.env.get('APP_URL') || 'https://6930250f9337193d59c1dcf5.base44.app';
          const magicLinkResponse = await fetch(`https://api.base44.com/v1/auth/magic-link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({
            email: user.email,
            redirectTo: `${APP_URL}/ThankYou`
            })
            });

            const magicLinkData = await magicLinkResponse.json();
            const magicLink = magicLinkData.magicLink;

            await base44.integrations.Core.SendEmail({
            to: user.email,
            from_name: 'Noah by Iavnir',
            subject: '🎉 Paiement confirmé - Ton accès est activé',
            body: `
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 32px;">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6930250f9337193d59c1dcf5/9089019f0_Sanstitre500x500px1.png" alt="Noah" style="width: 48px; height: 48px; object-fit: contain;" />
            </div>

            <h1 style="color: #1a1a1a; font-size: 28px; font-weight: 800; margin-bottom: 12px; text-align: center; letter-spacing: -0.02em;">
              Bravo ${user.full_name || user.firstName || user.email.split('@')[0]} 🎉
            </h1>

            <p style="color: #888; font-size: 16px; line-height: 1.6; margin-bottom: 32px; text-align: center;">
              Ton paiement est confirmé et ton accès est <strong style="color: #1a1a1a;">activé</strong>. Noah est prêt à créer ton business sur-mesure.
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${magicLink}" style="display: inline-block; background: #1a1a1a; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 100px; font-weight: 600; font-size: 16px;">
                Accéder à mon espace →
              </a>
            </div>

            <div style="background: #fafafa; border: 1px solid #f0f0f0; padding: 24px; margin: 32px 0; border-radius: 16px;">
              <p style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                📦 Ce qui t'attend
              </p>
              <ul style="color: #555; margin: 0; padding-left: 20px; font-size: 14px; line-height: 2;">
                <li>Analyse de marché complète</li>
                <li>4 Offres sur-mesure avec prix</li>
                <li>Messages de vente prêts à l'emploi</li>
                <li>Séquence d'emails marketing</li>
                <li>Plan d'action personnalisé</li>
              </ul>
            </div>

            <p style="color: #ccc; font-size: 13px; margin-top: 40px; text-align: center; line-height: 1.6;">
              À tout de suite ! — L'équipe Noah by Iavnir
            </p>

            <div style="border-top: 1px solid #f0f0f0; margin-top: 24px; padding-top: 16px; text-align: center;">
              <p style="color: #ccc; font-size: 11px;">
                Si le bouton ne fonctionne pas :<br>
                <span style="color: #999; word-break: break-all;">${magicLink}</span>
              </p>
            </div>
            </div>
            `
            });

        console.log(`✅ Existing user ${userId} marked as purchased + email sent`);
      } else if (customerEmail) {
        // Nouvel utilisateur - création automatique
        try {
          const firstName = customerEmail.split('@')[0];

          // Créer l'utilisateur
          const newUser = await base44.entities.User.create({
            email: customerEmail,
            full_name: firstName,
            firstName: firstName,
            has_purchased: true,
            has_order_bump: hasOrderBump,
            has_premium_bump: hasPremiumBump,
            stripe_customer_id: session.customer,
            purchased_at: new Date().toISOString()
          });

          console.log('New user created:', { email: customerEmail, hasOrderBump, hasPremiumBump });

          // Générer un lien de connexion magique
          const APP_URL = Deno.env.get('APP_URL') || 'https://6930250f9337193d59c1dcf5.base44.app';
          const magicLinkResponse = await fetch(`https://api.base44.com/v1/auth/magic-link`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_ROLE_KEY')}`
            },
            body: JSON.stringify({
              email: customerEmail,
              redirectTo: `${APP_URL}/ThankYou`
            })
          });

          const magicLinkData = await magicLinkResponse.json();
          const magicLink = magicLinkData.magicLink;

          await base44.integrations.Core.SendEmail({
            to: customerEmail,
            from_name: 'Noah by Iavnir',
            subject: '🎉 Paiement confirmé - Ton accès est activé',
            body: `
              <div style="font-family: 'Inter', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; background: #ffffff;">
                <div style="text-align: center; margin-bottom: 32px;">
                  <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6930250f9337193d59c1dcf5/9089019f0_Sanstitre500x500px1.png" alt="Noah" style="width: 48px; height: 48px; object-fit: contain;" />
                </div>
                
                <h1 style="color: #1a1a1a; font-size: 28px; font-weight: 800; margin-bottom: 12px; text-align: center; letter-spacing: -0.02em;">
                  Bravo ${firstName} 🎉
                </h1>
                
                <p style="color: #888; font-size: 16px; line-height: 1.6; margin-bottom: 32px; text-align: center;">
                  Ton paiement est confirmé et ton accès est <strong style="color: #1a1a1a;">activé</strong>. Noah est prêt à créer ton business sur-mesure.
                </p>
                
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${magicLink}" style="display: inline-block; background: #1a1a1a; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 100px; font-weight: 600; font-size: 16px;">
                    Accéder à mon espace →
                  </a>
                </div>
                
                <div style="background: #fafafa; border: 1px solid #f0f0f0; padding: 24px; margin: 32px 0; border-radius: 16px;">
                  <p style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                    📦 Ce qui t'attend
                  </p>
                  <ul style="color: #555; margin: 0; padding-left: 20px; font-size: 14px; line-height: 2;">
                    <li>Analyse de marché complète</li>
                    <li>4 Offres sur-mesure avec prix</li>
                    <li>Messages de vente prêts à l'emploi</li>
                    <li>Séquence d'emails marketing</li>
                    <li>Plan d'action personnalisé</li>
                  </ul>
                </div>
                
                <p style="color: #ccc; font-size: 13px; margin-top: 40px; text-align: center; line-height: 1.6;">
                  À tout de suite ! — L'équipe Noah by Iavnir
                </p>
                
                <div style="border-top: 1px solid #f0f0f0; margin-top: 24px; padding-top: 16px; text-align: center;">
                  <p style="color: #ccc; font-size: 11px;">
                    Si le bouton ne fonctionne pas :<br>
                    <span style="color: #999; word-break: break-all;">${magicLink}</span>
                  </p>
                </div>
              </div>
            `
          });

          console.log(`✅ New user created and email sent to ${customerEmail}`);
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