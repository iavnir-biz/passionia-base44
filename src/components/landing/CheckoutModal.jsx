import React, { useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { X, Check, Shield } from 'lucide-react';

const stripePromise = loadStripe('pk_live_51QfPN7P7FZHXEZ2M2JkBxFZlslfFqOF4ePCzfaMwthUBTxLV9Ow1OqEYJffAeTXw2bwhiOnaqz6C67e8i66N3iFz00uFjFrfXu');

const included = [
  "4 offres sur-mesure structurées",
  "Messages de vente prêts à l'emploi",
  "Plan d'action 7 jours",
  "Validation marché par IA",
  "Accès à vie + mises à jour",
];

export default function CheckoutModal({ isOpen, onClose }) {
  const fetchClientSecret = useCallback(async () => {
    const response = await base44.functions.invoke('createEmbeddedCheckout');
    return response.data.clientSecret;
  }, []);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
        }}
      />

      {/* Modal */}
      <div className="checkout-modal-content" style={{
        position: 'relative',
        background: '#fff',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '480px',
        maxHeight: '92vh',
        overflow: 'auto',
        boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
      }}>
        {/* Gradient top accent */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          borderRadius: '24px 24px 0 0',
          background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
        }} />

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#f5f5f5',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'background 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.background = '#e5e5e5'}
          onMouseOut={e => e.currentTarget.style.background = '#f5f5f5'}
        >
          <X size={16} color="#999" />
        </button>

        {/* Header */}
        <div style={{
          padding: '32px 28px 0',
          textAlign: 'center',
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#1a1a1a',
            borderRadius: '100px',
            padding: '5px 14px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '0.5px',
            marginBottom: '20px',
          }}>
            OFFRE LIMITÉE
          </div>

          {/* Price */}
          <div style={{ marginBottom: '4px' }}>
            <span style={{ textDecoration: 'line-through', color: '#bbb', fontSize: '18px' }}>47€</span>
          </div>
          <div style={{ marginBottom: '6px' }}>
            <span style={{
              fontSize: '48px',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: '#1a1a1a',
            }}>29€</span>
            <span style={{ fontSize: '15px', color: '#888', marginLeft: '8px' }}>paiement unique</span>
          </div>
          <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '20px' }}>
            Sans engagement · Accès immédiat
          </p>

          {/* Included items */}
          <div style={{
            textAlign: 'left',
            background: '#fafafa',
            borderRadius: '14px',
            padding: '16px 18px',
            marginBottom: '24px',
          }}>
            {included.map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 0',
              }}>
                <Check size={14} color="#1a1a1a" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#555', lineHeight: 1.4 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stripe Embedded Checkout */}
        <div style={{ padding: '0 20px 20px', minHeight: '280px' }}>
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ fetchClientSecret }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>

        {/* Footer trust */}
        <div style={{
          padding: '0 28px 24px',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}>
          <Shield size={13} color="#bbb" />
          <span style={{ fontSize: '12px', color: '#bbb' }}>
            Paiement sécurisé · Garantie 30 jours
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 520px) {
          .checkout-modal-content {
            max-height: 95vh !important;
            border-radius: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}