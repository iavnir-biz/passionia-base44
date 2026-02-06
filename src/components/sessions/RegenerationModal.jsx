import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';

/**
 * Modal de confirmation avant régénération d'une session
 * Avertit que les données seront écrasées
 */
export default function RegenerationModal({ isOpen, onClose, onConfirm, sessionName, loading }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 pb-4">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Recommencer cette session ?</h2>
                {sessionName && (
                  <p className="text-sm text-gray-500">{sessionName}</p>
                )}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <p className="text-amber-900 text-sm leading-relaxed font-medium mb-2">
                Attention : cette action va effacer toutes les donnees de cette session.
              </p>
              <ul className="text-amber-800 text-sm space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">-</span>
                  Les anciennes offres seront perdues
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">-</span>
                  Tous les documents seront supprimes
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">-</span>
                  Tu devras refaire tout l'onboarding
                </li>
              </ul>
            </div>

            <p className="text-gray-600 text-sm">
              Cette action est <span className="font-bold text-gray-900">irreversible</span>. Es-tu sur de vouloir continuer ?
            </p>
          </div>

          {/* Actions */}
          <div className="p-6 pt-2 flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Oui, recommencer
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
