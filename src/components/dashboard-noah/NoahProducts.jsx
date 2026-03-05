import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Package, Gift, TrendingUp, Crown, ArrowRight, Sparkles } from 'lucide-react';

const PRODUCT_MAP = [
  { key: 'mainProduct', label: 'Produit Principal', icon: Package, tag: '47€' },
  { key: 'orderBump', label: 'Petit Extra', icon: Gift, tag: '27€' },
  { key: 'upsell1', label: 'Offre Supérieure', icon: TrendingUp, tag: '297€' },
  { key: 'upsell3', label: 'Offre Premium', icon: Crown, tag: '3000€' },
];

export default function NoahProducts({ session }) {
  const navigate = useNavigate();
  const finalizedOffer = session?.finalized_offer || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      style={{
        background: '#fff', border: '1px solid #e5e5e5', borderRadius: '20px',
        padding: '24px', marginBottom: '24px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.01em' }}>
          Mes produits
        </h3>
        <button
          onClick={() => navigate(createPageUrl('MyOffers'))}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '12px', fontWeight: 500, color: '#888', background: 'none',
            border: 'none', cursor: 'pointer', padding: 0
          }}
        >
          Détailler avec l'IA <Sparkles size={12} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
        {PRODUCT_MAP.map((item, idx) => {
          const offer = finalizedOffer[item.key];
          const Icon = item.icon;

          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.06 }}
              onClick={() => navigate(createPageUrl('MyOffers'))}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 16px', borderRadius: '14px',
                border: '1px solid #e5e5e5', background: '#fff',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
              className="hover:border-[#ccc] hover:shadow-sm"
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: '#f5f5f5', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0
              }}>
                <Icon style={{ width: '16px', height: '16px', color: '#1a1a1a' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '11px', color: '#888', fontWeight: 500, marginBottom: '2px' }}>
                  {item.label}
                </p>
                <p style={{
                  fontSize: '13px', fontWeight: 600, color: '#1a1a1a',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {offer?.title || '—'}
                </p>
              </div>
              <span style={{
                fontSize: '13px', fontWeight: 700, color: '#1a1a1a', flexShrink: 0
              }}>
                {offer?.price || '—'}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}