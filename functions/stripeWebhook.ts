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
      const paymentType = session.metadata?.type;

      console.log('Session metadata:', { userId, customerEmail, hasOrderBump, paymentType });

      // --- TRAITEMENT UPSELL COACHING (497€) ---
      if (paymentType === 'upsell_coaching') {
        console.log('Processing upsell coaching payment');

        if (userId) {
          try {
            // Mettre a jour l'utilisateur avec le flag coaching
            await base44.entities.User.update(userId, {
              has_coaching: true,
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
            // Mettre a jour l'utilisateur avec le flag coaching
            await base44.entities.User.update(userId, {
              has_coaching: true,
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
          purchased_at: new Date().toISOString()
        });

        console.log('Main pack purchased:', { userId, hasOrderBump });

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
            redirectTo: `${APP_URL}/WelcomeOpening`
          })
        });

        const magicLinkData = await magicLinkResponse.json();
        const magicLink = magicLinkData.magicLink;

        await base44.integrations.Core.SendEmail({
          to: user.email,
          from_name: 'Passion IA',
          subject: '🎉 Paiement confirmé - Ton accès est activé',
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #61f7a2, #4de88f); border-radius: 16px; line-height: 80px;">
                  <span style="font-size: 40px; color: white; font-weight: bold;">P</span>
                </div>
                <h2 style="margin-top: 15px; color: #1a1a2e; font-size: 18px;">Passion IA</h2>
              </div>
              
              <!-- Titre Principal -->
              <h1 style="color: #1a1a2e; font-size: 28px; margin-bottom: 20px; text-align: center;">
                🎉 Bravo ${user.full_name || user.firstName || user.email.split('@')[0]} !
              </h1>
              
              <!-- Message Principal -->
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
                Ton paiement a bien été confirmé et ton accès est maintenant <strong>activé</strong>.
              </p>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                Tu es déjà connecté sur ton navigateur ? Parfait ! 🚀<br>
                Tu as fermé la page ? Pas de souci, utilise le bouton ci-dessous pour te connecter à tout moment.
              </p>
              
              <!-- Bouton CTA -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #61f7a2, #4de88f); color: #1a1a2e; padding: 18px 45px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 20px rgba(97, 247, 162, 0.4); transition: all 0.3s;">
                  Accéder à mon espace
                </a>
              </div>
              
              <!-- Ce qui t'attend -->
              <div style="background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border-left: 4px solid #61f7a2; padding: 20px; margin: 30px 0; border-radius: 8px;">
                <p style="color: #1a1a2e; margin: 0 0 12px 0; font-size: 16px; font-weight: bold;">
                  📦 Ce qui t'attend dans ton espace :
                </p>
                <ul style="color: #2d3748; margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.8;">
                  <li><strong>Analyse de marché complète</strong> - SWOT, concurrence, stratégie</li>
                  <li><strong>3 Avatars clients détaillés</strong> - Profils prêts à utiliser</li>
                  <li><strong>4 Offres sur-mesure</strong> - Avec prix et positionnement</li>
                  <li><strong>Messages de vente</strong> - 8 messages pour DM/emails</li>
                  <li><strong>5 Emails marketing</strong> - Séquence complète prête à envoyer</li>
                  <li><strong>Plan d'action personnalisé</strong> - Étapes concrètes pour lancer</li>
                </ul>
              </div>
              
              <!-- Note importante -->
              <div style="background: #fff9e6; border-left: 4px solid #fbbf24; padding: 16px; margin: 25px 0; border-radius: 8px;">
                <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
                  💡 <strong>Bon à savoir :</strong> Noah va générer tous tes documents personnalisés dès ta première connexion. Ça prend environ 1-2 minutes. Tu verras la magie opérer en temps réel !
                </p>
              </div>
              
              <!-- Connexion future -->
              <div style="background: #f7fafc; padding: 20px; margin: 25px 0; border-radius: 8px; border: 1px solid #e2e8f0;">
                <p style="color: #2d3748; margin: 0 0 10px 0; font-size: 15px; font-weight: bold;">
                  🔐 Pour te reconnecter plus tard :
                </p>
                <p style="color: #4a5568; margin: 0; font-size: 14px; line-height: 1.6;">
                  Conserve cet email et utilise le bouton ci-dessus pour accéder à ton espace à tout moment. Le lien reste valide et tu peux te connecter sans mot de passe.
                </p>
              </div>
              
              <!-- Footer -->
              <p style="color: #718096; font-size: 14px; margin-top: 35px; text-align: center;">
                À tout de suite dans ton espace ! 🚀<br>
                <strong>L'équipe Passion IA</strong>
              </p>
              
              <!-- Lien de secours -->
              <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
                <p style="color: #a0aec0; font-size: 12px; line-height: 1.6;">
                  Si le bouton ne fonctionne pas, copie ce lien dans ton navigateur :<br>
                  <span style="color: #4299e1; word-break: break-all;">${magicLink}</span>
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
            stripe_customer_id: session.customer,
            purchased_at: new Date().toISOString()
          });

          console.log('New user created:', { email: customerEmail, hasOrderBump });

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
              redirectTo: `${APP_URL}/WelcomeOpening`
            })
          });

          const magicLinkData = await magicLinkResponse.json();
          const magicLink = magicLinkData.magicLink;

          // Envoyer le même email
          await base44.integrations.Core.SendEmail({
            to: customerEmail,
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
                  🎉 Bravo ${firstName} !
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
                
                <div style="background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border-left: 4px solid #61f7a2; padding: 20px; margin: 30px 0; border-radius: 8px;">
                  <p style="color: #1a1a2e; margin: 0 0 12px 0; font-size: 16px; font-weight: bold;">
                    📦 Ce qui t'attend :
                  </p>
                  <ul style="color: #2d3748; margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.8;">
                    <li>Analyse de marché complète</li>
                    <li>3 Avatars clients détaillés</li>
                    <li>4 Offres sur-mesure avec prix</li>
                    <li>Messages de vente prêts</li>
                    <li>5 Emails marketing</li>
                    <li>Plan d'action personnalisé</li>
                  </ul>
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