import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Loader2 } from 'lucide-react';
import LandingNoah2Content from '@/components/landing/LandingNoah2Content';

export default function Welcome() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    checkUserAndRedirect();
  }, []);

  const checkUserAndRedirect = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (!authenticated) {
        setShowLanding(true);
        setChecking(false);
        return;
      }

      const user = await base44.auth.me();

      // Check has_purchased on User
      let purchased = user?.has_purchased === true;

      // Also check in Session (where Stripe webhook often writes)
      if (!purchased) {
        const sessions = await base44.entities.Session.filter({ created_by: user.email });
        const hasPurchasedInAnySession = sessions.some(s => s.has_purchased === true);
        if (hasPurchasedInAnySession) {
          purchased = true;
          await base44.auth.updateMe({ has_purchased: true });
        }
      }

      if (purchased) {
        // User has paid → go to dashboard or last visited page
        const sessions = await base44.entities.Session.filter({ created_by: user.email });
        const activeSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
        const lastPage = activeSession?.last_visited_page;

        if (lastPage && lastPage !== 'Welcome' && lastPage !== 'LandingNoah2') {
          navigate(createPageUrl(lastPage), { replace: true });
        } else {
          navigate(createPageUrl('DashboardNoah'), { replace: true });
        }
        return;
      }

      // Connected but hasn't paid → check onboarding progress
      const sessions = await base44.entities.Session.filter({ created_by: user.email });
      if (sessions.length > 0) {
        const lastSession = sessions[sessions.length - 1];
        const lastPage = lastSession?.last_visited_page;
        if (lastPage && lastPage !== 'Welcome' && lastPage !== 'LandingNoah2') {
          navigate(createPageUrl(lastPage), { replace: true });
          return;
        }
        // Has a session but no last page → go to onboarding
        navigate(createPageUrl('OnboardingFirstName'), { replace: true });
        return;
      }

      // Connected, no session at all → check if profile exists
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      if (profiles.length > 0) {
        navigate(createPageUrl('OnboardingFirstName'), { replace: true });
        return;
      }

      // Completely new user who is logged in → start onboarding
      navigate(createPageUrl('OnboardingFirstName'), { replace: true });

    } catch (error) {
      console.error('[Welcome] Auth check error:', error);
      setShowLanding(true);
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (showLanding) {
    return <LandingNoah2Content />;
  }

  return null;
}