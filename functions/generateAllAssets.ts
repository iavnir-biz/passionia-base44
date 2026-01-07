import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Orchestrateur unique pour générer TOUS les assets post-paiement
 * Idempotent : relancer ne casse rien
 * DB-first : lit Session comme source unique de vérité
 */
Deno.serve(async (req) => {
  const startTime = Date.now();
  console.log('[generateAllAssets] START', { timestamp: new Date().toISOString() });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[generateAllAssets] User authenticated', { email: user.email });

    // 1. Récupérer la session
    const sessionId = user.sessionId;
    if (!sessionId) {
      console.error('[generateAllAssets] FAIL: No sessionId');
      return Response.json({ 
        error: 'missing_data', 
        missing: ['sessionId'] 
      }, { status: 400 });
    }

    const sessions = await base44.asServiceRole.entities.Session.filter({ id: sessionId });
    if (sessions.length === 0) {
      console.error('[generateAllAssets] FAIL: Session not found');
      return Response.json({ 
        error: 'missing_data', 
        missing: ['session'] 
      }, { status: 400 });
    }

    const session = sessions[0];
    console.log('[generateAllAssets] Session loaded', { 
      sessionId,
      hasFinalized: !!session.finalized_offer,
      hasOnboardingFull: !!session.onboarding_full
    });

    // 2. Vérifier les pré-requis critiques
    const missingData = [];
    
    if (!session.finalized_offer?.mainProduct?.title) {
      missingData.push('finalized_offer.mainProduct');
    }
    
    const onboardingFull = session.onboarding_full || {};
    const requiredKeys = ['coreSkill', 'targetIncome', 'obstacles', 'readinessScore'];
    requiredKeys.forEach(key => {
      if (!onboardingFull[key] && !user[key]) {
        missingData.push(`onboarding_full.${key}`);
      }
    });

    if (missingData.length > 0) {
      console.error('[generateAllAssets] FAIL: Missing required data', { missing: missingData });
      return Response.json({ 
        error: 'missing_data', 
        missing: missingData 
      }, { status: 400 });
    }

    console.log('[generateAllAssets] Pre-requisites validated');

    // 🔒 LOCK anti double-run
    if (session.assets_generation_in_progress) {
      console.warn('[generateAllAssets] Generation already in progress, aborting');
      return Response.json({ 
        error: 'generation_in_progress',
        message: 'Assets generation is already running for this session'
      }, { status: 409 });
    }

    // Activer le lock
    await base44.asServiceRole.entities.Session.update(sessionId, {
      assets_generation_in_progress: true,
      assets_generation_started_at: new Date().toISOString()
    });

    // 3. Pipeline de génération (ordre logique)
    const statusByAsset = {};
    const generationSteps = [
      { name: 'avatars', field: 'generated_avatars', function: 'generateAvatars' },
      { name: 'salesMessages', field: 'generated_sales_messages', function: 'generateSalesMessage' },
      { name: 'marketingEmails', field: 'generated_marketing_emails', function: 'generateMarketingEmail' },
      { name: 'salesPages', field: 'generated_sales_pages', function: 'generateSalesPage' },
      { name: 'planDeRoute', field: 'plan_de_route', function: 'generatePlanDeRoute' }
    ];

    console.log('[generateAllAssets] Starting generation pipeline');

    for (const step of generationSteps) {
      console.log(`[generateAllAssets] Processing ${step.name}...`);
      
      // Check cache
      const currentSession = await base44.asServiceRole.entities.Session.filter({ id: sessionId });
      const latestSession = currentSession[0];
      
      if (latestSession[step.field]) {
        console.log(`[generateAllAssets] ${step.name} already exists, skipping`);
        statusByAsset[step.name] = 'cached';
        continue;
      }

      // Generate
      try {
        console.log(`[generateAllAssets] Calling ${step.function}...`);
        
        // 🔥 P0-2: TOUJOURS passer sessionId
        const result = await base44.asServiceRole.functions.invoke(step.function, { 
          sessionId 
        });
        
        if (result.data?.success || result.data?.message) {
          statusByAsset[step.name] = 'generated';
          console.log(`[generateAllAssets] ${step.name} ✅ SAVED`);
        } else {
          statusByAsset[step.name] = 'failed';
          console.error(`[generateAllAssets] ${step.name} ❌ FAILED`, result.data);
        }
      } catch (error) {
        statusByAsset[step.name] = 'failed';
        console.error(`[generateAllAssets] ${step.name} ERROR`, error.message);
        // Continue même en cas d'erreur pour ne pas bloquer les autres
      }

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 4. Vérifier que tout est prêt (P1-8: vérifier non-vide)
    const finalSession = await base44.asServiceRole.entities.Session.filter({ id: sessionId });
    const updatedSession = finalSession[0];
    
    const readyForDashboard = generationSteps.every(step => {
      const value = updatedSession[step.field];
      return value !== null && value !== undefined && 
             (typeof value === 'object' ? Object.keys(value).length > 0 : value.length > 0);
    });

    const duration = Date.now() - startTime;
    
    // 🔓 Désactiver le lock
    await base44.asServiceRole.entities.Session.update(sessionId, {
      assets_generation_in_progress: false,
      assets_generation_completed_at: new Date().toISOString(),
      status_by_asset: statusByAsset
    });

    console.log('[generateAllAssets] END', { 
      duration: `${duration}ms`,
      statusByAsset,
      readyForDashboard
    });

    return Response.json({
      success: true,
      statusByAsset,
      readyForDashboard,
      duration
    });

  } catch (error) {
    console.error('[generateAllAssets] FATAL ERROR', error);
    
    // 🔓 Désactiver le lock en cas d'erreur
    try {
      const sessionId = user?.sessionId;
      if (sessionId) {
        await base44.asServiceRole.entities.Session.update(sessionId, {
          assets_generation_in_progress: false,
          assets_generation_error: error.message,
          assets_generation_failed_at: new Date().toISOString()
        });
      }
    } catch (unlockError) {
      console.error('[generateAllAssets] Failed to unlock:', unlockError);
    }
    
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});