import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function SettingsSubscriptionTab() {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e5e5', borderRadius: '16px',
      padding: '28px', maxWidth: '600px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>Plan actuel</h3>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '8px 16px', borderRadius: '10px',
          border: '1px solid #e5e5e5', background: '#fff',
          fontSize: '13px', fontWeight: 600, color: '#1a1a1a', cursor: 'pointer'
        }}>
          Gérer <ArrowRight style={{ width: '12px', height: '12px' }} />
        </button>
      </div>

      {/* Badge */}
      <span style={{
        display: 'inline-flex', fontSize: '12px', fontWeight: 700,
        padding: '4px 14px', borderRadius: '8px',
        background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
        color: '#fff', marginBottom: '16px'
      }}>
        Starter
      </span>

      {/* Features */}
      <div style={{
        marginTop: '16px', padding: '16px', borderRadius: '12px',
        background: '#fafafa', border: '1px solid #f0f0f0'
      }}>
        <p style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>Inclus dans ton plan :</p>
        {[
          'Accès à tous les modules',
          'Outils & Services IA',
          'Communauté Builders',
          'Support par ticket'
        ].map((feature, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'linear-gradient(135deg, #f97316, #ec4899)', flexShrink: 0 }} />
            <p style={{ fontSize: '13px', color: '#1a1a1a' }}>{feature}</p>
          </div>
        ))}
      </div>
    </div>
  );
}