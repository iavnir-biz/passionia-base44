import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Recuperer les parametres du body
    const { sessionId, downsellPrice = 19700, type = 'session_declic' } = await req.json().catch(() => ({
      sessionId: null,
      downsellPrice: 19700,
      type: 'session_declic'
    }));

    console.log('=== createCheckoutDownsell called ===');
    console.log('sessionId:', sessionId, 'downsellPrice:', downsellPrice, 'type:', type);

    // Recuperer l'utilisateur authentifie
    let user = null;
    let customerId = null;

    try {
      user = await base44.auth.me();

      if (!user) {
        return Response.json({
          error: 'Unauthorized',
          message: 'Vous devez etre connecte pour acceder a cette offre.'
        }, { status: 401 });
      }

      // Recuperer ou creer le client Stripe
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
    } catch (error) {
      console.error('Auth error:', error);
      return Response.json({
        error: 'Authentication required',
        message: 'Veuillez vous connecter pour continuer.'
      }, { status: 401 });
    }

    // Recuperer l'URL de l'app depuis les headers
    const referer = req.headers.get('referer') || '';
    const origin = referer ? new URL(referer).origin : 'https://6930250f9337193d59c1dcf5.base44.app';
    const successUrl = `${origin}/Dashboard?downsell=success`;
    const cancelUrl = `${origin}/DownsellSession`;

    // Creer la session de paiement pour le downsell Session Declic
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Session Declic + 14 jours de support',
              description: '1 session strategique de 45min avec Alfred & Damien, 14 jours de support WhatsApp, et 1 revue de document personnalisee.',
              images: []
            },
            unit_amount: downsellPrice, // 197 EUR = 19700 centimes
          },
          quantity: 1,
        }
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        type: 'downsell_session_declic',
        user_id: user.id,
        user_email: user.email,
        session_id: sessionId || '',
        downsell_price: downsellPrice.toString()
      }
    });

    console.log('Stripe checkout session created:', stripeSession.id);

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
