import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mark user as having purchased
    await base44.auth.updateMe({ 
      has_purchased: true 
    });

    // Create or update session
    const sessions = await base44.entities.Session.filter({ created_by: user.email });
    
    if (sessions.length === 0) {
      // Create new session
      await base44.entities.Session.create({
        is_onboarding_done: false
      });
    }

    return Response.json({ 
      success: true, 
      message: 'Purchase simulated successfully',
      user_email: user.email
    });
  } catch (error) {
    console.error('Error simulating purchase:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});