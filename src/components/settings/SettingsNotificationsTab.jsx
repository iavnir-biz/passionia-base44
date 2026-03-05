import React, { useState } from 'react';

const NOTIFICATIONS = [
  { key: 'modules', label: 'Nouveaux modules publiés', desc: 'Reçois une notification quand un module est disponible' },
  { key: 'community', label: 'Activité communauté', desc: 'Réponses à tes posts et mentions' },
  { key: 'coaching', label: 'Messages coaching', desc: 'Réponses de tes coachs' },
];

export default function SettingsNotificationsTab() {
  const [toggles, setToggles] = useState({ modules: true, community: true, coaching: true });

  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e5e5', borderRadius: '16px',
      padding: '28px', maxWidth: '600px'
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '20px' }}>
        Préférences de notifications
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {NOTIFICATIONS.map((item) => (
          <div key={item.key} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px', borderRadius: '12px', background: '#fafafa',
            border: '1px solid #f0f0f0'
          }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>{item.label}</p>
              <p style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{item.desc}</p>
            </div>
            <button
              onClick={() => setToggles({ ...toggles, [item.key]: !toggles[item.key] })}
              style={{
                width: '44px', height: '24px', borderRadius: '100px', border: 'none',
                background: toggles[item.key] ? '#1a1a1a' : '#e5e5e5',
                cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0
              }}
            >
              <div style={{
                width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                position: 'absolute', top: '3px',
                left: toggles[item.key] ? '23px' : '3px',
                transition: 'left 0.2s'
              }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}