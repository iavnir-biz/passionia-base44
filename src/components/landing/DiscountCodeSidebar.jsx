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
          padding: '24px',
          borderBottom: '1px solid #f0f0f0',
          background: '#fff',
        }}>
          <div>
            <div style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px',
              background: 'linear-gradient(135deg, #f97316, #ec4899)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Offre exclusive
            </div>
            <div style={{ color: '#1a1a1a', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>
              -20€ immédiats sur votre commande
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f5f5f5',
              border: 'none',
              borderRadius: '50%',
              width: '32px', height: '32px',
              cursor: 'pointer',
              color: '#999',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '32px 24px', flex: 1 }}>
          {!submitted ? (
            <>
              <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.6, marginBottom: '28px' }}>
                Renseignez votre email et votre numéro WhatsApp pour recevoir votre code de réduction personnel.
              </p>

              <form onSubmit={handleSubmit} noValidate>
                {/* Email */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#999', marginBottom: '8px' }}>
                    Renseigner votre email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#ccc' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: null })); }}
                      placeholder="votre@email.com"
                      style={{
                        width: '100%',
                        padding: '14px 14px 14px 42px',
                        borderRadius: '12px',
                        border: `1.5px solid ${errors.email ? '#ef4444' : '#eee'}`,
                        fontSize: '15px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                        background: '#fafafa',
                      }}
                      onFocus={e => e.target.style.borderColor = '#1a1a1a'}
                      onBlur={e => e.target.style.borderColor = errors.email ? '#ef4444' : '#eee'}
                    />
                  </div>
                  {errors.email && (
                    <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.email}</p>
                  )}
                </div>

                {/* WhatsApp */}
                <div style={{ marginBottom: '28px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#999', marginBottom: '8px' }}>
                    Renseigner votre numéro WhatsApp
                  </label>
                  <div style={{ position: 'relative' }}>
                    <MessageCircle size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#ccc' }} />
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => { setWhatsapp(e.target.value); setErrors(p => ({ ...p, whatsapp: null })); }}
                      placeholder="+33 6 12 34 56 78"
                      style={{
                        width: '100%',
                        padding: '14px 14px 14px 42px',
                        borderRadius: '12px',
                        border: `1.5px solid ${errors.whatsapp ? '#ef4444' : '#eee'}`,
                        fontSize: '15px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                        background: '#fafafa',
                      }}
                      onFocus={e => e.target.style.borderColor = '#1a1a1a'}
                      onBlur={e => e.target.style.borderColor = errors.whatsapp ? '#ef4444' : '#eee'}
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
                    borderRadius: '100px',
                    padding: '16px',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    letterSpacing: '-0.01em',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseOver={e => e.target.style.opacity = '0.85'}
                  onMouseOut={e => e.target.style.opacity = '1'}
                >
                  Obtenir mon code -20€
                </button>
              </form>
            </>
          ) : (
            /* Step 2: Show the code */
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: '#f5f5f5',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <Check size={24} color="#1a1a1a" strokeWidth={2.5} />
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.02em', marginBottom: '8px' }}>
                Votre code est prêt !
              </h2>
              <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.6, marginBottom: '32px' }}>
                Copiez ce code et collez-le au moment du paiement pour bénéficier de -20€ immédiats.
              </p>

              {/* Code display */}
              <div style={{
                background: '#fafafa',
                border: '1px solid #eee',
                borderRadius: '20px',
                padding: '28px',
                marginBottom: '16px',
              }}>
                <div style={{
                  fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '12px',
                  color: '#999',
                }}>
                  Code promo
                </div>
                <div style={{ fontSize: '36px', fontWeight: 800, color: '#1a1a1a', letterSpacing: '4px', marginBottom: '20px' }}>
                  noah20
                </div>
                <button
                  onClick={handleCopy}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: copied ? '#1a1a1a' : '#1a1a1a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '100px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseOut={e => e.currentTarget.style.opacity = '1'}
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? 'Code copié !' : 'Copier le code'}
                </button>
              </div>

              <p style={{ color: '#bbb', fontSize: '12px' }}>
                Offre valable jusqu'à minuit — ne pas partager
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}