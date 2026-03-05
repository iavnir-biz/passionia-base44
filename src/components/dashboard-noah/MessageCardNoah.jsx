import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Copy, ChevronDown, ChevronUp, Eye, Download } from 'lucide-react';

export default function MessageCardNoah({ msgType, message, isLoading, onGenerate, onCopy, onPreview, onDownload, index }) {
  const [expanded, setExpanded] = useState(false);
  const isGenerated = !!message;

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
          padding: '20px 24px', cursor: isGenerated ? 'pointer' : 'default'
        }}
        onClick={() => isGenerated && setExpanded(!expanded)}
      >
        {/* Number badge */}
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
          background: isGenerated
            ? '#1a1a1a'
            : '#f5f5f5',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{
            fontSize: '15px', fontWeight: 700,
            color: isGenerated ? '#fff' : '#888'
          }}>
            {index + 1}
          </span>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a1a' }}>
              {msgType.title}
            </p>
            <span style={{
              fontSize: '10px', fontWeight: 600, padding: '2px 8px',
              borderRadius: '100px', background: '#f5f5f5', color: '#888',
              border: '1px solid #e5e5e5', whiteSpace: 'nowrap'
            }}>
              {msgType.subtitle}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {msgType.objective}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {!isGenerated ? (
            <button
              onClick={(e) => { e.stopPropagation(); onGenerate(); }}
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
                <><Sparkles style={{ width: '12px', height: '12px' }} /> Générer</>
              )}
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={(e) => { e.stopPropagation(); onCopy(); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: '#f5f5f5', color: '#1a1a1a', border: '1px solid #e5e5e5',
                  padding: '8px 14px', borderRadius: '100px', fontSize: '12px',
                  fontWeight: 600, cursor: 'pointer'
                }}
              >
                <Copy style={{ width: '12px', height: '12px' }} /> Copier
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDownload(); }}
                style={{
                  display: 'inline-flex', alignItems: 'center',
                  background: '#f5f5f5', color: '#888', border: '1px solid #e5e5e5',
                  padding: '8px 10px', borderRadius: '100px', cursor: 'pointer'
                }}
              >
                <Download style={{ width: '12px', height: '12px' }} />
              </button>
            </div>
          )}

          {isGenerated && (
            expanded
              ? <ChevronUp style={{ width: '16px', height: '16px', color: '#888' }} />
              : <ChevronDown style={{ width: '16px', height: '16px', color: '#888' }} />
          )}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && isGenerated && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{ borderTop: '1px solid #f0f0f0', padding: '20px 24px' }}
        >
          {/* Meta info */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '11px', fontWeight: 600, padding: '4px 12px',
              borderRadius: '100px', background: '#f5f5f5', color: '#666',
              border: '1px solid #e5e5e5'
            }}>
              🎯 {msgType.objective}
            </span>
            <span style={{
              fontSize: '11px', fontWeight: 600, padding: '4px 12px',
              borderRadius: '100px', background: '#f5f5f5', color: '#666',
              border: '1px solid #e5e5e5'
            }}>
              🎤 Ton : {msgType.tone}
            </span>
          </div>

          {/* Message content */}
          <div style={{
            background: '#fafafa', borderRadius: '14px', padding: '20px',
            border: '1px solid #f0f0f0'
          }}>
            <pre style={{
              whiteSpace: 'pre-wrap', fontFamily: "'Inter', -apple-system, sans-serif",
              fontSize: '13px', lineHeight: '1.7', color: '#333', margin: 0
            }}>
              {message.content}
            </pre>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}