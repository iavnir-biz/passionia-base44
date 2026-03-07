import React, { useCallback, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { X, Check, Shield } from 'lucide-react';

const stripePromise = loadStripe('pk_live_51QfPN7P7FZHXEZ2M2JkBxFZlslfFqOF4ePCzfaMwthUBTxLV9Ow1OqEYJffAeTXw2bwhiOnaqz6C67e8i66N3iFz00uFjFrfXu');

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6930250f9337193d59c1dcf5/9089019f0_Sanstitre500x500px1.png";

const COUNTDOWN_SECONDS = 15 * 60; // 15 minutes

export default function CheckoutModal({ isOpen, onClose }) {
  const [withBump, setWithBump] = useState(false);
  const [withBump2, setWithBump2] = useState(false);
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_SECONDS);
  // null = selection step, object = checkout step (frozen bump values)
  const [checkoutConfig, setCheckoutConfig] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setTimeLeft(COUNTDOWN_SECONDS);
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const totalPrice = 29 + (withBump ? 17 : 0) + (withBump2 ? 37 : 0);

  // Only called once when user clicks "Proceed to payment"
  const fetchClientSecret = useCallback(async () => {
    const response = await base44.functions.invoke('createEmbeddedCheckout', {
      withBump: checkoutConfig?.withBump ?? false,
      withBump2: checkoutConfig?.withBump2 ?? false,
    });
    return response.data.clientSecret;
  }, [checkoutConfig]);

  const handleProceedToCheckout = () => {
    setCheckoutConfig({ withBump, withBump2 });
  };

  const handleBackToSelection = () => {
    setCheckoutConfig(null);
  };

  const handleClose = () => {
    setWithBump(false);
    setWithBump2(false);
    setCheckoutConfig(null);
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
          background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
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

        <div style={{ padding: '32px 28px 28px' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <img src={LOGO_URL} alt="iavnirLab" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          </div>

          {/* Badge */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#1a1a1a', color: '#fff',
              borderRadius: '100px', padding: '6px 16px',
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px',
            }}>
              OFFRE EXCLUSIVE
              <span style={{
                background: '#f97316', color: '#fff',
                borderRadius: '100px', padding: '2px 8px',
                fontSize: '11px', fontWeight: 800, letterSpacing: '0.3px',
                fontVariantNumeric: 'tabular-nums',
              }}>{formatTime(timeLeft)}</span>
            </span>
          </div>

          {checkoutConfig ? (
            /* ── STEP 2: Stripe embedded checkout ── */
            <>
              {/* Back link */}
              <button onClick={handleBackToSelection} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '12px', color: '#888', marginBottom: '16px',
                display: 'flex', alignItems: 'center', gap: '4px', padding: 0,
              }}>
                ← Modifier ma sélection
              </button>

              {/* Summary */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '36px', fontWeight: 800, color: '#1a1a1a' }}>
                  {29 + (checkoutConfig.withBump ? 17 : 0) + (checkoutConfig.withBump2 ? 37 : 0)}€
                </span>
                <span style={{ fontSize: '13px', color: '#888', marginLeft: '8px' }}>paiement unique</span>
              </div>

              <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </>
          ) : (
            /* ── STEP 1: Bump selection ── */
            <>
              {/* Price */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div>
                  <span style={{ fontSize: '52px', fontWeight: 800, letterSpacing: '-0.03em', color: '#1a1a1a' }}>
                    {totalPrice}€
                  </span>
                  <span style={{ fontSize: '14px', color: '#888', marginLeft: '8px' }}>paiement unique</span>
                </div>
                <p style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>Sans engagement · Accès immédiat</p>
              </div>

              {/* Order bump 1 */}
              <button
                onClick={() => setWithBump(!withBump)}
                style={{
                  width: '100%', border: `2px solid ${withBump ? '#f97316' : '#e5e5e5'}`,
                  borderRadius: '14px', padding: '16px',
                  background: withBump ? '#fff7ed' : '#fff',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s', marginBottom: '10px',
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                }}
              >
                <div style={{
                  width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0, marginTop: '2px',
                  background: withBump ? '#f97316' : '#fff',
                  border: `2px solid ${withBump ? '#f97316' : '#ccc'}`,
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

              {/* Order bump 2 — Pack Premium */}
              <button
                onClick={() => setWithBump2(!withBump2)}
                style={{
                  width: '100%', border: `2px solid ${withBump2 ? '#a78bfa' : '#e5e5e5'}`,
                  borderRadius: '14px', padding: '16px',
                  background: withBump2 ? '#f5f3ff' : '#fff',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s', marginBottom: '24px',
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  position: 'relative',
                }}
              >
                <div style={{
                  position: 'absolute', top: '-10px', left: '16px',
                  background: 'linear-gradient(135deg, #a78bfa, #ec4899)',
                  color: '#fff', fontSize: '9px', fontWeight: 800,
                  letterSpacing: '0.8px', padding: '3px 10px', borderRadius: '100px',
                }}>
                  LE PLUS CHOISI
                </div>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0, marginTop: '2px',
                  background: withBump2 ? '#a78bfa' : '#fff',
                  border: `2px solid ${withBump2 ? '#a78bfa' : '#ccc'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {withBump2 && <Check size={12} color="#fff" strokeWidth={3} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a' }}>
                      💎 Ajouter : Page de vente personnalisée + 5 emails marketing
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: '12px', flexShrink: 0 }}>
                      <span style={{ fontSize: '11px', color: '#bbb', textDecoration: 'line-through', lineHeight: 1 }}>57€</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#a78bfa', lineHeight: 1.2 }}>+37€</span>
                      <span style={{ fontSize: '9px', fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #a78bfa, #ec4899)', borderRadius: '100px', padding: '1px 6px', marginTop: '2px', letterSpacing: '0.3px' }}>-20€</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '12px', color: '#777', lineHeight: 1.5, margin: 0 }}>
                    1 page de vente pour ton produit principal + 5 emails marketing rédigés et 100% personnalisés. Prêts à copier-coller.
                  </p>
                </div>
              </button>

              {/* CTA */}
              <button
                onClick={handleProceedToCheckout}
                style={{
                  width: '100%', padding: '16px',
                  background: 'linear-gradient(135deg, #1a1a1a, #333)',
                  color: '#fff', border: 'none', borderRadius: '14px',
                  fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                  letterSpacing: '0.2px', marginBottom: '12px',
                }}
              >
                Payer {totalPrice}€ →
              </button>
            </>
          )}

          {/* Trust */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '16px' }}>
            <Shield size={13} color="#bbb" />
            <span style={{ fontSize: '12px', color: '#bbb' }}>Paiement sécurisé Stripe · Garantie 30 jours</span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 520px) {
          .checkout-modal-content { max-height: 95vh !important; border-radius: 16px !important; }
        }
      `}</style>
    </div>
  );
}