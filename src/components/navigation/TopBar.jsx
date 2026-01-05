import React from 'react';
import { Bell, User } from "lucide-react";

export default function TopBar({ title, subtitle, user }) {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
      <div>
        {subtitle && <p className="text-gray-600 text-sm mt-0.5">{subtitle}</p>}
      </div>
      
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all">
          <Bell className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#61f7a2] to-[#4de88f] flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.full_name || 'Utilisateur'}</p>
            <p className="text-xs text-gray-600">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}