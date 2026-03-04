import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { X } from 'lucide-react';

const stripePromise = loadStripe('pk_live_51QfPN7P7FZHXEZ2M2JkBxFZlslfFqOF4ePCzfaMwthUBTxLV9Ow1OqEYJffAeTXw2bwhiOnaqz6C67e8i66N3iFz00uFjFrfXu');

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
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'relative',
        background: '#fff',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '520px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
      }}>
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
            width: '36px',
            height: '36px',
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
          <X size={18} color="#666" />
        </button>

        {/* Header */}
        <div style={{
          padding: '32px 32px 0',
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '100px',
            padding: '4px 14px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#16a34a',
            marginBottom: '16px',
          }}>
            🔒 Paiement sécurisé
          </div>
          <h3 style={{
            fontSize: '22px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: '6px',
            color: '#1a1a1a',
          }}>
            Pack Clé en Main — 29€
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#888',
            marginBottom: '24px',
          }}>
            Paiement unique · Accès immédiat · Garantie 30 jours
          </p>
        </div>

        {/* Stripe Embedded Checkout */}
        <div style={{ padding: '0 24px 24px', minHeight: '300px' }}>
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ fetchClientSecret }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    </div>
  );
}