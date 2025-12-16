import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }

    // Extraire tous les champs onboarding du user
    const {
      coreSkill,
      experienceLevel,
      yearsPracticing,
      targetAudience,
      mainProblem,
      firstResult,
      finalTransformation,
      mainTeaching,
      uniqueMethod,
      typicalMistake,
      extraDetail,
      deliveryPreferences,
      targetIncome,
      targetIncomeDelay,
      lifeChangeStory,
      impactGoals,
      emotionalBenefits,
      relativesThoughts,
      lifestyleGoals,
      perceivedObstacles,
      ifNothingChanges,
      readinessScore,
      ageRange,
      gender,
      familyStatus,
      currentIncome
    } = user;

    // Construire onboarding_summary structuré
    const onboarding_summary = {
      who_to_teach: coreSkill || '',
      learner_profile: targetAudience || '',
      main_learning_problem: mainProblem || '',
      quick_win: firstResult || '',
      big_transformation: finalTransformation || '',
      method_angle: uniqueMethod || mainTeaching || '',
      common_mistake: typicalMistake || '',
      proof_or_story: extraDetail || '',
      format_preferences: deliveryPreferences || []
    };

    // Stocker TOUT dans onboarding_full pour ne rien perdre
    const onboarding_full = {
      coreSkill,
      experienceLevel,
      yearsPracticing,
      targetAudience,
      mainProblem,
      firstResult,
      finalTransformation,
      mainTeaching,
      uniqueMethod,
      typicalMistake,
      extraDetail,
      deliveryPreferences,
      targetIncome,
      targetIncomeDelay,
      lifeChangeStory,
      impactGoals,
      emotionalBenefits,
      relativesThoughts,
      lifestyleGoals,
      perceivedObstacles,
      ifNothingChanges,
      readinessScore,
      ageRange,
      gender,
      familyStatus,
      currentIncome
    };

    // Mettre à jour la session
    await base44.asServiceRole.entities.Session.update(sessionId, {
      onboarding_summary,
      onboarding_full,
      skill: coreSkill || '',
      is_onboarding_done: true
    });

    return Response.json({
      success: true,
      summary: onboarding_summary,
      debug: {
        fieldsCopied: Object.keys(onboarding_full).filter(k => onboarding_full[k]),
        sessionId
      }
    });

  } catch (error) {
    console.error('Error in syncOnboardingToSession:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});