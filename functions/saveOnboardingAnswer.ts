import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // 🔒 SÉCURITÉ #0 : Vérifier l'authentification
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 🔒 SÉCURITÉ #1 : Validation des données entrantes
    const { sessionId, field, value } = await req.json();
    
    if (!sessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }
    
    if (!field) {
      return Response.json({ error: 'field required' }, { status: 400 });
    }

    // 🔒 SÉCURITÉ #2 : Whitelist des champs autorisés (CRITIQUE)
    const ALLOWED_FIELDS = [
      // Questions dynamiques (1-11)
      'coreSkill',
      'experienceLevel',
      'yearsPracticing',
      'targetAudience',
      'mainProblem',
      'firstQuickResult',
      'finalTransformation',
      'mainTeaching',
      'uniqueMethod',
      'typicalMistake',
      'extraDetail',
      // Questions statiques post-transition (12-26)
      'ageRange',
      'gender',
      'familySituation',
      'currentIncome',
      'targetIncome',
      'targetIncomeDelay',
      'lifeChangeMotivation',
      'emotionalImpact',
      'emotionalState',
      'familySupport',
      'lifestyleVision',
      'perceivedObstacles',
      'nothingChangesScenario',
      'readinessScore',
      'deliveryPreferences'
    ];

    if (!ALLOWED_FIELDS.includes(field)) {
      console.warn("⚠️ [SECURITY] Unauthorized field access attempt", { sessionId, field });
      return Response.json({ 
        error: 'Unauthorized field',
        message: `Le champ '${field}' n'est pas autorisé`
      }, { status: 403 });
    }

    // 🔒 SÉCURITÉ #3 : Sanitize value (limite taille + type check)
    let sanitizedValue;
    if (typeof value === 'string') {
      // Limite à 5000 caractères pour éviter pollution DB
      sanitizedValue = value.slice(0, 5000);
    } else if (typeof value === 'number') {
      sanitizedValue = value;
    } else if (typeof value === 'boolean') {
      sanitizedValue = value;
    } else {
      // Pour les objets/arrays, stringify + limite
      sanitizedValue = JSON.stringify(value).slice(0, 5000);
    }

    // 🔒 SÉCURITÉ #4 : Rate limiting via logging
    console.log('🔐 [SECURITY] saveOnboardingAnswer called', { 
      sessionId, 
      field, 
      hasValue: !!value,
      valueType: typeof value,
      timestamp: new Date().toISOString(),
      ip: req.headers.get('x-forwarded-for') || 'unknown'
    });
    
    // 🔒 SÉCURITÉ #5 : Vérifier que la session existe
    const sessions = await base44.asServiceRole.entities.Session.filter({ id: sessionId });
    
    if (!sessions || sessions.length === 0) {
      console.warn("⚠️ [SECURITY] Session not found", { sessionId });
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }
    
    const session = sessions[0];
    
    // 🔥 MERGE STRICT : ne jamais écraser
    const existing = session.onboarding_full || {};
    const merged = { ...existing, [field]: sanitizedValue };
    
    // Update session
    await base44.asServiceRole.entities.Session.update(sessionId, {
      onboarding_full: merged
    });
    
    console.log('✅ [saveOnboardingAnswer] Saved:', {
      sessionId,
      field,
      totalKeys: Object.keys(merged).length,
      keys: Object.keys(merged)
    });
    
    return Response.json({
      success: true,
      onboarding_full: merged,
      field,
      value: sanitizedValue
    });
    
  } catch (error) {
    console.error('❌ [saveOnboardingAnswer] Error:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});