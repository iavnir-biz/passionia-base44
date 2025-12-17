import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Vérifier que l'utilisateur est authentifié
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier qu'il n'a pas déjà acheté
    if (user.has_purchased) {
      return Response.json({ error: 'Already purchased' }, { status: 400 });
    }

    // Récupérer l'URL de l'app depuis les headers
    const origin = req.headers.get('origin') || 'https://your-app.base44.com';

    // Créer ou récupérer le client Stripe
    let customerId = user.stripe_customer_id;
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
      
      // Sauvegarder l'ID client Stripe
      await base44.auth.updateMe({ stripe_customer_id: customerId });
    }

    // Créer la session de paiement
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
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
            unit_amount: 6700, // 67€ en centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}?payment=success`,
      cancel_url: `${origin}?payment=cancelled`,
      metadata: {
        user_id: user.id,
        user_email: user.email
      }
    });

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