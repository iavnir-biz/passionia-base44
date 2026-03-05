import React from 'react';
import { Shield } from 'lucide-react';

export default function SettingsSecurityTab({ user }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e5e5', borderRadius: '16px',
      padding: '28px', maxWidth: '600px'
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '20px' }}>
        Sécurité du compte
      </h3>

      {/* Google Auth */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px', borderRadius: '12px', background: '#fafafa',
        border: '1px solid #f0f0f0', marginBottom: '16px'
      }}>
        <div>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>Authentification Google</p>
          <p style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{user?.email}</p>
        </div>
        <span style={{
          fontSize: '12px', fontWeight: 600, padding: '4px 12px',
          borderRadius: '100px', background: 'rgba(34,197,94,0.1)',
          color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)'
        }}>
          Connecté
        </span>
      </div>

      {/* Active session */}
      <div style={{ marginTop: '20px' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
          Sessions actives
        </p>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px', borderRadius: '12px', background: '#fafafa',
          border: '1px solid #f0f0f0'
        }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>Session actuelle</p>
            <p style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>Expire dans 7 jours</p>
          </div>
          <span style={{
            fontSize: '12px', fontWeight: 600, padding: '4px 12px',
            borderRadius: '100px', background: 'rgba(34,197,94,0.1)',
            color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)'
          }}>
            Active
          </span>
        </div>
      </div>
    </div>
  );
}