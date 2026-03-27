import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { sessionId, downsellPrice } = await req.json();

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier que l'utilisateur a bien acheté le pack principal
    if (!user.has_purchased) {
      return Response.json({ 
        error: 'Main pack not purchased',
        message: 'Tu dois acheter le pack principal avant d\'accéder au coaching.'
      }, { status: 400 });
    }

    // Créer ou récupérer le client Stripe
    let customerId = user.stripe_customer_id;
    
    // Vérifier si le customer existe vraiment dans Stripe
    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId);
      } catch (error) {
        // Si le customer n'existe plus dans Stripe, on en crée un nouveau
        customerId = null;
      }
    }
    
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

    // Récupérer l'URL de l'app
    const referer = req.headers.get('referer') || '';
    const origin = referer ? new URL(referer).origin : 'https://6930250f9337193d59c1dcf5.base44.app';
    const successUrl = `${origin}/Dashboard?coaching=success`;
    const cancelUrl = `${origin}/DownsellSession`;

    // Créer la session de paiement pour le downsell
    const stripeSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Session Déclic + 14 jours de support',
            description: '1 session stratégique de 45 min + 14 jours de support WhatsApp + 1 revue de document',
            images: []
          },
          unit_amount: downsellPrice || 19700, // 197 EUR
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      phone_number_collection: {
        enabled: true,
      },
      metadata: {
        user_id: user.id,
        user_email: user.email,
        type: 'downsell_coaching',
        session_id: sessionId
      }
    });

    return Response.json({ 
      success: true,
      sessionId: stripeSession.id,
      url: stripeSession.url
    });

  } catch (error) {
    console.error('Checkout downsell error:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});