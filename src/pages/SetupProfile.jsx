import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { User, Upload, Loader2, ArrowRight, Camera } from 'lucide-react';
import { toast } from 'sonner';

export default function SetupProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    avatar_url: ''
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const profiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
      if (profiles.length > 0) {
        const existing = profiles[0];
        setProfile(existing);
        setFormData({
          first_name: existing.first_name || currentUser.firstName || '',
          avatar_url: existing.avatar_url || currentUser.profile_picture || ''
        });
      } else {
        setFormData({
          first_name: currentUser.firstName || '',
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
      setFormData(prev => ({ ...prev, avatar_url: file_url }));
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
      if (profile) {
        await base44.entities.UserProfile.update(profile.id, {
          first_name: formData.first_name,
          avatar_url: formData.avatar_url
        });
      } else {
        await base44.entities.UserProfile.create({
          first_name: formData.first_name,
          avatar_url: formData.avatar_url
        });
      }

      await base44.auth.updateMe({
        full_name: formData.first_name.trim(),
        profile_picture: formData.avatar_url
      });

      navigate(createPageUrl('DashboardNoah'));
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Erreur lors de la sauvegarde');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#1a1a1a] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12"
         style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Neon circles */}
      <div style={{ position: 'fixed', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)', top: '5%', right: '-5%', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)', bottom: '10%', left: '-5%', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)', top: '40%', left: '50%', transform: 'translateX(-50%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div className="max-w-md w-full relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '32px' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#f5f5f5', border: '1px solid #e8e8e8', borderRadius: '100px',
            padding: '6px 16px', fontSize: '13px', color: '#666'
          }}>
            <span style={{ fontSize: '16px' }}>👋</span>
            Dernière étape
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 40px)',
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            color: '#1a1a1a',
            marginBottom: '12px'
          }}>
            Personnalise ton{' '}
            <span style={{
              fontStyle: 'italic',
              fontWeight: 500,
              background: 'linear-gradient(135deg, #f97316, #ec4899, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>espace</span>
          </h1>
          <p style={{ fontSize: '16px', color: '#888', lineHeight: 1.6 }}>
            Ajoute ta photo pour personnaliser ton dashboard.
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: '#fff', border: '1px solid #e5e5e5', borderRadius: '20px',
            padding: '32px', marginBottom: '24px'
          }}
        >
          {/* Avatar Upload */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              {formData.avatar_url ? (
                <img
                  src={formData.avatar_url}
                  alt="Avatar"
                  style={{
                    width: '100px', height: '100px', borderRadius: '50%',
                    objectFit: 'cover', border: '3px solid #e5e5e5'
                  }}
                />
              ) : (
                <div style={{
                  width: '100px', height: '100px', borderRadius: '50%',
                  background: '#f5f5f5', border: '2px dashed #d5d5d5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <User style={{ width: '40px', height: '40px', color: '#ccc' }} />
                </div>
              )}
              <label style={{
                position: 'absolute', bottom: '0', right: '0',
                width: '32px', height: '32px', borderRadius: '50%',
                background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', border: '2px solid #fff'
              }}>
                {uploading ? (
                  <Loader2 style={{ width: '14px', height: '14px', color: '#fff' }} className="animate-spin" />
                ) : (
                  <Camera style={{ width: '14px', height: '14px', color: '#fff' }} />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
              </label>
            </div>
            <button
              onClick={() => document.querySelector('input[type="file"]').click()}
              disabled={uploading}
              style={{
                background: 'none', border: 'none', fontSize: '13px',
                color: '#888', cursor: 'pointer', fontWeight: 500,
                fontFamily: "'Inter', sans-serif"
              }}
            >
              {uploading ? 'Upload en cours...' : formData.avatar_url ? 'Changer la photo' : 'Ajouter une photo'}
            </button>
          </div>

          {/* First Name — pre-filled */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#666', marginBottom: '8px' }}>
              Prénom
            </label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
              placeholder="Ton prénom"
              style={{
                width: '100%', padding: '14px 16px', borderRadius: '14px',
                border: '1px solid #e5e5e5', fontSize: '15px', color: '#1a1a1a',
                outline: 'none', fontFamily: "'Inter', sans-serif",
                transition: 'border-color 0.2s', background: '#fff',
                boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#1a1a1a'}
              onBlur={e => e.target.style.borderColor = '#e5e5e5'}
            />
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ textAlign: 'center' }}
        >
          <button
            onClick={handleSave}
            disabled={saving || !formData.first_name.trim()}
            style={{
              background: '#1a1a1a', color: '#fff', border: 'none',
              padding: '16px 36px', borderRadius: '100px', fontSize: '15px',
              fontWeight: 600, cursor: 'pointer', display: 'inline-flex',
              alignItems: 'center', gap: '8px', transition: 'opacity 0.2s',
              fontFamily: "'Inter', sans-serif",
              opacity: saving || !formData.first_name.trim() ? 0.5 : 1
            }}
            onMouseOver={e => { if (!saving) e.currentTarget.style.opacity = '0.85'; }}
            onMouseOut={e => { if (!saving) e.currentTarget.style.opacity = '1'; }}
          >
            {saving ? (
              <>
                <Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                Accéder à mon dashboard <ArrowRight size={16} />
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}