import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Mail, MessageCircle } from 'lucide-react';

export default function DiscountCodeSidebar({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset state when sidebar closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setEmail('');
        setWhatsapp('');
        setSubmitted(false);
        setCopied(false);
        setErrors({});
      }, 300);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const validate = () => {
    const newErrors = {};
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Adresse email invalide';
    }
    if (!whatsapp || whatsapp.replace(/\s/g, '').length < 8) {
      newErrors.whatsapp = 'Numéro invalide';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setSubmitted(true);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText('noah20');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 998,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Sidebar panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100%',
          width: '100%',
          maxWidth: '420px',
          background: '#fff',
          zIndex: 999,
          boxShadow: '-8px 0 40px rgba(0,0,0,0.18)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid #f0f0f0',
          background: '#1a1a1a',
        }}>
          <div>
            <div style={{ color: '#61f7a2', fontSize: '12px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
              Offre exclusive
            </div>
            <div style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>
              -20€ immédiats sur votre commande
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px',
              cursor: 'pointer',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '32px 24px', flex: 1 }}>
          {!submitted ? (
            <>
              <p style={{ color: '#555', fontSize: '15px', lineHeight: 1.6, marginBottom: '28px' }}>
                Renseignez votre email et votre numéro WhatsApp pour recevoir votre code de réduction personnel.
              </p>

              <form onSubmit={handleSubmit} noValidate>
                {/* Email */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#1a1a1a', marginBottom: '8px' }}>
                    RENSEIGNER votre email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: null })); }}
                      placeholder="votre@email.com"
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 40px',
                        borderRadius: '10px',
                        border: `1.5px solid ${errors.email ? '#ef4444' : '#e5e7eb'}`,
                        fontSize: '15px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={e => e.target.style.borderColor = '#1a1a1a'}
                      onBlur={e => e.target.style.borderColor = errors.email ? '#ef4444' : '#e5e7eb'}
                    />
                  </div>
                  {errors.email && (
                    <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.email}</p>
                  )}
                </div>

                {/* WhatsApp */}
                <div style={{ marginBottom: '28px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#1a1a1a', marginBottom: '8px' }}>
                    RENSEIGNER votre numéro WhatsApp
                  </label>
                  <div style={{ position: 'relative' }}>
                    <MessageCircle size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => { setWhatsapp(e.target.value); setErrors(p => ({ ...p, whatsapp: null })); }}
                      placeholder="+33 6 12 34 56 78"
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 40px',
                        borderRadius: '10px',
                        border: `1.5px solid ${errors.whatsapp ? '#ef4444' : '#e5e7eb'}`,
                        fontSize: '15px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={e => e.target.style.borderColor = '#1a1a1a'}
                      onBlur={e => e.target.style.borderColor = errors.whatsapp ? '#ef4444' : '#e5e7eb'}
                    />
                  </div>
                  {errors.whatsapp && (
                    <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.whatsapp}</p>
                  )}
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: '#1a1a1a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '15px',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    letterSpacing: '0.3px',
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={e => e.target.style.background = '#333'}
                  onMouseOut={e => e.target.style.background = '#1a1a1a'}
                >
                  OBTENIR MON CODE -20€
                </button>
              </form>
            </>
          ) : (
            /* Step 2: Show the code */
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'rgba(97,247,162,0.15)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <Check size={28} color="#22c55e" strokeWidth={2.5} />
              </div>

              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a', marginBottom: '8px' }}>
                Votre code est prêt !
              </h2>
              <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.6, marginBottom: '32px' }}>
                Copiez ce code et collez-le au moment du paiement pour bénéficier de -20€ immédiats.
              </p>

              {/* Code display */}
              <div style={{
                background: '#f8f8f8',
                border: '2px dashed #22c55e',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '16px',
              }}>
                <div style={{ fontSize: '12px', color: '#999', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Code promo
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#1a1a1a', letterSpacing: '3px', marginBottom: '16px' }}>
                  noah20
                </div>
                <button
                  onClick={handleCopy}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: copied ? '#22c55e' : '#1a1a1a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? 'Code copié !' : 'Copier le code'}
                </button>
              </div>

              <p style={{ color: '#999', fontSize: '12px' }}>
                Offre valable jusqu'à minuit — ne pas partager
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
