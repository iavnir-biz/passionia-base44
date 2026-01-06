import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Bell, User, Search, Settings, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TopBar({ user }) {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une ressource, une action du jour..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-[#61f7a2] focus:ring-1 focus:ring-[#61f7a2] transition-all"
          />
        </div>
      </div>
      
      {/* Right Section */}
      <div className="flex items-center gap-3 ml-6">
        {/* Notifications */}
        <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#61f7a2] rounded-full" />
        </button>
        
        {/* User Avatar with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            {user?.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.full_name}
                className="w-9 h-9 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
            <ChevronDown className={cn(
              "w-4 h-4 text-gray-600 transition-transform",
              showUserMenu && "rotate-180"
            )} />
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{user?.full_name || 'Utilisateur'}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{user?.email || ''}</p>
                </div>

                {/* Menu Items */}
                <button
                  onClick={() => {
                    navigate(createPageUrl('Settings'));
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left border-t border-gray-100 mt-1"
                >
                  <Settings className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Paramètres</span>
                </button>

                <button
                  onClick={() => {
                    base44.auth.logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-600">Déconnexion</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}