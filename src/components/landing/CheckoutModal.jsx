import React, { useCallback, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { X, Check, Shield } from 'lucide-react';

const stripePromise = loadStripe('pk_live_51QfPN7P7FZHXEZ2M2JkBxFZlslfFqOF4ePCzfaMwthUBTxLV9Ow1OqEYJffAeTXw2bwhiOnaqz6C67e8i66N3iFz00uFjFrfXu');

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6930250f9337193d59c1dcf5/9089019f0_Sanstitre500x500px1.png";

export default function CheckoutModal({ isOpen, onClose }) {
  const [withBump, setWithBump] = useState(false);
  const [withBump2, setWithBump2] = useState(false);

  const totalPrice = 29 + (withBump ? 17 : 0) + (withBump2 ? 37 : 0);

  const fetchClientSecret = useCallback(async () => {
    const response = await base44.functions.invoke('createEmbeddedCheckout', { withBump, withBump2 });
    return response.data.clientSecret;
  }, [withBump, withBump2]);

  const handleClose = () => {
    setWithBump(false);
    setWithBump2(false);
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
              display: 'inline-block',
              background: '#1a1a1a', color: '#fff',
              borderRadius: '100px', padding: '5px 14px',
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px',
            }}>OFFRE DE LANCEMENT</span>
          </div>

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
            {/* Badge RECOMMANDÉ */}
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

          {/* Stripe checkout */}
          <EmbeddedCheckoutProvider key={String(withBump)} stripe={stripePromise} options={{ fetchClientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>

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