import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Eye,
  Edit3,
  Check,
  X,
  Loader2,
  Sparkles,
  Target,
  Users,
  MessageCircle,
  Send,
  FileText,
  Clock
} from 'lucide-react';

const assetIcons = [
  { key: 'has_market_analysis', label: 'SWOT', icon: Target },
  { key: 'has_avatars', label: 'Avatars', icon: Users },
  { key: 'has_offers', label: 'Offres', icon: Package },
  { key: 'has_sales_messages', label: 'Messages', icon: MessageCircle },
  { key: 'has_emails', label: 'Emails', icon: Send },
  { key: 'has_sales_page', label: 'Page vente', icon: FileText },
];

/**
 * Carte de session pour le dashboard
 */
export default function SessionCard({
  session,
  isActive,
  isPaid,
  onSelect,
  onRename,
  index
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(session.session_name);
  const [saving, setSaving] = useState(false);

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    await onRename(session.id, editName.trim());
    setSaving(false);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(session.session_name);
    setIsEditing(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const isRegenerating = session.is_regenerating;
  const isGenerating = session.generation_in_progress;
  const isComplete = session.assets_count >= 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative bg-white rounded-2xl border-2 transition-all cursor-pointer hover:shadow-lg ${
        isActive
          ? 'border-[#61f7a2] shadow-md ring-2 ring-[#61f7a2]/20'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => onSelect(session.id)}
    >
      {/* Badge session number */}
      <div className="absolute -top-3 left-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
          isActive ? 'bg-[#61f7a2] text-gray-900' : 'bg-gray-200 text-gray-600'
        }`}>
          #{session.session_number}
        </span>
      </div>

      <div className="p-5 pt-6">
        {/* Header : nom + status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 mr-2">
            {isEditing ? (
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  className="flex-1 text-lg font-bold text-gray-900 border-b-2 border-[#61f7a2] outline-none bg-transparent"
                  autoFocus
                />
                <button onClick={handleSaveName} disabled={saving} className="text-[#61f7a2] hover:text-green-600">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button onClick={handleCancelEdit} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900 truncate">{session.session_name}</h3>
                <button
                  onClick={e => { e.stopPropagation(); setIsEditing(true); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Skill */}
            {session.skill && (
              <p className="text-sm text-gray-500 truncate mt-1">{session.skill}</p>
            )}
          </div>

          {/* Status badge */}
          <div className="flex-shrink-0">
            {isRegenerating ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                <Loader2 className="w-3 h-3 animate-spin" />
                En cours
              </span>
            ) : isGenerating ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                <Loader2 className="w-3 h-3 animate-spin" />
                Génération
              </span>
            ) : isComplete ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                <Sparkles className="w-3 h-3" />
                Complète
              </span>
            ) : session.is_onboarding_done ? (
              <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                Partielle
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                Onboarding
              </span>
            )}
          </div>
        </div>

        {/* Offre principale */}
        {session.main_offer_title && (
          <div className="bg-gray-50 rounded-xl p-3 mb-3">
            <p className="text-xs text-gray-500 mb-1">Offre principale</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{session.main_offer_title}</p>
            {session.main_offer_price && (
              <p className="text-xs text-[#61f7a2] font-bold mt-0.5">{session.main_offer_price}</p>
            )}
          </div>
        )}

        {/* Assets */}
        <div className="flex items-center gap-1.5 mb-3">
          {assetIcons.map(({ key, label, icon: Icon }) => {
            const hasAsset = session[key];
            return (
              <div
                key={key}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  hasAsset ? 'bg-[#61f7a2]/10 text-[#3dd980]' : 'bg-gray-50 text-gray-300'
                }`}
                title={label}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
            );
          })}
          <span className="text-xs text-gray-500 ml-1">{session.assets_count}/{session.assets_total}</span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          {session.created_date && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(session.created_date)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onSelect(session.id)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
          >
            <Eye className="w-4 h-4" />
            Voir
          </button>
        </div>
      </div>
    </motion.div>
  );
}
