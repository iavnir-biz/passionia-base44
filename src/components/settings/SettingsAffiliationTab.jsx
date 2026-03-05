import React from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsAffiliationTab({ user }) {
  const referralLink = `https://iavenir.com/ref/${user?.id?.slice(0, 8) || 'xxxxx'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Lien copié !');
  };

  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e5e5', borderRadius: '16px',
      padding: '28px', maxWidth: '600px'
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '20px' }}>
        Programme d'affiliation
      </h3>

      {/* Referral link */}
      <div style={{
        padding: '16px', borderRadius: '12px', background: '#fafafa',
        border: '1px solid #f0f0f0', marginBottom: '20px'
      }}>
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
          Ton lien de parrainage
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={referralLink}
            readOnly
            style={{
              flex: 1, padding: '10px 14px', borderRadius: '10px',
              border: '1px solid #e5e5e5', background: '#fff',
              fontSize: '13px', color: '#888', outline: 'none'
            }}
          />
          <button
            onClick={handleCopy}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '10px 16px', borderRadius: '10px',
              background: '#1a1a1a', color: '#fff', border: 'none',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer'
            }}
          >
            <Copy style={{ width: '12px', height: '12px' }} /> Copier
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {[
          { value: '0', label: 'Filleuls' },
          { value: '0', label: 'Conversions' },
          { value: '0€', label: 'Gains générés' },
        ].map((stat, idx) => (
          <div key={idx} style={{
            textAlign: 'center', padding: '16px 12px', borderRadius: '12px',
            background: '#fafafa', border: '1px solid #f0f0f0'
          }}>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.02em' }}>
              {stat.value}
            </p>
            <p style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}