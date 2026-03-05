import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Copy, ChevronDown, ChevronUp, ArrowRight, Clock, Target, Zap, Monitor, Users, Crown, Gift } from 'lucide-react';

const TAG_STYLES = {
  low: { background: 'linear-gradient(135deg, #f97316, #ef4444)', color: '#fff' },
  bump: { background: 'linear-gradient(135deg, #ec4899, #a855f7)', color: '#fff' },
  mid: { background: 'linear-gradient(135deg, #ef4444, #ec4899)', color: '#fff' },
  high: { background: 'linear-gradient(135deg, #1a1a1a, #444)', color: '#fff' },
};

const OFFER_ICONS = {
  low: Monitor,
  bump: Gift,
  mid: Users,
  high: Crown,
};

export default function OfferCardNoah({ offerType, offer, isLoading, onEnrich, onCopy, index }) {
  const [expanded, setExpanded] = useState(false);

  const isEnriched = offer?.before || offer?.after || offer?.benefits?.length > 0;
  const IconComponent = OFFER_ICONS[offerType.id] || Monitor;
  const tagStyle = TAG_STYLES[offerType.id] || TAG_STYLES.low;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + index * 0.06 }}
      style={{
        background: '#fff', border: '1px solid #e5e5e5', borderRadius: '16px',
        overflow: 'hidden', transition: 'all 0.2s'
      }}
      className="hover:shadow-sm hover:border-[#ccc]"
    >
      {/* Main row */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          padding: '20px 24px', cursor: offer ? 'pointer' : 'default'
        }}
        onClick={() => offer && setExpanded(!expanded)}
      >
        {/* Icon */}
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
          background: '#f5f5f5',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <IconComponent style={{ width: '20px', height: '20px', color: '#666' }} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
              {offerType.label}
            </p>
            <span style={{
              fontSize: '10px', fontWeight: 700, padding: '3px 10px',
              borderRadius: '100px', whiteSpace: 'nowrap', letterSpacing: '0.02em',
              ...tagStyle
            }}>
              {offerType.tag}
            </span>
          </div>
          <p style={{
            fontSize: '13px', color: '#888', overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0
          }}>
            {offer?.title || offer?.subtitle || '—'}
          </p>
        </div>

        {/* Price */}
        <span style={{
          fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 800, color: '#1a1a1a',
          flexShrink: 0, letterSpacing: '-0.02em'
        }}>
          {offer?.price || '—'}
        </span>

        {/* Expand arrow */}
        {offer && (
          <div style={{ flexShrink: 0 }}>
            {expanded
              ? <ChevronUp style={{ width: '18px', height: '18px', color: '#bbb' }} />
              : <ChevronDown style={{ width: '18px', height: '18px', color: '#bbb' }} />
            }
          </div>
        )}
      </div>

      {/* Expanded details */}
      {expanded && offer && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{ borderTop: '1px solid #f0f0f0', padding: '20px 24px' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>

            {/* Transformation */}
            {(offer.before || offer.after) && (
              <div style={{
                padding: '16px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #fef2f2 0%, #f0fdf4 100%)',
                border: '1px solid #e5e7eb'
              }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a', marginBottom: '10px' }}>
                  🔄 Transformation
                </p>
                {offer.before && (
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>
                    <span style={{ color: '#ef4444', fontWeight: 600 }}>Avant :</span> {offer.before.split('.')[0]}.
                  </p>
                )}
                {offer.after && (
                  <p style={{ fontSize: '12px', color: '#333' }}>
                    <span style={{ color: '#22c55e', fontWeight: 600 }}>Après :</span> {offer.after.split('.')[0]}.
                  </p>
                )}
              </div>
            )}

            {/* Bénéfices */}
            {offer.benefits?.length > 0 && (
              <div style={{
                padding: '16px', borderRadius: '14px',
                background: '#fafafa', border: '1px solid #f0f0f0'
              }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a', marginBottom: '10px' }}>
                  ✨ Bénéfices clés
                </p>
                {offer.benefits.slice(0, 3).map((b, i) => (
                  <p key={i} style={{ fontSize: '12px', color: '#555', marginBottom: '4px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <Zap style={{ width: '12px', height: '12px', color: '#f97316', flexShrink: 0, marginTop: '2px' }} />
                    {b}
                  </p>
                ))}
              </div>
            )}

            {/* Livrables */}
            {offer.deliverables?.length > 0 && (
              <div style={{
                padding: '16px', borderRadius: '14px',
                background: '#fafafa', border: '1px solid #f0f0f0'
              }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a', marginBottom: '10px' }}>
                  📦 Ce que tu reçois
                </p>
                {offer.deliverables.slice(0, 4).map((d, i) => (
                  <p key={i} style={{ fontSize: '12px', color: '#555', marginBottom: '4px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <ArrowRight style={{ width: '10px', height: '10px', color: '#a78bfa', flexShrink: 0, marginTop: '3px' }} />
                    {d}
                  </p>
                ))}
              </div>
            )}

            {/* Idéal pour */}
            {offer.ideal_for?.length > 0 && (
              <div style={{
                padding: '16px', borderRadius: '14px',
                background: '#fafafa', border: '1px solid #f0f0f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <Target style={{ width: '12px', height: '12px', color: '#ec4899' }} />
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>Idéal pour</p>
                </div>
                <p style={{ fontSize: '12px', color: '#555' }}>
                  {offer.ideal_for.slice(0, 2).join(' · ')}
                </p>
              </div>
            )}

            {/* Durée */}
            {offer.duration && (
              <div style={{
                padding: '16px', borderRadius: '14px',
                background: '#fafafa', border: '1px solid #f0f0f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock style={{ width: '12px', height: '12px', color: '#a78bfa' }} />
                  <p style={{ fontSize: '12px', color: '#1a1a1a' }}>
                    <span style={{ fontWeight: 600 }}>Durée :</span> {offer.duration}
                  </p>
                </div>
              </div>
            )}

            {/* Rôle dans le funnel */}
            {offer.ecosystem_role && (
              <div style={{
                padding: '16px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #fffbeb, #fff7ed)',
                border: '1px solid #fde68a'
              }}>
                <p style={{ fontSize: '12px', color: '#92400e' }}>
                  <span style={{ fontWeight: 600 }}>🔗 Rôle :</span> {offer.ecosystem_role.split('.')[0]}.
                </p>
              </div>
            )}
          </div>

          {/* Non enrichi */}
          {!isEnriched && (
            <div style={{
              marginTop: '16px', padding: '14px 18px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
              border: '1px solid #fde68a'
            }}>
              <p style={{ fontSize: '12px', color: '#92400e' }}>
                💡 <span style={{ fontWeight: 600 }}>Offre de base</span> — Clique sur "Enrichir avec l'IA" pour générer l'analyse complète (transformation, bénéfices, ciblage…)
              </p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}