import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Récupérer l'utilisateur s'il est authentifié
    let user = null;
    let customerId = null;
    
    try {
      user = await base44.auth.me();
      
      // Vérifier qu'il n'a pas déjà acheté (sauf en mode test)
      if (user?.has_purchased && !user?.is_test_mode) {
        return Response.json({ 
          error: 'Already purchased',
          message: 'Vous avez déjà acheté ce pack. Rendez-vous sur votre Dashboard.'
        }, { status: 400 });
      }
      
      // Créer ou récupérer le client Stripe pour utilisateur authentifié
      if (user) {
        customerId = user.stripe_customer_id;
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: user.email,
            name: user.firstName || user.full_name,
            metadata: {
              user_id: user.id,
              app_user: 'true'
            }
          });
          customerId = customer.id;
          await base44.auth.updateMe({ stripe_customer_id: customerId });
        }
      }
    } catch (error) {
      console.log('No authenticated user, proceeding with guest checkout');
    }

    // Récupérer l'URL de l'app depuis les headers
    const referer = req.headers.get('referer') || '';
    const origin = referer ? new URL(referer).origin : 'https://6930250f9337193d59c1dcf5.base44.app';
    const successUrl = `${origin}/WelcomeOpening?payment=success`;
    const cancelUrl = `${origin}/PlanAction`;

    // Créer la session de paiement
    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Pack Clé en Main Passion IA',
              description: 'Accès complet à tous tes documents IA et ton plan d\'action personnalisé',
              images: []
            },
            unit_amount: 6700,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: user ? {
        user_id: user.id,
        user_email: user.email
      } : {}
    };
    
    // Ajouter le customer seulement si on en a un
    if (customerId) {
      sessionConfig.customer = customerId;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return Response.json({ 
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});