import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useRequireAuth } from '@/components/hooks/useRequireAuth';
import { motion } from 'framer-motion';
import { FileText, Sparkles, Loader2 } from 'lucide-react';
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import OfferGenerationCard from '@/components/offer/OfferGenerationCard';

const offerCards = [
  {
    id: 'high',
    title: 'Offre premium',
    subtitle: 'High ticket',
    type: 'offre_premium'
  },
  {
    id: 'mid',
    title: 'Offre intermédiaire',
    subtitle: 'Mid ticket',
    type: 'offre_superieure'
  },
  {
    id: 'bump',
    title: 'Vente additionnelle',
    subtitle: 'Order bump',
    type: 'petit_extra'
  },
  {
    id: 'low',
    title: 'Produit d\'appel',
    subtitle: 'Low ticket',
    type: 'product_principal'
  },
  {
    id: 'complete',
    title: 'Ton offre structurée',
    subtitle: 'Offre complète',
    type: 'complete'
  }
];

export default function Offre() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [generatedCount, setGeneratedCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      loadUser();
    }
  }, [isAuthenticated]);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      if (currentUser.sessionId) {
        setSessionId(currentUser.sessionId);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleGenerated = () => {
    setGeneratedCount(prev => prev + 1);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen bg-[#11112b]">
        <Sidebar currentPage="Offre" progress={0} />
        <div className="flex-1 ml-72">
          <div className="flex items-center justify-center h-screen">
            <Loader2 className="w-8 h-8 animate-spin text-[#61f7a2]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#11112b]">
      <Sidebar currentPage="Offre" progress={0} />
      
      <div className="flex-1 ml-72">
        <TopBar 
          title="Offre" 
          subtitle={`${generatedCount}/5 générées`}
          user={user}
        />
        
        <main className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl">
            {offerCards.map((card, index) => (
              <OfferGenerationCard
                key={card.id}
                offer={card}
                user={user}
                sessionId={sessionId}
                onGenerated={handleGenerated}
                delay={index * 0.1}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}