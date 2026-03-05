import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { User, Save, Loader2 } from 'lucide-react';

export default function SettingsProfileTab({ user, profile, session, onReload }) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || user?.full_name?.split(' ')[0] || '',
    last_name: profile?.last_name || user?.full_name?.split(' ').slice(1).join(' ') || '',
    avatar_url: profile?.avatar_url || user?.profile_picture || '',
    bio: profile?.bio || '',
    passion: profile?.passion || session?.onboarding_summary?.who_to_teach || '',
    target_audience: profile?.target_audience || session?.onboarding_summary?.learner_profile || '',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const fullName = `${formData.first_name} ${formData.last_name}`.trim();
      await base44.auth.updateMe({ full_name: fullName, profile_picture: formData.avatar_url });
      if (profile?.id) {
        await base44.entities.UserProfile.update(profile.id, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          avatar_url: formData.avatar_url,
          passion: formData.passion,
          target_audience: formData.target_audience,
        });
      }
      onReload?.();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e5e5', borderRadius: '16px',
      padding: '28px', maxWidth: '600px'
    }}>
      {/* Avatar + Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #f0f0f0' }}>
        {formData.avatar_url ? (
          <img src={formData.avatar_url} alt="" style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e5e5' }} />
        ) : (
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User style={{ width: '24px', height: '24px', color: '#888' }} />
          </div>
        )}
        <div>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>
            {formData.first_name} {formData.last_name}
          </p>
          <p style={{ fontSize: '13px', color: '#888' }}>{user?.email}</p>
        </div>
      </div>

      {/* Photo upload */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
          Photo de profil
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              const { file_url } = await base44.integrations.Core.UploadFile({ file });
              setFormData({ ...formData, avatar_url: file_url });
            }
          }}
          style={{ fontSize: '13px', color: '#666' }}
        />
      </div>

      {/* Fields */}
      {[
        { label: 'NOM COMPLET', value: `${formData.first_name} ${formData.last_name}`, key: 'fullname' },
      ].map(() => null)}

      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
          Prénom
        </label>
        <input
          type="text"
          value={formData.first_name}
          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: '12px',
            border: '1px solid #e5e5e5', background: '#fafafa',
            fontSize: '14px', color: '#1a1a1a', outline: 'none'
          }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
          Nom
        </label>
        <input
          type="text"
          value={formData.last_name}
          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: '12px',
            border: '1px solid #e5e5e5', background: '#fafafa',
            fontSize: '14px', color: '#1a1a1a', outline: 'none'
          }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
          Ta passion / compétence
        </label>
        <input
          type="text"
          value={formData.passion}
          onChange={(e) => setFormData({ ...formData, passion: e.target.value })}
          placeholder="Ex: coaching en développement personnel"
          style={{
            width: '100%', padding: '12px 16px', borderRadius: '12px',
            border: '1px solid #e5e5e5', background: '#fafafa',
            fontSize: '14px', color: '#1a1a1a', outline: 'none'
          }}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
          Ton audience cible
        </label>
        <input
          type="text"
          value={formData.target_audience}
          onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
          placeholder="Ex: entrepreneurs débutants"
          style={{
            width: '100%', padding: '12px 16px', borderRadius: '12px',
            border: '1px solid #e5e5e5', background: '#fafafa',
            fontSize: '14px', color: '#1a1a1a', outline: 'none'
          }}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '12px 24px', borderRadius: '12px',
          background: '#1a1a1a', color: '#fff', border: 'none',
          fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          opacity: saving ? 0.6 : 1
        }}
      >
        {saving ? <Loader2 style={{ width: '14px', height: '14px' }} className="animate-spin" /> : <Save style={{ width: '14px', height: '14px' }} />}
        Sauvegarder les modifications
      </button>
    </div>
  );
}