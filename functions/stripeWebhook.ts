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
      
      // Récupérer l'ID utilisateur depuis les metadata
      const userId = session.metadata.user_id;
      
      if (userId) {
        // Mettre à jour l'utilisateur avec service role
        await base44.asServiceRole.entities.User.update(userId, {
          has_purchased: true,
          purchased_at: new Date().toISOString()
        });
        
        console.log(`User ${userId} marked as purchased`);
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