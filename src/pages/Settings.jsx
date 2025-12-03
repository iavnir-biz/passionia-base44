import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useRequireAuth } from '@/components/hooks/useRequireAuth';
import { motion } from "framer-motion";
import { 
  User, 
  RefreshCw, 
  CreditCard, 
  LogOut,
  ChevronRight,
  Sparkles,
  FileText,
  Save
} from "lucide-react";
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import GlowButton from '@/components/ui/GlowButton';

export default function Settings() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const [formData, setFormData] = useState({
    full_name: '',
    passion: '',
    target_audience: '',
    revenue_goal: ''
  });
  
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);
  
  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Load profile
      const profiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        setFormData({
          full_name: currentUser.full_name || '',
          passion: profiles[0].passion || '',
          target_audience: profiles[0].target_audience || '',
          revenue_goal: profiles[0].revenue_goal?.toString() || ''
        });
      }
      
      // Load plan steps for progress
      const steps = await base44.entities.PlanStep.filter({ created_by: currentUser.email });
      const completed = steps.filter(s => s.is_completed).length;
      setProgress(steps.length > 0 ? Math.round((completed / steps.length) * 100) : 0);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async () => {
    setSaving(true);
    try {
      // Update user name
      if (formData.full_name !== user.full_name) {
        await base44.auth.updateMe({ full_name: formData.full_name });
      }
      
      // Update profile
      if (profile) {
        await base44.entities.UserProfile.update(profile.id, {
          passion: formData.passion,
          target_audience: formData.target_audience,
          revenue_goal: parseInt(formData.revenue_goal) || 0
        });
      }
      
      await loadData();
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };
  
  const handleRestartOnboarding = () => {
    navigate(createPageUrl('Onboarding'));
  };
  
  const handleRegenerateDocuments = async () => {
    setRegenerating(true);
    try {
      // Delete all existing documents
      const docs = await base44.entities.Document.filter({ created_by: user.email });
      for (const doc of docs) {
        await base44.entities.Document.delete(doc.id);
      }
      
      // Navigate to documents page to regenerate
      navigate(createPageUrl('Documents'));
    } catch (error) {
      console.error('Error regenerating:', error);
    } finally {
      setRegenerating(false);
    }
  };
  
  const handleLogout = async () => {
    await base44.auth.logout();
  };
  
  const settingsSections = [
    {
      title: 'Profil',
      icon: User,
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Nom complet</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full bg-[#11112b] border border-[#2a2a45] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#61f7a2]"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full bg-[#11112b] border border-[#2a2a45] rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Ta passion / compétence</label>
            <input
              type="text"
              value={formData.passion}
              onChange={(e) => setFormData({ ...formData, passion: e.target.value })}
              className="w-full bg-[#11112b] border border-[#2a2a45] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#61f7a2]"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Ton audience cible</label>
            <input
              type="text"
              value={formData.target_audience}
              onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
              className="w-full bg-[#11112b] border border-[#2a2a45] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#61f7a2]"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Objectif de revenu mensuel (€)</label>
            <input
              type="number"
              value={formData.revenue_goal}
              onChange={(e) => setFormData({ ...formData, revenue_goal: e.target.value })}
              className="w-full bg-[#11112b] border border-[#2a2a45] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#61f7a2]"
            />
          </div>
          <GlowButton onClick={handleSave} loading={saving} icon={Save} className="mt-4">
            Sauvegarder les modifications
          </GlowButton>
        </div>
      )
    },
    {
      title: 'Onboarding',
      icon: RefreshCw,
      content: (
        <div>
          <p className="text-gray-400 mb-4">
            Tu peux recommencer l'onboarding pour mettre à jour tes réponses et régénérer ton analyse.
          </p>
          <GlowButton variant="secondary" onClick={handleRestartOnboarding} icon={RefreshCw}>
            Reprendre l'onboarding
          </GlowButton>
        </div>
      )
    },
    {
      title: 'Documents IA',
      icon: FileText,
      content: (
        <div>
          <p className="text-gray-400 mb-4">
            Régénère tous tes documents IA avec tes nouvelles informations de profil.
          </p>
          <GlowButton variant="secondary" onClick={handleRegenerateDocuments} loading={regenerating} icon={Sparkles}>
            Régénérer tous les documents
          </GlowButton>
        </div>
      )
    },
    {
      title: 'Abonnement',
      icon: CreditCard,
      content: (
        <div>
          <div className="bg-gradient-active border border-[#61f7a2]/20 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">PASSION IA - Accès complet</p>
                <p className="text-gray-400 text-sm">Paiement unique</p>
              </div>
              <span className="px-3 py-1 bg-[#61f7a2]/10 text-[#61f7a2] rounded-full text-sm">
                Actif
              </span>
            </div>
          </div>
          <p className="text-gray-500 text-sm">
            Tu as un accès à vie à tous les documents et fonctionnalités.
          </p>
        </div>
      )
    }
  ];
  
  return (
    <div className="flex min-h-screen bg-[#11112b]">
      <Sidebar currentPage="Settings" progress={progress} />
      
      <div className="flex-1 ml-72">
        <TopBar 
          title="Paramètres" 
          subtitle="Gère ton compte et tes préférences"
          user={user}
        />
        
        <main className="p-8 max-w-3xl">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-[#61f7a2] border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="space-y-6">
              {settingsSections.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#1b1b33] rounded-2xl border border-[#2a2a45] p-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#61f7a2]/10 flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-[#61f7a2]" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">{section.title}</h3>
                  </div>
                  {section.content}
                </motion.div>
              ))}
              
              {/* Logout */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Se déconnecter
                </button>
              </motion.div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}