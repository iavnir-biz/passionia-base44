import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';

import NoahSidebar from '@/components/dashboard-noah/NoahSidebar';
import NoahHeader from '@/components/dashboard-noah/NoahHeader';
import NoahWelcomeBanner from '@/components/dashboard-noah/NoahWelcomeBanner';
import NoahStatsRow from '@/components/dashboard-noah/NoahStatsRow';
import NoahOnboardingSummary from '@/components/dashboard-noah/NoahOnboardingSummary';
import NoahPlanAction from '@/components/dashboard-noah/NoahPlanAction';
import NoahProducts from '@/components/dashboard-noah/NoahProducts';
import NoahSalesMessages from '@/components/dashboard-noah/NoahSalesMessages';


export default function DashboardNoah() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const profiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
      if (profiles.length > 0) setProfile(profiles[0]);

      // 1. Try localStorage first (fast path)
      let foundSession = null;
      const localSessionId = localStorage.getItem('passionia_active_session_id') || currentUser.sessionId;
      if (localSessionId) {
        const localSessions = await base44.entities.Session.filter({ id: localSessionId });
        if (localSessions.length > 0) foundSession = localSessions[0];
      }

      // 2. Fallback: query ALL sessions by user email (handles new device / cleared cache)
      if (!foundSession) {
        const allSessions = await base44.entities.Session.filter({ created_by: currentUser.email }, '-created_date', 10);
        if (allSessions.length > 0) {
          foundSession = allSessions[0]; // most recent session
          // Re-sync localStorage for future visits
          localStorage.setItem('passionia_active_session_id', foundSession.id);
          console.log('[DashboardNoah] Restored session from DB:', foundSession.id);
        }
      }

      if (foundSession) setSession(foundSession);
    } catch (error) {
      console.error('[DashboardNoah] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#1a1a1a] animate-spin" />
      </div>
    );
  }

  const displayName = profile?.first_name || user?.firstName || user?.full_name?.split(' ')[0] || '';

  return (
    <div className="flex min-h-screen bg-white"
         style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <NoahSidebar
        currentPage="DashboardNoah"
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 w-full lg:ml-64">
        <NoahHeader
          onMenuClick={() => setSidebarOpen(true)}
          onToggleSidebar={() => {}}
        />

        <main style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 20px 60px' }}>
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: '8px' }}
          >
            <h1 style={{
              fontSize: 'clamp(24px, 4vw, 32px)',
              fontWeight: 400,
              lineHeight: 1.2,
              letterSpacing: '-0.03em',
              color: '#1a1a1a'
            }}>
              Bonjour{' '}
              <span style={{ fontWeight: 600 }}>{displayName}</span>
            </h1>
            <p style={{ fontSize: '14px', color: '#888', marginTop: '4px' }}>
              Chaque connexion te rapproche du prochain palier.
            </p>
          </motion.div>

          {/* Spacer */}
          <div style={{ height: '24px' }} />

          {/* Welcome Banner */}
          <NoahWelcomeBanner />

          {/* Continue where you left */}
          {session && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '16px 20px', borderRadius: '16px',
                border: '1px solid #e5e5e5', background: '#fff',
                marginBottom: '24px', cursor: 'pointer', transition: 'all 0.2s'
              }}
              className="hover:shadow-sm hover:border-[#ccc]"
              onClick={() => navigate(createPageUrl('MonPlanNoah'))}
            >
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <span style={{ fontSize: '18px' }}>🎯</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '10px', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                  Continue là où tu en es
                </p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>
                  Reprendre le plan d'action
                </p>
              </div>
              <button style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '100px',
                padding: '8px 16px', fontSize: '12px', fontWeight: 600, color: '#1a1a1a',
                cursor: 'pointer'
              }}>
                Continuer <ArrowRight size={12} />
              </button>
            </motion.div>
          )}

          {/* Stats */}
          <NoahStatsRow session={session} />

          {/* Onboarding Summary removed */}

          {/* Products */}
          <NoahProducts session={session} />

          {/* Plan d'action */}
          <NoahPlanAction session={session} />

          {/* Sales Messages */}
          <NoahSalesMessages session={session} />

        </main>
      </div>
    </div>
  );
}