import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profile, session } = await req.json();

    // Generate hero image with DALL-E
    const imagePrompt = `Professional hero image for a ${profile.passion} online course/training. Modern, clean, professional style with soft colors. Show success, transformation, learning. No text, photorealistic, inspirational.`;
    
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1792x1024",
      quality: "standard"
    });

    const heroImageUrl = imageResponse.data[0].url;

    // Extract product data from session
    const mainProduct = session.offer_generation?.offerChoices?.product_principal || {};
    const mainProductTitle = mainProduct.title || profile.passion;
    const mainProductPrice = mainProduct.price || 'Prix à définir';
    const mainProductType = mainProduct.delivery_type || 'Formation digitale';
    const mainProductDescription = mainProduct.description || mainProduct.full_description || '';
    const mainProductOutcome = profile.transformation || profile.quick_win || '';
    
    const painPoints = profile.main_problem || '';
    const lifeChanges = session.onboarding_full?.life_change || '';
    const inactionCost = session.onboarding_full?.if_nothing_changes || '';
    const skill = profile.passion || '';

    // Generate sales page content with GPT-4 - Structure 12 étapes
    const contentPrompt = `Tu es un expert en Copywriting de Réponse Directe et en Marketing Digital. Ta mission est de rédiger une page de vente complète pour un produit digital en suivant une structure psychologique précise de 12 étapes.

OBJECTIF : Transformer les visiteurs en acheteurs du 'Produit Principal'.

DONNÉES CLIENT À UTILISER :
- Expert : ${user.full_name}
- Compétence / Niche : ${skill}
- Nom du Produit : ${mainProductTitle}
- Prix : ${mainProductPrice}€
- Format du Produit : ${mainProductType}
- Description du Produit : ${mainProductDescription}
- Résultat concret (Transformation) : ${mainProductOutcome}
- Douleurs identifiées : ${painPoints}
- Rêves / Changement de vie : ${lifeChanges}
- Coût de l'inaction : ${inactionCost}

STRUCTURE DE LA PAGE (À respecter impérativement) :

1. **Bandeau d'Urgence** :
   Rédige une ligne courte d'urgence (ex: Offre de lancement, Bonus inclus pour une durée limitée).

2. **En-tête (The Hero Section)** :
   - Titre accrocheur : Une promesse forte incluant ${skill} et le résultat ${mainProductOutcome}.
   - Sous-titre : Une phrase claire qui explique comment le produit ${mainProductTitle} comble le fossé entre ${painPoints} et ${lifeChanges}.
   - CTA : Un bouton d'action puissant : 'Je veux accéder maintenant / Je démarre aujourd'hui'.
   - Image hero (sera injectée)

3. **Identifier le problème** :
   - Utilise la formule : 'Tu en as marre de... ${painPoints} ?'
   - Décris l'émotion de frustration liée à ${skill}. 
   - Ajoute 3 bullet points sur les blocages typiques rencontrés par le prospect.

4. **Casser les objections** :
   - Phrase : 'Et le meilleur dans tout ça ? Tu n'as PAS besoin de...'
   - Liste 3 à 5 éléments que le client pense nécessaires (ex: technique, gros budget, diplômes) mais qui ne le sont pas avec ta méthode.

5. **Présenter la solution** :
   - Introduis ${mainProductTitle}.
   - Une phrase décrivant pourquoi c'est LA solution idéale. 
   - Insiste sur la simplicité et la rapidité.

6. **Comment ça marche (3 étapes)** :
   - Étape 1 : Action simple (ex: Commande).
   - Étape 2 : Transformation (ex: Suis le plan).
   - Étape 3 : Résultat final (ex: Obtiens ${mainProductOutcome}).

7. **Pour qui c'est fait ?** :
   - 'Ce programme est fait pour toi si...' (Lister 3 à 5 profils basés sur ${skill}).
   - (Optionnel) : 'Ce n'est pas pour toi si...' (Cible les touristes ou ceux qui ne veulent pas agir).

8. **Ce que tu vas obtenir** :
   - Détaille le contenu de ${mainProductTitle} (modules, ressources).
   - Liste les bonus offerts.
   - Réitère la transformation : 'À la fin, tu seras capable de ${mainProductOutcome}'.

9. **Preuves sociales** :
   - Rédige des exemples de résultats concrets que les gens peuvent attendre (témoignages réalistes et crédibles).

10. **L'offre et le prix** :
    - Affiche le prix ${mainProductPrice}€ (fais un ancrage de valeur : 'Valeur réelle XXX€, aujourd'hui seulement ${mainProductPrice}€').
    - Mentionne la garantie 'Satisfait ou Remboursé 30 jours'.

11. **FAQ** :
    - Rédige 5 questions fréquentes avec des réponses rassurantes et simples.

12. **Appel à l'action final** :
    - Rappel de la promesse principale.
    - Mention d'urgence (Offre limitée).
    - CTA Final : 'Je lance mon business ${skill} maintenant'.

CONSIGNES DE RÉDACTION :
- Utilise exclusivement le 'Tu'.
- Style fluide, aéré, facile à lire sur mobile.
- Sois persuasif mais reste authentique et bienveillant.
- Utilise Tailwind CSS pour le styling (inline dans le HTML).
- Design moderne, épuré, professionnel.
- Responsive mobile-first.
- Couleurs principales: #61f7a2 (vert accent), #11112b (sombre), blanc.
- Retourne UNIQUEMENT le HTML complet (pas de markdown, pas d'explication).`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Tu es un expert en copywriting et web design. Tu génères des pages de vente HTML optimisées avec Tailwind CSS."
        },
        {
          role: "user",
          content: contentPrompt
        }
      ],
      temperature: 0.8
    });

    let htmlContent = completion.choices[0].message.content;

    // Clean up the response - remove markdown code blocks if present
    htmlContent = htmlContent.replace(/```html\n?/g, '').replace(/```\n?/g, '');

    // Inject the hero image URL into the HTML
    htmlContent = htmlContent.replace(
      /src="[^"]*hero[^"]*"/gi, 
      `src="${heroImageUrl}"`
    );

    // Ensure Tailwind CDN is included
    if (!htmlContent.includes('tailwindcss')) {
      htmlContent = htmlContent.replace(
        '</head>',
        '<script src="https://cdn.tailwindcss.com"></script>\n</head>'
      );
    }

    const salesPage = {
      html: htmlContent,
      heroImage: heroImageUrl,
      generatedAt: new Date().toISOString()
    };

    return Response.json({
      success: true,
      salesPage
    });

  } catch (error) {
    console.error('Error generating sales page:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});