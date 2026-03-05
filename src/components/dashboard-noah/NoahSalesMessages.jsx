import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { MessageCircle, ArrowRight, Sparkles, Loader2, CheckCircle } from 'lucide-react';

export default function NoahSalesMessages({ session }) {
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const messages = session?.generated_sales_messages;
  const hasMessages = Array.isArray(messages) && messages.length > 0;

  const handleGenerate = async () => {
    if (!session?.id) return;
    setGenerating(true);
    try {
      await base44.functions.invoke('generateSalesMessage', { sessionId: session.id });
      window.location.reload();
    } catch (error) {
      console.error('Error generating messages:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      style={{
        background: '#fff', border: '1px solid #e5e5e5', borderRadius: '20px',
        padding: '24px', marginBottom: '24px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: '#1a1a1a',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <MessageCircle style={{ width: '18px', height: '18px', color: '#fff' }} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.01em' }}>
            Messages de vente
          </h3>
        </div>

        {hasMessages && (
          <button
            onClick={() => navigate(createPageUrl('MesMessagesNoah'))}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '12px', fontWeight: 500, color: '#888', background: 'none',
              border: 'none', cursor: 'pointer', padding: 0
            }}
          >
            Voir tout <ArrowRight size={12} />
          </button>
        )}
      </div>

      {hasMessages ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {messages.slice(0, 3).map((msg, idx) => (
            <div
              key={idx}
              onClick={() => navigate(createPageUrl('MesMessagesNoah'))}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: '12px', border: '1px solid #f0f0f0',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
              className="hover:border-[#ccc] hover:bg-[#fafafa]"
            >
              <CheckCircle style={{ width: '14px', height: '14px', color: '#1a1a1a', flexShrink: 0 }} />
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#1a1a1a', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {msg.title || msg.name || `Message ${idx + 1}`}
              </p>
              <ArrowRight style={{ width: '12px', height: '12px', color: '#ccc', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>
            Génère tes messages de vente pour ton produit principal.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#1a1a1a', color: '#fff', border: 'none',
              padding: '12px 24px', borderRadius: '100px', fontSize: '13px',
              fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s',
              opacity: generating ? 0.6 : 1
            }}
          >
            {generating ? (
              <><Loader2 style={{ width: '14px', height: '14px' }} className="animate-spin" /> Génération...</>
            ) : (
              <><Sparkles style={{ width: '14px', height: '14px' }} /> Générer avec Noah</>
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
}