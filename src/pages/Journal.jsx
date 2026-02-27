import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useRequirePayment } from '@/components/hooks/useRequirePayment';
import { useSessionManager } from '@/components/hooks/useSessionManager';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import { calculateProgressFromSession } from '@/utils/progressUtils';
import {
  BookOpen,
  Plus,
  Pin,
  PinOff,
  Trash2,
  Link2,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  StickyNote,
  Loader2,
  Search,
  X,
  ExternalLink,
  ChevronDown,
  Clock
} from 'lucide-react';

const JOURNAL_STORAGE_KEY = (sessionId) => `passionia_journal_${sessionId}`;

const CATEGORIES = [
  { id: 'note', label: 'Note libre', icon: StickyNote, color: 'bg-gray-100 text-gray-700 border-gray-200', activeColor: 'bg-gray-900 text-white', dot: 'bg-gray-400' },
  { id: 'link', label: 'Lien utile', icon: Link2, color: 'bg-blue-50 text-blue-700 border-blue-200', activeColor: 'bg-blue-600 text-white', dot: 'bg-blue-400' },
  { id: 'progress', label: 'Avancee', icon: TrendingUp, color: 'bg-green-50 text-green-700 border-green-200', activeColor: 'bg-green-600 text-white', dot: 'bg-green-400' },
  { id: 'blocker', label: 'Blocage', icon: AlertTriangle, color: 'bg-red-50 text-red-700 border-red-200', activeColor: 'bg-red-600 text-white', dot: 'bg-red-400' },
  { id: 'idea', label: 'Idee', icon: Lightbulb, color: 'bg-amber-50 text-amber-700 border-amber-200', activeColor: 'bg-amber-500 text-white', dot: 'bg-amber-400' },
];

function getCategoryConfig(catId) {
  return CATEGORIES.find(c => c.id === catId) || CATEGORIES[0];
}

