import React, { useCallback, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { X, Check, Shield, ChevronRight, Plus } from 'lucide-react';

const stripePromise = loadStripe('pk_live_51QfPN7P7FZHXEZ2M2JkBxFZlslfFqOF4ePCzfaMwthUBTxLV9Ow1OqEYJffAeTXw2bwhiOnaqz6C67e8i66N3iFz00uFjFrfXu');

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6930250f9337193d59c1dcf5/9089019f0_Sanstitre500x500px1.png";

const included = [
  "4 offres sur-mesure structurées par notre IA",
  "Messages de vente prêts à l'emploi",
  "Validation de l'idée + Analyse de marché détaillée",
  "Checklist de lancement",
  "Accès à vie + mises à jour",
];

export default function CheckoutModal({ isOpen, onClose }) {
  const [withBump, setWithBump] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  const totalPrice = withBump ? 46 : 29;

  const fetchClientSecret = useCallback(async () => {
    const response = await base44.functions.invoke('createEmbeddedCheckout', { withBump });
    return response.data.clientSecret;
  }, [withBump]);

  const handleProceed = async () => {
    setLoadingCheckout(true);
    setShowCheckout(true);
  };

  const handleClose = () => {
    setShowCheckout(false);
    setWithBump(false);
    setLoadingCheckout(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Backdrop */}
      <div onClick={handleClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      }} />

      {/* Modal */}
      <div className="checkout-modal-content" style={{
        position: 'relative', background: '#fff', borderRadius: '24px',
        width: '100%', maxWidth: '500px', maxHeight: '92vh', overflow: 'auto',
        boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
      }}>
        {/* Gradient top */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
          borderRadius: '24px 24px 0 0',
          background: 'linear-gradient(135deg, #61f7a2, #2dd4bf, #6366f1)',
        }} />

        {/* Close */}
        <button onClick={handleClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: '#f5f5f5', border: 'none', borderRadius: '50%',
          width: '32px', height: '32px', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 10,
        }}>
          <X size={16} color="#999" />
        </button>

        {!showCheckout ? (
          /* ── Step 1: Offer selection ── */
          <div style={{ padding: '32px 28px 28px' }}>
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <img src={LOGO_URL} alt="iavnirLab" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            </div>

            {/* Badge */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{
                display: 'inline-block',
                background: '#1a1a1a', color: '#fff',
                borderRadius: '100px', padding: '5px 14px',
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px',
              }}>OFFRE DE LANCEMENT</span>
            </div>

            {/* Price */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ marginBottom: '4px' }}>
                <span style={{ textDecoration: 'line-through', color: '#bbb', fontSize: '16px' }}>97€</span>
              </div>
              <div>
                <span style={{ fontSize: '52px', fontWeight: 800, letterSpacing: '-0.03em', color: '#1a1a1a' }}>
                  {totalPrice}€
                </span>
                <span style={{ fontSize: '14px', color: '#888', marginLeft: '8px' }}>paiement unique</span>
              </div>
              <p style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>Sans engagement · Accès immédiat</p>
            </div>

            {/* Main product included */}
            <div style={{ background: '#fafafa', borderRadius: '14px', padding: '16px 18px', marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                Inclus dans ton accès
              </p>
              {included.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '5px 0' }}>
                  <Check size={14} color="#61f7a2" strokeWidth={3} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '13px', color: '#444', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Order bump */}
            <button
              onClick={() => setWithBump(!withBump)}
              style={{
                width: '100%', border: `2px solid ${withBump ? '#61f7a2' : '#e5e5e5'}`,
                borderRadius: '14px', padding: '16px',
                background: withBump ? '#f0fdf6' : '#fff',
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.2s', marginBottom: '20px',
                display: 'flex', alignItems: 'flex-start', gap: '12px',
              }}
            >
              {/* Checkbox */}
              <div style={{
                width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0, marginTop: '2px',
                background: withBump ? '#61f7a2' : '#fff',
                border: `2px solid ${withBump ? '#61f7a2' : '#ccc'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}>
                {withBump && <Check size={12} color="#fff" strokeWidth={3} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a' }}>
                    ⚡ Ajouter : Plan d'action 7 jours détaillé
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a', marginLeft: '12px', flexShrink: 0 }}>+17€</span>
                </div>
                <p style={{ fontSize: '12px', color: '#777', lineHeight: 1.5, margin: 0 }}>
                  Checklist jour par jour avec les actions concrètes pour réaliser ta première vente en 7 jours.
                </p>
              </div>
            </button>

            {/* CTA */}
            <button
              onClick={handleProceed}
              style={{
                width: '100%', background: '#1a1a1a', color: '#fff',
                border: 'none', borderRadius: '14px', padding: '16px',
                fontSize: '16px', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'background 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.background = '#000'}
              onMouseOut={e => e.currentTarget.style.background = '#1a1a1a'}
            >
              Passer au paiement — {totalPrice}€
              <ChevronRight size={18} />
            </button>

            {/* Trust */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '16px' }}>
              <Shield size={13} color="#bbb" />
              <span style={{ fontSize: '12px', color: '#bbb' }}>Paiement sécurisé Stripe · Garantie 30 jours</span>
            </div>
          </div>
        ) : (
          /* ── Step 2: Stripe checkout ── */
          <div>
            <div style={{ padding: '24px 28px 12px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
                    Passion IA — {totalPrice}€
                  </p>
                  {withBump && (
                    <p style={{ fontSize: '12px', color: '#61aa7a', marginTop: '4px' }}>
                      ✓ Plan d'action 7 jours inclus
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowCheckout(false)}
                  style={{ background: '#f5f5f5', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '13px', color: '#666' }}
                >
                  ← Modifier
                </button>
              </div>
            </div>
            <div style={{ padding: '0 20px 20px', minHeight: '320px' }}>
              <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
            <div style={{ padding: '0 28px 24px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Shield size={13} color="#bbb" />
              <span style={{ fontSize: '12px', color: '#bbb' }}>Paiement sécurisé · Garantie 30 jours</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 520px) {
          .checkout-modal-content { max-height: 95vh !important; border-radius: 16px !important; }
        }
      `}</style>
    </div>
  );
}