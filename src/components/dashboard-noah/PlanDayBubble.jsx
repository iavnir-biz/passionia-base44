import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Lock, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PlanDayBubble({ day, checklist, isActive, isCompleted, isLocked, onChecklistChange, onComplete, index }) {
  const [expanded, setExpanded] = useState(isActive);
  const navigate = useNavigate();
  const allChecked = checklist.every(item => item.checked);
  const checkedCount = checklist.filter(item => item.checked).length;
  const progress = checklist.length > 0 ? Math.round((checkedCount / checklist.length) * 100) : 0;

  const handleAction = (action) => {
    if (action?.type === 'link') navigate(createPageUrl(action.page));
    else if (action?.type === 'external') window.open(action.url, '_blank');
  };

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      {/* Timeline column */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '48px', flexShrink: 0 }}>
        {/* Bubble */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 + index * 0.08, type: 'spring', stiffness: 200 }}
          style={{
            width: '48px', height: '48px', borderRadius: '50%', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            background: isCompleted
              ? 'linear-gradient(135deg, #f97316, #ec4899)'
              : isActive
                ? 'linear-gradient(135deg, #1a1a1a, #333)'
                : '#f0f0f0',
            boxShadow: isActive ? '0 0 16px rgba(26,26,26,0.2)' : isCompleted ? '0 0 12px rgba(249,115,22,0.25)' : 'none',
            border: isActive ? '3px solid #fff' : '2px solid #e5e5e5',
            cursor: isLocked ? 'default' : 'pointer'
          }}
          onClick={() => !isLocked && setExpanded(!expanded)}
          whileHover={!isLocked ? { scale: 1.1 } : {}}
          whileTap={!isLocked ? { scale: 0.95 } : {}}
        >
          {isCompleted ? (
            <Check style={{ width: '20px', height: '20px', color: '#fff', strokeWidth: 3 }} />
          ) : isLocked ? (
            <Lock style={{ width: '16px', height: '16px', color: '#ccc' }} />
          ) : (
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>{day.number}</span>
          )}
        </motion.div>

        {/* Line */}
        {index < 6 && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.2 + index * 0.08, duration: 0.3 }}
            style={{
              width: '2px', flex: 1, minHeight: '20px',
              background: isCompleted
                ? 'linear-gradient(to bottom, #f97316, #e5e5e5)'
                : '#e5e5e5',
              transformOrigin: 'top', marginTop: '4px', marginBottom: '4px'
            }}
          />
        )}
      </div>

      {/* Content card */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 + index * 0.08 }}
        style={{
          flex: 1, marginBottom: '16px', borderRadius: '16px',
          border: isActive ? '1px solid #1a1a1a' : '1px solid #e5e5e5',
          background: isCompleted ? '#fafafa' : '#fff',
          opacity: isLocked ? 0.45 : 1, overflow: 'hidden'
        }}
      >
        {/* Header */}
        <button
          onClick={() => !isLocked && setExpanded(!expanded)}
          disabled={isLocked}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', background: 'none', border: 'none', cursor: isLocked ? 'default' : 'pointer',
            textAlign: 'left'
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '14px', fontWeight: 700, color: '#1a1a1a'
              }}>
                Jour {day.number}
              </span>
              <span style={{
                fontSize: '10px', fontWeight: 600, padding: '2px 8px',
                borderRadius: '100px', background: isCompleted ? 'linear-gradient(135deg, #f97316, #ec4899)' : '#f5f5f5',
                color: isCompleted ? '#fff' : '#888', border: '1px solid',
                borderColor: isCompleted ? 'transparent' : '#e5e5e5'
              }}>
                {isCompleted ? '✓ Terminé' : isActive ? 'En cours' : isLocked ? 'Verrouillé' : ''}
              </span>
            </div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
              {day.title}
            </p>
            <p style={{ fontSize: '12px', color: '#888', margin: '2px 0 0' }}>{day.objective}</p>
          </div>

          {!isLocked && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              {/* Mini progress */}
              {!isCompleted && (
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#888' }}>
                  {checkedCount}/{checklist.length}
                </span>
              )}
              <ChevronDown style={{
                width: '16px', height: '16px', color: '#888',
                transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s'
              }} />
            </div>
          )}
        </button>

        {/* Progress bar under header */}
        {!isLocked && !isCompleted && (
          <div style={{ height: '3px', background: '#f0f0f0' }}>
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #f97316, #ec4899, #a78bfa)', borderRadius: '2px' }}
            />
          </div>
        )}

        {/* Expanded checklist */}
        <AnimatePresence>
          {expanded && !isLocked && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ borderTop: '1px solid #f0f0f0', overflow: 'hidden' }}
            >
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Key message */}
                {day.keyMessage && !isCompleted && (
                  <div style={{
                    background: '#fafafa', borderRadius: '12px', padding: '12px 16px',
                    border: '1px solid #e5e5e5', marginBottom: '4px'
                  }}>
                    <p style={{ fontSize: '12px', color: '#666', fontStyle: 'italic', margin: 0 }}>
                      💡 {day.keyMessage}
                    </p>
                  </div>
                )}

                {/* Checklist items */}
                {checklist.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                    padding: '10px 14px', borderRadius: '12px',
                    background: item.checked ? 'linear-gradient(135deg, rgba(249,115,22,0.06), rgba(236,72,153,0.06))' : '#fafafa',
                    border: item.checked ? '1px solid rgba(249,115,22,0.2)' : '1px solid #f0f0f0',
                    transition: 'all 0.2s'
                  }}>
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => onChecklistChange(idx)}
                      disabled={isCompleted || item.disabled}
                      style={{ marginTop: '2px', width: '18px', height: '18px', minWidth: '18px', minHeight: '18px', accentColor: '#f97316', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontSize: '13px', fontWeight: 500, color: '#1a1a1a', margin: 0,
                        textDecoration: item.checked ? 'line-through' : 'none',
                        opacity: item.checked ? 0.6 : 1
                      }}>
                        {item.text}
                      </p>
                      {!item.checked && item.details && (
                        <p style={{ fontSize: '11px', color: '#888', marginTop: '4px', lineHeight: 1.5 }}>
                          {item.details}
                        </p>
                      )}
                      {!item.checked && item.action && (
                        <button
                          onClick={() => handleAction(item.action)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            fontSize: '11px', fontWeight: 600, color: '#f97316',
                            background: 'none', border: 'none', cursor: 'pointer',
                            marginTop: '6px', padding: 0
                          }}
                        >
                          {item.action.label}
                          {item.action.type === 'external' && <ExternalLink style={{ width: '10px', height: '10px' }} />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Complete day button */}
                {allChecked && !isCompleted && (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={onComplete}
                    style={{
                      width: '100%', padding: '14px', borderRadius: '14px',
                      background: 'linear-gradient(135deg, #1a1a1a, #333)', color: '#fff', border: 'none',
                      fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                      marginTop: '8px'
                    }}
                  >
                    ✓ Valider le Jour {day.number}
                  </motion.button>
                )}

                {/* Completion message */}
                {isCompleted && day.completionMessage && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(167,139,250,0.08))', borderRadius: '12px', padding: '12px 16px',
                    border: '1px solid rgba(249,115,22,0.2)'
                  }}>
                    <p style={{ fontSize: '12px', color: '#f97316', fontWeight: 600, margin: 0 }}>
                      ✅ {day.completionMessage}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}