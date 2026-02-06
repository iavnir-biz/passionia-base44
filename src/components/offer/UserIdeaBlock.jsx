import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Lightbulb, Check, Loader2 } from 'lucide-react';

/**
 * Bloc "Tu as deja une idee ?" pour les pages de selection d'offres.
 * Sauvegarde dans session.user_ideas[offerKey]
 *
 * @param {string} sessionId - ID de la session
 * @param {string} offerKey - Cle de l'offre (mainProduct, orderBump, upsell1, upsell3)
 * @param {object} existingIdeas - Objet user_ideas existant sur la session
 */
export default function UserIdeaBlock({ sessionId, offerKey, existingIdeas }) {
  const [idea, setIdea] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (existingIdeas?.[offerKey]) {
      setIdea(existingIdeas[offerKey]);
      setSaved(true);
    }
  }, [existingIdeas, offerKey]);

  const handleSave = async () => {
    if (!idea.trim() || !sessionId) return;
    setSaving(true);
    try {
      const updatedIdeas = { ...(existingIdeas || {}), [offerKey]: idea.trim() };
      await base44.entities.Session.update(sessionId, {
        user_ideas: updatedIdeas
      });
      setSaved(true);
    } catch (err) {
      console.error('[UserIdeaBlock] Error saving idea:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-8 bg-white border border-dashed border-gray-300 rounded-2xl p-5 transition-all hover:border-[#61f7a2]/50">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Tu as deja une idee ?</p>
          <p className="text-xs text-gray-500">Note-la ici — Noah l'utilisera pour affiner ton offre.</p>
        </div>
      </div>

      <textarea
        value={idea}
        onChange={(e) => { setIdea(e.target.value); setSaved(false); }}
        placeholder="Ex: J'ai deja un ebook sur la meditation que je voudrais transformer en formation..."
        className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#61f7a2]/30 focus:border-[#61f7a2] transition-all"
        rows={3}
      />

      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-gray-400">
          {saved ? 'Ton idee est enregistree' : 'Enregistre pour que Noah en tienne compte'}
        </p>
        <button
          onClick={handleSave}
          disabled={saving || !idea.trim() || saved}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            saved
              ? 'bg-green-50 text-green-600 border border-green-200'
              : 'bg-[#61f7a2] text-gray-900 hover:bg-[#4de88f] hover:scale-105'
          } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
        >
          {saving ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Enregistrement...</>
          ) : saved ? (
            <><Check className="w-3.5 h-3.5" /> Enregistre</>
          ) : (
            'Enregistrer mon idee'
          )}
        </button>
      </div>
    </div>
  );
}
