import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from "framer-motion";
import { User, Mail, Lock, Sparkles, ArrowRight } from "lucide-react";
import GlowButton from '@/components/ui/GlowButton';

export default function Register() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuthenticated = await base44.auth.isAuthenticated();
      if (isAuthenticated) {
        navigate(createPageUrl('Dashboard'));
      }
    } catch (err) {
      // Not authenticated, stay on register
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await base44.auth.register(email, password, { full_name: firstName });
      navigate(createPageUrl('Onboarding'));
    } catch (err) {
      if (err.message?.includes('already exists')) {
        setError('Cet email est déjà utilisé');
      } else {
        setError('Erreur lors de la création du compte');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#11112b] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#61f7a2] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#11112b] flex items-center justify-center p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#61f7a2]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#61f7a2]/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#61f7a2] mx-auto mb-4 flex items-center justify-center glow-green">
            <Sparkles className="w-8 h-8 text-[#11112b]" />
          </div>
          <h1 className="text-2xl font-bold text-white">PASSION IA</h1>
        </div>

        {/* Card */}
        <div className="bg-[#1b1b33] rounded-3xl border border-[#2a2a45] p-8">
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Crée ton espace PASSION IA
          </h2>
          <p className="text-gray-400 text-center mb-8">
            Transforme ta passion en business rentable
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* First name */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Prénom</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ton prénom"
                  required
                  className="w-full bg-[#11112b] border border-[#2a2a45] rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#61f7a2] focus:ring-1 focus:ring-[#61f7a2]/20 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ton@email.com"
                  required
                  className="w-full bg-[#11112b] border border-[#2a2a45] rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#61f7a2] focus:ring-1 focus:ring-[#61f7a2]/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-[#11112b] border border-[#2a2a45] rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#61f7a2] focus:ring-1 focus:ring-[#61f7a2]/20 transition-all"
                />
              </div>
              <p className="text-gray-500 text-xs mt-1">Minimum 6 caractères</p>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            {/* Submit */}
            <GlowButton
              type="submit"
              loading={loading}
              className="w-full mt-6"
            >
              Créer mon compte
              <ArrowRight className="w-5 h-5 ml-2" />
            </GlowButton>
          </form>

          {/* Link to login */}
          <p className="text-center text-gray-400 mt-6">
            J'ai déjà un compte{' '}
            <Link
              to={createPageUrl('Login')}
              className="text-[#61f7a2] hover:underline font-medium"
            >
              → Connexion
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}