import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const referer = req.headers.get('referer') || '';
    const origin = referer ? new URL(referer).origin : 'https://6930250f9337193d59c1dcf5.base44.app';

    // Try to get authenticated user
    let user = null;
    let customerId = null;

    try {
      user = await base44.auth.me();
      if (user) {
        customerId = user.stripe_customer_id;
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: user.email,
            name: user.firstName || user.full_name,
            metadata: { user_id: user.id, app_user: 'true' }
          });
          customerId = customer.id;
          await base44.auth.updateMe({ stripe_customer_id: customerId });
        }
      }
    } catch (error) {
      console.log('No authenticated user, proceeding as guest');
    }

    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Noah by Iavnir',
            },
            unit_amount: 50,
          },
          quantity: 1,
        }
      ],
      mode: 'payment',
      ui_mode: 'embedded',
      allow_promotion_codes: true,
      return_url: `${origin}/ThankYou`,
      metadata: user ? {
        user_id: user.id,
        user_email: user.email,
      } : {}
    };

    if (customerId) {
      sessionConfig.customer = customerId;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return Response.json({
      success: true,
      clientSecret: session.client_secret,
    });
  } catch (error) {
    console.error('Embedded checkout error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});