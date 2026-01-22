import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { User, Upload, Loader2, CheckCircle } from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';
import { toast } from 'sonner';

export default function SetupProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    avatar_url: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Vérifier si profil existe
      const profiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
      if (profiles.length > 0) {
        const existingProfile = profiles[0];
        setProfile(existingProfile);
        setFormData({
          first_name: existingProfile.first_name || currentUser.firstName || '',
          last_name: existingProfile.last_name || '',
          avatar_url: existingProfile.avatar_url || currentUser.profile_picture || ''
        });
      } else {
        // Pré-remplir avec user.firstName si dispo
        setFormData({
          first_name: currentUser.firstName || '',
          last_name: '',
          avatar_url: currentUser.profile_picture || ''
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, avatar_url: file_url });
      toast.success('Photo ajoutée !');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erreur lors du téléchargement');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.first_name.trim()) {
      toast.error('Le prénom est obligatoire');
      return;
    }

    setSaving(true);
    try {
      // 1. Sauvegarder le profil
      if (profile) {
        await base44.entities.UserProfile.update(profile.id, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          avatar_url: formData.avatar_url
        });
      } else {
        await base44.entities.UserProfile.create({
          first_name: formData.first_name,
          last_name: formData.last_name,
          avatar_url: formData.avatar_url
        });
      }

      // Update User.full_name pour synchronisation
      await base44.auth.updateMe({ 
        full_name: `${formData.first_name} ${formData.last_name}`.trim(),
        profile_picture: formData.avatar_url 
      });

      toast.success('Profil enregistré !');
      
      // 🔥 NOUVEAU : Redirect direct vers Dashboard
      console.log('[SetupProfile] Profil sauvegardé → Dashboard');
      navigate(createPageUrl('Dashboard'));
      
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Erreur lors de la sauvegarde');
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    // 🔥 NOUVEAU : Redirect direct vers Dashboard
    console.log('[SetupProfile] Skip → Dashboard');
    navigate(createPageUrl('Dashboard'));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#61f7a2] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg"
        >
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Complète ton profil
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Personnalise ton espace pour commencer
          </p>

          {/* Avatar Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo de profil
            </label>
            <div className="flex items-center gap-4">
              {formData.avatar_url ? (
                <img
                  src={formData.avatar_url}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              )}
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 transition-all">
                  {uploading ? (
                    <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 text-gray-600" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {uploading ? 'Upload...' : 'Choisir une photo'}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {/* First Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prénom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              placeholder="Comment tu t'appelles ?"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:border-[#61f7a2] focus:ring-1 focus:ring-[#61f7a2] transition-all"
            />
          </div>

          {/* Last Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom (optionnel)
            </label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              placeholder="Ton nom de famille"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:border-[#61f7a2] focus:ring-1 focus:ring-[#61f7a2] transition-all"
            />
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <GlowButton
              onClick={handleSave}
              loading={saving}
              disabled={!formData.first_name.trim()}
              icon={CheckCircle}
              className="w-full"
              size="lg"
            >
              Enregistrer et continuer
            </GlowButton>
            <button
              onClick={handleSkip}
              className="w-full py-3 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              disabled={saving}
            >
              Passer cette étape
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}