import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Loader2, User, Shield, Bell, CreditCard, Share2, LogOut } from 'lucide-react';
import { useSessionLoader } from '@/components/hooks/useSessionLoader';
import NoahSidebar from '@/components/dashboard-noah/NoahSidebar';
import NoahHeader from '@/components/dashboard-noah/NoahHeader';
import SettingsProfileTab from '@/components/settings/SettingsProfileTab';
import SettingsSecurityTab from '@/components/settings/SettingsSecurityTab';
import SettingsNotificationsTab from '@/components/settings/SettingsNotificationsTab';
import SettingsSubscriptionTab from '@/components/settings/SettingsSubscriptionTab';
import SettingsAffiliationTab from '@/components/settings/SettingsAffiliationTab';

const TABS = [
  { key: 'profil', label: 'Profil', icon: User },
  { key: 'securite', label: 'Sécurité', icon: Shield },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'abonnement', label: 'Abonnement', icon: CreditCard },
  { key: 'affiliation', label: 'Affiliation', icon: Share2 },
];

export default function SettingsNoah() {
  const { user, session, profile, loading, reload: loadData } = useSessionLoader();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profil');

  // Check URL for tab param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && TABS.find(t => t.key === tab)) {
      setActiveTab(tab);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#1a1a1a] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <NoahSidebar currentPage="SettingsNoah" user={user} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 w-full lg:ml-64">
        <NoahHeader onMenuClick={() => setSidebarOpen(true)} onToggleSidebar={() => {}} />

        <main style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 20px 80px' }}>
          {/* Title */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '8px' }}>
            <h1 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#1a1a1a' }}>
              Paramètres
            </h1>
            <p style={{ fontSize: '14px', color: '#888', marginTop: '4px' }}>
              Tous les <strong style={{ color: '#1a1a1a' }}>réglages</strong> de ton compte <strong style={{ color: '#1a1a1a' }}>centralisés en un seul endroit</strong>.
            </p>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            style={{
              display: 'flex', gap: '4px', padding: '4px',
              background: '#f5f5f5', borderRadius: '14px', marginBottom: '24px',
              marginTop: '20px', overflowX: 'auto'
            }}
            className="scrollbar-hide"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '10px 16px', borderRadius: '10px', border: 'none',
                    background: isActive ? '#fff' : 'transparent',
                    boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    fontSize: '13px', fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#1a1a1a' : '#888',
                    cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s'
                  }}
                >
                  <Icon style={{ width: '14px', height: '14px' }} />
                  {tab.label}
                </button>
              );
            })}
          </motion.div>

          {/* Tab content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'profil' && (
              <SettingsProfileTab user={user} profile={profile} session={session} onReload={loadData} />
            )}
            {activeTab === 'securite' && (
              <SettingsSecurityTab user={user} />
            )}
            {activeTab === 'notifications' && (
              <SettingsNotificationsTab />
            )}
            {activeTab === 'abonnement' && (
              <SettingsSubscriptionTab />
            )}
            {activeTab === 'affiliation' && (
              <SettingsAffiliationTab user={user} />
            )}
          </motion.div>

          {/* Logout */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{ marginTop: '32px' }}
          >
            <button
              onClick={() => base44.auth.logout()}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', padding: '14px', borderRadius: '14px',
                background: '#fafafa', border: '1px solid #e5e5e5',
                fontSize: '14px', fontWeight: 500, color: '#888',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
              className="hover:bg-red-50 hover:text-red-500 hover:border-red-200"
            >
              <LogOut style={{ width: '16px', height: '16px' }} />
              Se déconnecter
            </button>
          </motion.div>
        </main>
      </div>
    </div>
  );
}