function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "A l'instant";
  if (diffMins < 60) return `Il y a ${diffMins}min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: diffDays > 365 ? 'numeric' : undefined });
}

export default function Journal() {
  const { isAuthenticated, isLoading: authLoading, user } = useRequirePayment();
  const {
    activeSessionId,
    activeSession,
    loading: sessionsLoading,
  } = useSessionManager();

  const [fullSession, setFullSession] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // New entry form
  const [showForm, setShowForm] = useState(false);
  const [newCategory, setNewCategory] = useState('note');
  const [newContent, setNewContent] = useState('');
  const [newUrl, setNewUrl] = useState('');

  // Filters
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  useEffect(() => {
    if (activeSessionId && isAuthenticated) {
      loadSession(activeSessionId);
    }
  }, [activeSessionId, isAuthenticated]);

  const loadSession = useCallback(async (sessionId) => {
    if (!sessionId) return;
    setLoading(true);
    try {
      // Load from localStorage first for immediate display
      const localRaw = localStorage.getItem(JOURNAL_STORAGE_KEY(sessionId));
      if (localRaw) {
        try {
          const localEntries = JSON.parse(localRaw);
          if (Array.isArray(localEntries)) {
            setEntries(localEntries);
          }
        } catch {}
      }

      // Then sync with backend
      const sessions = await base44.entities.Session.filter({ id: sessionId });
      if (sessions.length > 0) {
        setFullSession(sessions[0]);
        const journalData = sessions[0].journal_entries || [];
        const backendEntries = Array.isArray(journalData) ? journalData : [];
        if (backendEntries.length > 0) {
          setEntries(backendEntries);
          localStorage.setItem(JOURNAL_STORAGE_KEY(sessionId), JSON.stringify(backendEntries));
        }
      }
    } catch (err) {
      console.error('[Journal] Error loading session:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveEntries = useCallback(async (updatedEntries) => {
    if (!activeSessionId) return;
    // Always persist to localStorage immediately
    localStorage.setItem(JOURNAL_STORAGE_KEY(activeSessionId), JSON.stringify(updatedEntries));
    setSaving(true);
    try {
      await base44.entities.Session.update(activeSessionId, {
        journal_entries: updatedEntries
      });
    } catch (err) {
      console.error('[Journal] Error saving entries:', err);
    } finally {
      setSaving(false);
    }
  }, [activeSessionId]);

  const handleAddEntry = async () => {
    if (!newContent.trim()) return;

    const entry = {
      id: Date.now().toString(),
      category: newCategory,
      content: newContent.trim(),
      url: newCategory === 'link' ? newUrl.trim() : '',
      pinned: false,
      created_at: new Date().toISOString(),
    };

    const updated = [entry, ...entries];
    setEntries(updated);
    await saveEntries(updated);

    // Reset form
    setNewContent('');
    setNewUrl('');
    setShowForm(false);
  };

  const handleDeleteEntry = async (entryId) => {
    const updated = entries.filter(e => e.id !== entryId);
    setEntries(updated);
    await saveEntries(updated);
  };

  const handleTogglePin = async (entryId) => {
    const updated = entries.map(e =>
      e.id === entryId ? { ...e, pinned: !e.pinned } : e
    );
    setEntries(updated);
    await saveEntries(updated);
  };

  // Filtered and sorted entries
  const filteredEntries = entries
    .filter(e => {
      if (filterCategory !== 'all' && e.category !== filterCategory) return false;
      if (showPinnedOnly && !e.pinned) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return e.content.toLowerCase().includes(q) || (e.url && e.url.toLowerCase().includes(q));
      }
      return true;
    })
    .sort((a, b) => {
      // Pinned first, then by date
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });

  const pinnedCount = entries.filter(e => e.pinned).length;

  if (authLoading || loading || sessionsLoading) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar currentPage="Journal" progress={0} />
        <div className="flex-1 ml-0 lg:ml-72 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#61f7a2]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar
        currentPage="Journal"
        progress={calculateProgressFromSession(fullSession)}
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 w-full ml-0 lg:ml-72">
        <TopBar
          title="Mon journal de bord"
          subtitle="Tes notes, liens et reflexions"
          user={user}
          onMenuClick={() => setIsSidebarOpen(true)}
          session={fullSession}
        />

        <main className="p-4 sm:p-8 max-w-4xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Mon journal de bord</h1>
                <p className="text-gray-500 text-sm mt-1">
                  {entries.length} note{entries.length !== 1 ? 's' : ''}
                  {activeSession?.session_name && (
                    <span> &middot; {activeSession.session_name}</span>
                  )}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Add entry button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6"
          >
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full flex items-center gap-3 px-5 py-4 bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 hover:border-[#61f7a2] rounded-2xl transition-all text-gray-500 hover:text-gray-700 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 group-hover:border-[#61f7a2] group-hover:bg-[#61f7a2]/10 flex items-center justify-center transition-all">
                  <Plus className="w-5 h-5 group-hover:text-[#61f7a2] transition-colors" />
                </div>
                <span className="font-medium">Ajouter une note...</span>
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-lg"
              >
                {/* Category selector */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const isSelected = newCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setNewCategory(cat.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          isSelected ? cat.activeColor + ' border-transparent shadow-sm' : cat.color
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>

                {/* Content textarea */}
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder={
                    newCategory === 'note' ? 'Ecris ta note ici...' :
                    newCategory === 'link' ? 'Description du lien...' :
                    newCategory === 'progress' ? "Qu'as-tu accompli ?" :
                    newCategory === 'blocker' ? 'Decris ce qui te bloque...' :
                    'Decris ton idee...'
                  }
                  className="w-full border border-gray-200 rounded-xl p-4 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all bg-gray-50/50 min-h-[100px]"
                  rows={4}
                  autoFocus
                />

                {/* URL field for links */}
                {newCategory === 'link' && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-gray-50/50 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all">
                      <Link2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <input
                        type="url"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => { setShowForm(false); setNewContent(''); setNewUrl(''); }}
                    className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddEntry}
                    disabled={!newContent.trim() || saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Ajouter
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Filters */}
          {entries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              {/* Search */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-gray-50/50 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all">
                  <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher dans mes notes..."
                    className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {pinnedCount > 0 && (
                  <button
                    onClick={() => setShowPinnedOnly(!showPinnedOnly)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      showPinnedOnly
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    <Pin className="w-3.5 h-3.5" />
                    {pinnedCount}
                  </button>
                )}
              </div>

              {/* Category filters */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    filterCategory === 'all'
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Tout ({entries.length})
                </button>
                {CATEGORIES.map(cat => {
                  const count = entries.filter(e => e.category === cat.id).length;
                  if (count === 0) return null;
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setFilterCategory(cat.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        filterCategory === cat.id ? cat.activeColor + ' border-transparent' : cat.color
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {cat.label} ({count})
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Entries list */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredEntries.map((entry) => {
                const cat = getCategoryConfig(entry.category);
                const CatIcon = cat.icon;

                return (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`bg-white border rounded-2xl p-4 sm:p-5 transition-all hover:shadow-md group ${
                      entry.pinned ? 'border-amber-300 shadow-sm' : 'border-gray-200'
                    }`}
                  >
                    {/* Top row: category + actions */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${cat.color}`}>
                          <CatIcon className="w-3.5 h-3.5" />
                          {cat.label}
                        </span>
                        {entry.pinned && (
                          <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleTogglePin(entry.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-amber-500 transition-all"
                          title={entry.pinned ? 'Desepingler' : 'Epingler'}
                        >
                          {entry.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                      {entry.content}
                    </p>

                    {/* URL if link */}
                    {entry.url && (
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-blue-700 text-xs font-medium transition-all truncate"
                      >
                        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{entry.url}</span>
                      </a>
                    )}

                    {/* Timestamp */}
                    <div className="mt-3 flex items-center gap-1.5 text-gray-400 text-xs">
                      <Clock className="w-3 h-3" />
                      {formatDate(entry.created_at)}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Empty states */}
          {entries.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 mx-auto mb-6 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ton journal est vide</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Commence a noter tes idees, liens utiles, avancees et blocages. Tout est sauvegarde automatiquement.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md"
              >
                <Plus className="w-5 h-5" />
                Ecrire ma premiere note
              </button>
            </motion.div>
          )}

          {entries.length > 0 && filteredEntries.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Search className="w-10 h-10 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">Aucune note ne correspond a ta recherche</p>
              <button
                onClick={() => { setSearchQuery(''); setFilterCategory('all'); setShowPinnedOnly(false); }}
                className="mt-3 text-indigo-600 text-sm font-medium hover:underline"
              >
                Reinitialiser les filtres
              </button>
            </motion.div>
          )}

          {/* Saving indicator */}
          <AnimatePresence>
            {saving && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm shadow-lg"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                Sauvegarde...
              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>
    </div>
  );
}
