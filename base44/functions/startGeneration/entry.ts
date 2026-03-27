import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Lance la génération progressive de TOUS les assets après paiement
 * Génère 1 par 1 avec délais pour éviter rate limits
 * Sauvegarde la progression en temps réel
 * 
 * ORDRE LOGIQUE (7 ÉTAPES) :
 * 1. Market Analysis SWOT (analyse complète)
 * 2. Avatars (nécessaires pour les offres)
 * 3. Detailed Offers (4 offres complètes)
 * 4. Sales Messages (8 messages DM)
 * 5. Marketing Emails (5 emails séquence)
 * 6. Sales Page (page de vente)
 * 7. Plan de Route (plan d'action)
 */
Deno.serve(async (req) => {
  const startTime = Date.now();
  console.log('[startGeneration] START', { timestamp: new Date().toISOString() });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await req.json().catch(() => ({}));
    const resolvedSessionId = sessionId || user.sessionId;

    if (!resolvedSessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }

    // Get session
    const sessions = await base44.asServiceRole.entities.Session.filter({ id: resolvedSessionId });
    if (sessions.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = sessions[0];
    console.log('[startGeneration] Session loaded', { sessionId: resolvedSessionId });

    // Vérifier que l'utilisateur a payé
    if (!user.has_purchased) {
      return Response.json({ 
        error: 'User has not purchased',
        message: 'Payment required to generate assets'
      }, { status: 403 });
    }

    // Vérifier les pré-requis
    if (!session.finalized_offer?.mainProduct?.title) {
      return Response.json({
        error: 'Missing required data',
        message: 'Onboarding must be completed first'
      }, { status: 400 });
    }

    // 🔒 LOCK anti double-run
    if (session.generation_in_progress) {
      console.warn('[startGeneration] Generation already in progress');
      return Response.json({ 
        error: 'generation_in_progress',
        message: 'Generation is already running for this session',
        status: session.generation_status
      }, { status: 409 });
    }

    // 🔥 Pipeline de génération (7 étapes dans l'ordre logique)
    const generationSteps = [
      {
        id: 'completeMarketAnalysis',
        name: 'Analyse de marché SWOT complète',
        field: 'complete_market_analysis',
        function: 'generateMarketAnalysisV2',
        description: 'Analyse complète avec SWOT, concurrence, stratégie'
      },
      {
        id: 'avatars',
        name: '3 Avatars clients',
        field: 'generated_avatars',
        function: 'generateAvatars',
        description: 'Profils détaillés de tes clients idéaux'
      },
      {
        id: 'detailedOffers',
        name: '4 Offres complètes',
        field: 'detailed_offers',
        function: 'generateDetailedOffers',
        description: 'Tes 4 offres ultra-détaillées avec prix'
      },
      {
        id: 'salesMessages',
        name: 'Messages de vente',
        field: 'generated_sales_messages',
        function: 'generateSalesMessage',
        description: '8 messages pour vendre en DM'
      },
      {
        id: 'marketingEmails',
        name: '5 Emails marketing',
        field: 'generated_marketing_emails',
        function: 'generateMarketingEmail',
        description: 'Séquence email complète'
      },
      {
        id: 'salesPage',
        name: 'Page de vente',
        field: 'generated_sales_pages',
        function: 'generateSalesPage',
        description: 'Page de vente prête à convertir'
      },
      {
        id: 'planDeRoute',
        name: 'Plan de route',
        field: 'plan_de_route',
        function: 'generatePlanDeRoute',
        description: 'Ton plan d\'action personnalisé'
      }
    ];

    const totalSteps = generationSteps.length;

    // Initialiser le status
    const initialStatus = {};
    generationSteps.forEach(step => {
      initialStatus[step.id] = { status: 'pending', progress: 0 };
    });

    // Activer le lock
    await base44.asServiceRole.entities.Session.update(resolvedSessionId, {
      generation_in_progress: true,
      generation_started_at: new Date().toISOString(),
      generation_status: initialStatus
    });

    console.log('[startGeneration] Lock activated, starting generation pipeline');

    // 🔄 GÉNÉRATION PROGRESSIVE
    for (let i = 0; i < generationSteps.length; i++) {
      const step = generationSteps[i];
      const progressPercent = Math.round(((i + 1) / totalSteps) * 100);

      console.log(`[startGeneration] Step ${i + 1}/${totalSteps}: ${step.name}`);

      // Update status: loading
      const currentStatus = await base44.asServiceRole.entities.Session.filter({ id: resolvedSessionId });
      const currentGenerationStatus = currentStatus[0].generation_status || {};
      
      await base44.asServiceRole.entities.Session.update(resolvedSessionId, {
        generation_status: {
          ...currentGenerationStatus,
          [step.id]: { 
            status: 'loading', 
            progress: progressPercent,
            startedAt: new Date().toISOString()
          }
        }
      });

      // Check cache
      const sessionCheck = await base44.asServiceRole.entities.Session.filter({ id: resolvedSessionId });
      const latestSession = sessionCheck[0];

      if (latestSession[step.field]) {
        console.log(`[startGeneration] ${step.name} already exists, marking as done`);
        
        await base44.asServiceRole.entities.Session.update(resolvedSessionId, {
          generation_status: {
            ...currentGenerationStatus,
            [step.id]: { 
              status: 'done', 
              progress: progressPercent,
              completedAt: new Date().toISOString(),
              fromCache: true
            }
          }
        });
        
        continue;
      }

      // Generate avec retry automatique (1 retry sur échec)
      const maxStepRetries = 1;
      let stepSuccess = false;

      for (let stepAttempt = 0; stepAttempt <= maxStepRetries; stepAttempt++) {
        try {
          console.log(`[startGeneration] Calling ${step.function}... (attempt ${stepAttempt + 1})`);

          const result = await base44.asServiceRole.functions.invoke(step.function, {
            sessionId: resolvedSessionId
          });

          // Validation flexible du résultat
          const isSuccess = result.data?.success ||
                           result.data?.avatars ||
                           result.data?.messages ||
                           result.data?.emails ||
                           result.data?.offers ||
                           result.data?.analysis ||
                           result.data?.marketValidation ||
                           result.data?.planDeRoute ||
                           result.data?.salesPage;

          if (isSuccess) {
            console.log(`[startGeneration] ${step.name} ✅ SUCCESS`);

            const updatedStatus = await base44.asServiceRole.entities.Session.filter({ id: resolvedSessionId });
            const updatedGenerationStatus = updatedStatus[0].generation_status || {};

            await base44.asServiceRole.entities.Session.update(resolvedSessionId, {
              generation_status: {
                ...updatedGenerationStatus,
                [step.id]: {
                  status: 'done',
                  progress: progressPercent,
                  completedAt: new Date().toISOString()
                }
              }
            });
            stepSuccess = true;
            break;
          } else {
            throw new Error('Unexpected response format');
          }

        } catch (error) {
          console.error(`[startGeneration] ${step.name} ❌ ERROR (attempt ${stepAttempt + 1}):`, error.message);

          if (stepAttempt < maxStepRetries) {
            // Retry après délai
            const retryDelay = 8000;
            console.log(`[startGeneration] Retrying ${step.name} in ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          }

          // Épuisement des retries : marquer en erreur
          const errorStatus = await base44.asServiceRole.entities.Session.filter({ id: resolvedSessionId });
          const errorGenerationStatus = errorStatus[0].generation_status || {};

          await base44.asServiceRole.entities.Session.update(resolvedSessionId, {
            generation_status: {
              ...errorGenerationStatus,
              [step.id]: {
                status: 'error',
                progress: progressPercent,
                error: error.message,
                failedAt: new Date().toISOString()
              }
            }
          });
        }
      }

      // 🔥 DÉLAI entre chaque génération (évite rate limits)
      if (i < generationSteps.length - 1) {
        const interStepDelay = stepSuccess ? 7000 : 10000; // Plus de délai après un échec
        console.log(`[startGeneration] Waiting ${interStepDelay}ms before next generation...`);
        await new Promise(resolve => setTimeout(resolve, interStepDelay));
      }
    }

    // 🔓 Désactiver le lock
    const finalSession = await base44.asServiceRole.entities.Session.filter({ id: resolvedSessionId });
    const finalStatus = finalSession[0].generation_status || {};
    
    // Vérifier si tout est OK
    const allDone = generationSteps.every(step => 
      finalStatus[step.id]?.status === 'done'
    );

    const hasErrors = generationSteps.some(step => 
      finalStatus[step.id]?.status === 'error'
    );

    await base44.asServiceRole.entities.Session.update(resolvedSessionId, {
      generation_in_progress: false,
      generation_completed_at: new Date().toISOString(),
      all_assets_ready: allDone
    });

    const duration = Date.now() - startTime;
    
    console.log('[startGeneration] END', {
      duration: `${duration}ms`,
      allDone,
      hasErrors,
      completedSteps: Object.keys(finalStatus).filter(k => finalStatus[k].status === 'done').length,
      totalSteps: generationSteps.length,
      status: finalStatus
    });

    return Response.json({
      success: true,
      allDone,
      hasErrors,
      status: finalStatus,
      completedSteps: Object.keys(finalStatus).filter(k => finalStatus[k].status === 'done').length,
      totalSteps: generationSteps.length,
      duration
    });

  } catch (error) {
    console.error('[startGeneration] FATAL ERROR:', error);
    
    // Tenter de désactiver le lock même en cas d'erreur
    try {
      const { sessionId } = await req.json().catch(() => ({}));
      if (sessionId) {
        const base44 = createClientFromRequest(req);
        await base44.asServiceRole.entities.Session.update(sessionId, {
          generation_in_progress: false,
          generation_error: error.message,
          generation_failed_at: new Date().toISOString()
        });
      }
    } catch (unlockError) {
      console.error('[startGeneration] Failed to unlock:', unlockError);
    }

    return Response.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});