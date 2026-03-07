import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useActiveSession } from '@/components/hooks/useActiveSession';
import NoahSidebar from '@/components/dashboard-noah/NoahSidebar';
import NoahHeader from '@/components/dashboard-noah/NoahHeader';
import MessageCardNoah from '@/components/dashboard-noah/MessageCardNoah';

const MESSAGE_TYPES = [
  {
    id: 'diagnostic',
    title: 'Le Diagnostic',
    subtitle: 'Message 1',
    objective: 'Ouvrir la conversation sans vendre',
    tone: 'Curiosité professionnelle'
  },
  {
    id: 'empathy',
    title: 'L\'Empathie',
    subtitle: 'Message 2',
    objective: 'Créer un lien humain et de confiance',
    tone: 'Chaleureux, vécu réel'
  },
  {
    id: 'solution',
    title: 'La Solution',
    subtitle: 'Message 3',
    objective: 'Introduire le produit comme une évidence',
    tone: 'Calme, sûr, sans push'
  },
  {
    id: 'purchase',
    title: 'L\'Achat',
    subtitle: 'Message 4',
    objective: 'Transformer l\'échange en opportunité concrète',
    tone: 'Clair, assumé, simple'
  }
];

export default function MesMessagesNoah() {
  const { user, session, loading, reload: reloadSession } = useActiveSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState({});
  const [generatedMessages, setGeneratedMessages] = useState({});

  // Load messages from session when it loads
  useEffect(() => {
    if (session?.generated_sales_messages && Object.keys(session.generated_sales_messages).length > 0) {
      setGeneratedMessages(session.generated_sales_messages);
    }
  }, [session]);

  const handleGenerate = async (messageType) => {
    if (!session?.id) return;
    setLoadingMsgs(prev => ({ ...prev, [messageType]: true }));
    try {
      const response = await base44.functions.invoke('generateSalesMessage', {
        messageType,
        sessionId: session.id
      });
      const updated = { ...generatedMessages, [messageType]: response.data };
      setGeneratedMessages(updated);
      await base44.entities.Session.update(session.id, { generated_sales_messages: updated });
      await reloadSession();
      toast.success('Message généré !');
    } catch (error) {
      console.error('[MesMessagesNoah] Error generating:', error);
      toast.error('Erreur lors de la génération');
    } finally {
      setLoadingMsgs(prev => ({ ...prev, [messageType]: false }));
    }
  };

  const handleCopy = (message) => {
    navigator.clipboard.writeText(message.content);
    toast.success('Copié !');
  };

  const handleDownload = (message, msgType) => {
    const blob = new Blob([message.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `message-${msgType.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#1a1a1a] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white"
         style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <NoahSidebar currentPage="MesMessagesNoah" user={user} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 w-full lg:ml-64">
        <NoahHeader onMenuClick={() => setSidebarOpen(true)} onToggleSidebar={() => {}} />

        <main style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 20px 60px' }}>
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '24px' }}>
            <h1 style={{
              fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 600,
              letterSpacing: '-0.03em', color: '#1a1a1a', marginBottom: '6px'
            }}>
              Messages de vente
            </h1>
            <p style={{ fontSize: '14px', color: '#888' }}>
              4 messages pour vendre ton produit principal sans forcer, en DM, email ou vocal.
            </p>
          </motion.div>

          {/* Info banner */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            style={{
              background: '#fafafa', border: '1px solid #e5e5e5', borderRadius: '16px',
              padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '12px'
            }}
          >
            <span style={{ fontSize: '18px', flexShrink: 0 }}>💬</span>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', marginBottom: '4px' }}>
                Comment utiliser ces messages ?
              </p>
              <p style={{ fontSize: '12px', color: '#888', lineHeight: 1.5 }}>
                Envoie-les aux bonnes personnes en DM Instagram/LinkedIn, par email, ou adapte-les en vocal. Chaque message a un objectif précis dans la conversation.
              </p>
            </div>
          </motion.div>

          {/* Message Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {MESSAGE_TYPES.map((msgType, idx) => (
              <MessageCardNoah
                key={msgType.id}
                msgType={msgType}
                message={generatedMessages[msgType.id]}
                isLoading={loadingMsgs[msgType.id]}
                onGenerate={() => handleGenerate(msgType.id)}
                onCopy={() => handleCopy(generatedMessages[msgType.id])}
                onPreview={() => {}}
                onDownload={() => handleDownload(generatedMessages[msgType.id], msgType)}
                index={idx}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}