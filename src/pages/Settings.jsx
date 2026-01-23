import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useRequirePayment } from '@/components/hooks/useRequirePayment';
import { calculateProgressFromSession } from '@/utils/progressUtils';
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
  const { isAuthenticated, hasPurchased, isLoading: authLoading } = useRequirePayment();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    avatar_url: '',
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
      let profileData = profiles.length > 0 ? profiles[0] : null;

      // Load session for onboarding data and progress
      const sessions = await base44.entities.Session.filter({ created_by: currentUser.email });
      if (sessions.length > 0) {
        setSession(sessions[0]);
      }

      if (profileData) {
        setProfile(profileData);
      }

      // Merge data: Profile data + Session onboarding data
      setFormData({
        first_name: profileData?.first_name || currentUser.firstName || '',
        last_name: profileData?.last_name || '',
        avatar_url: profileData?.avatar_url || currentUser.profile_picture || '',
        passion: profileData?.passion || sessions[0]?.onboarding_summary?.who_to_teach || '',
        target_audience: profileData?.target_audience || sessions[0]?.onboarding_summary?.learner_profile || '',
        revenue_goal: profileData?.revenue_goal?.toString() || sessions[0]?.potential_revenue?.toString() || ''
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update user full_name
      const fullName = `${formData.first_name} ${formData.last_name}`.trim();
      await base44.auth.updateMe({
        full_name: fullName,
        profile_picture: formData.avatar_url
      });

      // Update profile
      if (profile) {
        await base44.entities.UserProfile.update(profile.id, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          avatar_url: formData.avatar_url,
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
            <label className="block text-sm text-gray-700 font-medium mb-2">Photo de profil</label>
            <div className="flex items-center gap-4">
              {formData.avatar_url ? (
                <img
                  src={formData.avatar_url}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const { file_url } = await base44.integrations.Core.UploadFile({ file });
                      setFormData({ ...formData, avatar_url: file_url });
                    } catch (error) {
                      console.error('Error uploading photo:', error);
                    }
                  }
                }}
                className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#61f7a2]/10 file:text-[#61f7a2] hover:file:bg-[#61f7a2]/20 file:cursor-pointer"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 font-medium mb-2">Prénom</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#61f7a2] focus:ring-1 focus:ring-[#61f7a2] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 font-medium mb-2">Nom</label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#61f7a2] focus:ring-1 focus:ring-[#61f7a2] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 font-medium mb-2">Ta passion / compétence</label>
            <input
              type="text"
              value={formData.passion}
              onChange={(e) => setFormData({ ...formData, passion: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#61f7a2] focus:ring-1 focus:ring-[#61f7a2] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 font-medium mb-2">Ton audience cible</label>
            <input
              type="text"
              value={formData.target_audience}
              onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#61f7a2] focus:ring-1 focus:ring-[#61f7a2] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 font-medium mb-2">Objectif de revenu mensuel (€)</label>
            <input
              type="number"
              value={formData.revenue_goal}
              onChange={(e) => setFormData({ ...formData, revenue_goal: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#61f7a2] focus:ring-1 focus:ring-[#61f7a2] transition-all"
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
          <p className="text-gray-600 mb-4">
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
          <p className="text-gray-600 mb-4">
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
                <p className="text-purple-100 text-sm">Paiement unique</p>
              </div>
              <span className="px-3 py-1 bg-[#61f7a2]/20 text-[#61f7a2] rounded-full text-sm font-semibold border border-[#61f7a2]/30">
                Actif
              </span>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            Tu as un accès à vie à tous les documents et fonctionnalités.
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar
        currentPage="Settings"
        progress={calculateProgressFromSession(session)}
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 ml-0 lg:ml-72">
        <TopBar
          title="Paramètres"
          subtitle="Gère ton compte et tes préférences"
          user={user}
          onMenuClick={() => setIsSidebarOpen(true)}
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
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#61f7a2]/10 flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-[#61f7a2]" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{section.title}</h3>
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
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gray-50 text-gray-600 hover:bg-gray-100/80 hover:text-red-600 transition-all border border-gray-100"
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