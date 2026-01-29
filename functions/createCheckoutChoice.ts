import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { selectedPrice } = await req.json();

    if (!selectedPrice || ![67, 104, 497].includes(selectedPrice)) {
      return Response.json({ error: 'Invalid price' }, { status: 400 });
    }

    // Récupérer l'utilisateur s'il est authentifié
    let user = null;
    let customerId = null;
    
    try {
      user = await base44.auth.me();
      
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
    const cancelUrl = `${origin}/ChooseYourPath`;

    // Définir le produit selon le prix
    let productName, productDescription, unitAmount, packageType;
    
    if (selectedPrice === 67) {
      productName = 'Pack Accélérateur + Membre Fondateur';
      productDescription = 'Générateur complet + Accès Skool à VIE (valeur 1164€/an)';
      unitAmount = 6700;
      packageType = 'accelerator_founder';
    } else if (selectedPrice === 104) {
      productName = 'Pack Accélérateur + Réseaux Sociaux';
      productDescription = 'Tout le pack + Accès Skool à VIE + 30 jours de contenus RS prêts à poster';
      unitAmount = 10400;
      packageType = 'accelerator_social';
    } else if (selectedPrice === 497) {
      productName = 'Pack Premium + 3 Coachings';
      productDescription = 'Tout inclus + Accès Skool à VIE + 3 sessions de 45min d\'accompagnement personnalisé';
      unitAmount = 49700;
      packageType = 'premium_coaching';
    }

    // Construire les line_items
    const lineItems = [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: productName,
            description: productDescription,
            images: []
          },
          unit_amount: unitAmount,
        },
        quantity: 1,
      }
    ];

    // Créer la session de paiement
    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      phone_number_collection: {
        enabled: true,
      },
      metadata: user ? {
        user_id: user.id,
        user_email: user.email,
        package_type: packageType,
        selected_price: selectedPrice.toString()
      } : {
        package_type: packageType,
        selected_price: selectedPrice.toString()
      }
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
    console.error('Checkout choice error:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});