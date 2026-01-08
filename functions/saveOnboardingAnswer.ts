import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authentification optionnelle (peut être appelé en mode public si besoin)
    const user = await base44.auth.me().catch(() => null);
    
    const { sessionId, field, value } = await req.json();
    
    if (!sessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }
    
    if (!field) {
      return Response.json({ error: 'field required' }, { status: 400 });
    }
    
    console.log('[saveOnboardingAnswer]', { 
      sessionId, 
      field, 
      hasValue: !!value,
      valueType: typeof value 
    });
    
    // 🔥 DB-FIRST : charger la session
    const sessions = await base44.asServiceRole.entities.Session.filter({ id: sessionId });
    
    if (!sessions || sessions.length === 0) {
      console.error('[saveOnboardingAnswer] Session not found:', sessionId);
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }
    
    const session = sessions[0];
    
    // 🔥 MERGE STRICT : ne jamais écraser
    const existing = session.onboarding_full || {};
    const merged = { ...existing, [field]: value };
    
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
      value
    });
    
  } catch (error) {
    console.error('❌ [saveOnboardingAnswer] Error:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});