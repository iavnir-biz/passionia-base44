import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Utility function to retrieve standardized session context
 * Used by all generation functions to ensure consistency
 */
export async function getSessionContext(req, sessionId) {
  const base44 = createClientFromRequest(req);
  
  // Authenticate user
  const user = await base44.auth.me();
  if (!user) {
    throw new Error('Unauthorized');
  }

  // Fetch session
  const sessions = await base44.asServiceRole.entities.Session.filter({ id: sessionId });
  if (!sessions || sessions.length === 0) {
    throw new Error('Session not found');
  }

  const session = sessions[0];

  // Return standardized context
  return {
    name: user.firstName || user.full_name || '',
    skill: user.coreSkill || '',
    onboarding_summary: session.onboarding_summary || {},
    onboarding_history: session.onboarding_history || [],
    format_preferences: session.onboarding_summary?.format_preferences || [],
    session: session,
    user: user
  };
}

// Also export as a Deno function if called directly
Deno.serve(async (req) => {
  try {
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }

    const context = await getSessionContext(req, sessionId);
    
    return Response.json(context);
  } catch (error) {
    return Response.json({ 
      error: error.message 
    }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
});