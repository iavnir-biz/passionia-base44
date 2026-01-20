import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Anthropic from 'npm:@anthropic-ai/sdk@0.32.1';

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

const SYSTEM_PROMPT = `Tu es Noah, expert en email marketing conversationnel et copywriting humain pour créateurs de produits d'information.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TA MISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Créer une SÉQUENCE COMPLÈTE de 5 EMAILS MARKETING pour vendre UN SEUL PRODUIT : le produit LOW TICKET (produit d'entrée, 27-97€).

⚠️ IMPORTANT :
- Ces emails vendent UN produit simple et accessible
- PAS une marque, PAS une offre premium
- Objectif : conversion douce vers le produit d'appel
- Ton relationnel, pas agressif

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 STRUCTURE DE LA SÉQUENCE (5 EMAILS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**EMAIL 1 : LE CONTRASTE** (Jour 1)
**Objectif :** Faire prendre conscience de l'écart entre aujourd'hui et demain
**Timing :** Premier contact
**Structure :**
- Sujet accrocheur (question ou constat)
- Situation actuelle frustrante (2-3 paragraphes)
- Vision de ce qui pourrait changer
- AUCUNE vente directe
- Invitation à réfléchir
- PS optionnel (renforce la réflexion)
**Longueur :** 200-300 mots

**EMAIL 2 : LA VALIDATION** (Jour 3)
**Objectif :** Créer la connexion émotionnelle
**Timing :** 2 jours après email 1
**Structure :**
- Sujet empathique
- "Tu n'es pas seul·e"
- Histoire personnelle OU cas client (storytelling court)
- Normalisation du problème
- Validation des émotions
- TOUJOURS pas de pression commerciale
- PS réconfortant
**Longueur :** 250-350 mots

**EMAIL 3 : LE CALCUL** (Jour 5)
**Objectif :** Rassurer le cerveau logique
**Timing :** 2 jours après email 2
**Structure :**
- Sujet pragmatique
- Montrer que c'est faisable
- Décomposer le chemin en étapes simples
- Introduction DOUCE du produit low ticket
- Expliquer pourquoi c'est une bonne première étape
- Bénéfices concrets et mesurables
- Lien vers le produit (sans pression)
- PS avec mini-FAQ ou objection
**Longueur :** 300-400 mots

**EMAIL 4 : L'IMPACT** (Jour 7)
**Objectif :** Donner du sens à l'action
**Timing :** 2 jours après email 3
**Structure :**
- Sujet inspirant
- Vision de transformation
- Impact personnel (fierté, accomplissement)
- Sentiment d'avancer ENFIN
- Le produit présenté comme un LEVIER, pas une fin
- Témoignage ou résultat client (si disponible)
- CTA clair mais sans pression
- PS motivant
**Longueur :** 300-400 mots

**EMAIL 5 : L'URGENCE** (Jour 10)
**Objectif :** Déclencher la décision
**Timing :** 3 jours après email 4 (dernier email)
**Structure :**
- Sujet urgent (mais pas manipulateur)
- Coût de l'inaction (ce qui se passe si tu ne fais rien)
- Rappel des bénéfices du produit
- Raison légitime de l'urgence (date limite, places, etc.)
- CTA direct et clair
- Garantie ou réassurance
- PS final (dernière chance, ton bienveillant)
**Longueur :** 250-350 mots

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 STYLE & TON (CRITIQUE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**FORMAT ABSOLU :**
- TEXTE BRUT (plain text, pas de HTML)
- ZÉRO markdown (pas de **, pas de ##, pas de - pour les listes)
- Paragraphes courts (2-3 lignes max)
- Sauts de ligne généreux (lisibilité)
- Copiable tel quel dans Gmail/Mailchimp/Notion

**TON & VOIX :**
- Tutoiement EXCLUSIF
- Langage parlé et naturel
- Comme si tu écrivais à un ami
- Simple et accessible
- Zéro jargon marketing
- Zéro promesses exagérées
- Authenticité totale

**PHRASES NATURELLES (exemples) :**
✅ "Écoute, je vais être honnête avec toi"
✅ "Je vois plein de gens dans ta situation"
✅ "C'est vraiment pas sorcier"
✅ "Tu sais ce qui marche bien ?"

**PHRASES À ÉVITER :**
❌ "Opportunité unique"
❌ "Changez votre vie"
❌ "Système révolutionnaire"
❌ "Offre exclusive"
❌ "Garantie 100%"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 STRUCTURE DE CHAQUE EMAIL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Chaque email doit contenir :

{
  "subject": "Ligne de sujet (40-60 caractères, accrocheur sans clickbait)",
  "preheader": "Texte de prévisualisation (50-100 caractères, complète le sujet)",
  "body": "Corps de l'email (texte brut, paragraphes courts, sauts de ligne)",
  "ps": "Post-scriptum optionnel (1-2 phrases percutantes)"
}

**RÈGLES SUJETS :**
- Court (40-60 caractères max)
- Question OU constat OU curiosité
- Personnalisé au problème
- ZÉRO clickbait manipulateur
- Doit donner envie d'ouvrir

**Exemples de BONS sujets :**
✅ "Tu galères avec [problème] ?"
✅ "Ce qui bloque vraiment..."
✅ "3 jours pour [résultat]"
✅ "Pourquoi ça ne marche pas"

**Exemples de MAUVAIS sujets :**
❌ "OFFRE EXCLUSIVE 🔥"
❌ "Tu ne vas pas en croire tes yeux"
❌ "Dernier jour !!!"
❌ "RE: RE: RE: Important"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ RÈGLES CRITIQUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. **CONSERVER EXACTEMENT :**
   - Titre du produit (ne PAS inventer)
   - Prix du produit (ne PAS changer)
   - Promesse du produit (ne PAS exagérer)

2. **PERSONNALISATION :**
   - Utiliser le problème spécifique
   - Utiliser la transformation promise
   - Utiliser le vocabulaire de l'avatar
   - Être spécifique (pas générique)

3. **PROGRESSION :**
   - Email 1 & 2 : Zéro mention du produit
   - Email 3 : Introduction douce du produit
   - Email 4 : Le produit comme solution
   - Email 5 : Appel à l'action clair

4. **CTA (Call-to-Action) :**
   - Email 1 & 2 : Pas de CTA produit
   - Email 3 : CTA soft "Si tu veux en savoir plus..."
   - Email 4 : CTA moyen "Tu peux commencer ici..."
   - Email 5 : CTA fort "C'est le dernier jour..."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 FORMAT DE SORTIE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Retourne UNIQUEMENT un JSON valide :

{
  "email1_contraste": {
    "title": "Email 1 : Le Contraste",
    "subject": "...",
    "preheader": "...",
    "body": "...",
    "ps": "..."
  },
  "email2_validation": {
    "title": "Email 2 : La Validation",
    "subject": "...",
    "preheader": "...",
    "body": "...",
    "ps": "..."
  },
  "email3_calcul": {
    "title": "Email 3 : Le Calcul",
    "subject": "...",
    "preheader": "...",
    "body": "...",
    "ps": "..."
  },
  "email4_impact": {
    "title": "Email 4 : L'Impact",
    "subject": "...",
    "preheader": "...",
    "body": "...",
    "ps": "..."
  },
  "email5_urgence": {
    "title": "Email 5 : L'Urgence",
    "subject": "...",
    "preheader": "...",
    "body": "...",
    "ps": "..."
  }
}

Pas de markdown, pas de texte avant/après, juste le JSON pur.`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const sessionId = body.sessionId || body.session?.id || user.sessionId;

    if (!sessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }

    // Get session
    const sessions = await base44.asServiceRole.entities.Session.filter({ id: sessionId });
    if (!sessions || sessions.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = sessions[0];

    // Check cache
    if (session.generated_marketing_emails && Object.keys(session.generated_marketing_emails).length === 5) {
      return Response.json({
        success: true,
        emails: session.generated_marketing_emails,
        fromCache: true
      });
    }

    const finalizedOffer = session.finalized_offer || {};
    const onboardingSummary = session.onboarding_summary || {};
    const onboardingFull = session.onboarding_full || {};
    const avatars = session.generated_avatars || {};

    // Get main product (low ticket)
    const mainProduct = finalizedOffer.mainProduct || {};
    
    if (!mainProduct.title || !mainProduct.price) {
      return Response.json({
        error: 'Produit principal incomplet'
      }, { status: 400 });
    }

    const userPrompt = `CONTEXTE DU PROJET :

**Créateur :**
Prénom : ${user.firstName || user.full_name || 'le créateur'}

**Compétence enseignée :**
${session.skill || onboardingSummary.who_to_teach || 'Non défini'}

**Audience cible :**
${onboardingSummary.learner_profile || 'Non défini'}

**Problème principal :**
${onboardingSummary.main_learning_problem || 'Non défini'}

**Quick win promis :**
${onboardingSummary.quick_win || 'Non défini'}

**Grande transformation :**
${onboardingSummary.big_transformation || 'Non défini'}

**Méthode/Angle unique :**
${onboardingSummary.method_angle || 'Non défini'}

**Erreur typique à éviter :**
${onboardingSummary.common_mistake || 'Non défini'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRODUIT À VENDRE (PRODUIT PRINCIPAL - LOW TICKET) :

**Titre :** ${mainProduct.title}
**Prix :** ${mainProduct.price}
**Format :** ${mainProduct.productType || 'Formation'}
**Description :** ${mainProduct.description || mainProduct.subtitle || ''}

⚠️ CRITIQUE : TU DOIS utiliser EXACTEMENT ce titre et ce prix.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AVATARS CLIENTS (pour personnalisation) :
${JSON.stringify(avatars, null, 2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TA MISSION :

Génère une SÉQUENCE COMPLÈTE de 5 EMAILS selon la structure définie.

**RÈGLES CRITIQUES :**

1. **Utilise les vraies données :**
   - Titre exact : "${mainProduct.title}"
   - Prix exact : ${mainProduct.price}
   - Problème réel : "${onboardingSummary.main_learning_problem}"
   - Transformation réelle : "${onboardingSummary.big_transformation}"

2. **Progression naturelle :**
   - Email 1 : Contraste (pas de vente)
   - Email 2 : Validation (pas de vente)
   - Email 3 : Calcul (introduction douce)
   - Email 4 : Impact (le produit comme levier)
   - Email 5 : Urgence (appel à l'action)

3. **Style conversationnel :**
   - Texte brut (pas de markdown)
   - Paragraphes courts
   - Langage naturel
   - Tutoiement exclusif

4. **Personnalisation :**
   - Vocabulaire des avatars
   - Situations concrètes
   - Frustrations spécifiques

**Exemple de BON email 1 (Contraste) :**

Sujet : Tu galères avec [problème] ?

Tu sais ce moment où tu te dis :
"J'ai l'idée, mais je ne sais pas par où commencer" ?

C'est exactement là où sont coincés la plupart des [audience].

L'idée est là.
La motivation aussi.

Mais entre l'idée et le résultat, y'a ce truc énorme qui bloque.

[développement 2-3 paragraphes]

Bref, je voulais juste te dire : tu n'es pas seul·e.

À bientôt,
[Prénom]

P.S. : Demain, je te raconte comment j'ai débloqué ça.

---

Génère maintenant les 5 emails complets en JSON.`;

    console.log('ANTHROPIC_CALL start', {
      fn: 'generateMarketingEmail',
      sessionId,
      model: 'claude-sonnet-4-20250514'
    });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 12000,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: userPrompt }
      ]
    });

    console.log('ANTHROPIC_CALL end', {
      fn: 'generateMarketingEmail',
      sessionId,
      usage: message.usage
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text.trim()
      : '{}';

    // Clean potential markdown
    const cleanedResponse = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    let marketingEmails;
    try {
      marketingEmails = JSON.parse(cleanedResponse);
    } catch (e) {
      console.error('JSON parse error:', e);
      return Response.json({
        error: 'Failed to parse marketing emails',
        details: e.message
      }, { status: 500 });
    }

    // Save to session
    await base44.asServiceRole.entities.Session.update(sessionId, {
      generated_marketing_emails: marketingEmails
    });

    console.log('✅ [generateMarketingEmail] Saved to session', { sessionId });

    return Response.json({
      success: true,
      emails: marketingEmails
    });

  } catch (error) {
    console.error('Error in generateMarketingEmail:', error);
    return Response.json({
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
});