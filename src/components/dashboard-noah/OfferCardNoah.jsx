import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Copy, ChevronDown, ChevronUp, ArrowRight, Clock, Target, Zap } from 'lucide-react';

export default function OfferCardNoah({ offerType, offer, isLoading, onEnrich, onCopy, index }) {
  const [expanded, setExpanded] = useState(false);

  const isEnriched = offer?.before || offer?.after || offer?.benefits?.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + index * 0.06 }}
      style={{
        background: '#fff', border: '1px solid #e5e5e5', borderRadius: '20px',
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
        {/* Number badge */}
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
          background: isEnriched
            ? '#1a1a1a'
            : '#f5f5f5',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{
            fontSize: '15px', fontWeight: 700,
            color: isEnriched ? '#fff' : '#888'
          }}>
            {index + 1}
          </span>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a1a' }}>
              {offer?.title || offerType.label}
            </p>
            <span style={{
              fontSize: '10px', fontWeight: 600, padding: '2px 8px',
              borderRadius: '100px', background: '#f5f5f5', color: '#888',
              border: '1px solid #e5e5e5', whiteSpace: 'nowrap'
            }}>
              {offerType.tag}
            </span>
          </div>
          {offer?.subtitle && (
            <p style={{ fontSize: '12px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {offer.subtitle}
            </p>
          )}
        </div>

        {/* Price */}
        {offer?.price && (
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a', flexShrink: 0 }}>
            {offer.price}
          </span>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {!offer ? (
            <button
              onClick={(e) => { e.stopPropagation(); onEnrich(); }}
              disabled={isLoading}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: '#1a1a1a', color: '#fff', border: 'none',
                padding: '8px 16px', borderRadius: '100px', fontSize: '12px',
                fontWeight: 600, cursor: 'pointer', opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? (
                <><Loader2 style={{ width: '12px', height: '12px' }} className="animate-spin" /> Génération...</>
              ) : (
                <><Sparkles style={{ width: '12px', height: '12px' }} /> Détailler</>
              )}
            </button>
          ) : !isEnriched ? (
            <button
              onClick={(e) => { e.stopPropagation(); onEnrich(); }}
              disabled={isLoading}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: '#1a1a1a',
                color: '#fff', border: 'none',
                padding: '8px 16px', borderRadius: '100px', fontSize: '12px',
                fontWeight: 600, cursor: 'pointer', opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? (
                <><Loader2 style={{ width: '12px', height: '12px' }} className="animate-spin" /> Enrichissement...</>
              ) : (
                <><Sparkles style={{ width: '12px', height: '12px' }} /> Enrichir avec l'IA</>
              )}
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onCopy(); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: '#f5f5f5', color: '#1a1a1a', border: '1px solid #e5e5e5',
                padding: '8px 16px', borderRadius: '100px', fontSize: '12px',
                fontWeight: 600, cursor: 'pointer'
              }}
            >
              <Copy style={{ width: '12px', height: '12px' }} /> Copier
            </button>
          )}

          {offer && (
            expanded
              ? <ChevronUp style={{ width: '16px', height: '16px', color: '#888' }} />
              : <ChevronDown style={{ width: '16px', height: '16px', color: '#888' }} />
          )}
        </div>
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
                    <Zap style={{ width: '12px', height: '12px', color: '#1a1a1a', flexShrink: 0, marginTop: '2px' }} />
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
                    <ArrowRight style={{ width: '10px', height: '10px', color: '#1a1a1a', flexShrink: 0, marginTop: '3px' }} />
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
                  <Target style={{ width: '12px', height: '12px', color: '#1a1a1a' }} />
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
                  <Clock style={{ width: '12px', height: '12px', color: '#1a1a1a' }} />
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